import chalk from 'chalk';
import cors, { CorsOptions } from 'cors';
import { Server } from 'http';
import { Request, Response, NextFunction, RequestHandler } from 'express';

import { getAllowedHosts, getPort } from 'src/utils';

export const routeDebuggingMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', req.headers);
  next();
};

const isWildcardUsed = () => {
  const allowedHosts = getAllowedHosts();

  // Wildcard case - disable credentials
  if (allowedHosts?.length && allowedHosts[0] === '*') {
    return true;
  }

  return false;
};

export const handleAppCors = (): RequestHandler | undefined => {
  if (isWildcardUsed()) {
    return cors(); // Same as app.use(cors()) — default permissive behavior
  }

  // Otherwise, return a no-op middleware that just calls next()
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};

// TODO REVIEW FUNCTION! TYPES MAYBE INCORRECT
export const getCorsOptions = (): CorsOptions | undefined => {
  const wildcardIsActive = isWildcardUsed();

  // Wildcard is in use - credentials are disabled at root app level (see: app.use(handleAppCors());)
  if (wildcardIsActive) {
    return;
    // return {
    //   origin: '*',
    //   credentials: false,
    // };
  }

  const allowedHosts = getAllowedHosts();

  return {
    origin: allowedHosts.join(','),
    credentials: true,
  };

  // Specific hosts - must handle origin validation dynamically
  // return {
  //   origin: (origin, callback) => {
  //     if (!origin || allowedHosts.includes(origin)) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error(`Not allowed by CORS: ${origin}`));
  //     }
  //   },
  //   credentials: true,
  // };
};

export const corsMiddleware = () => {
  return cors(getCorsOptions());
};

export const shutdown = (server: Server, input: string) => {
  console.log(`Received ${input}. Gracefully shutting down.`);
  server.close();
  process.exit(0);
};

export const logServerStartup = () => {
  const port = getPort();

  console.log(`\n${chalk.green('✔')} Your GraphQL Fake API is ready to use 🚀
    Here are your links:
  
    ${chalk.blue('❯')} GraphQL API:        http://localhost:${port}/graphql
    ${chalk.blue('❯')} GraphQL Voyager:    http://localhost:${port}/voyager
    ${chalk.blue('❯')} Extended Schema:    http://localhost:${port}/user-sdl
  
    `);
};
