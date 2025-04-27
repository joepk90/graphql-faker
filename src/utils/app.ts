import chalk from 'chalk';
import cors from 'cors';
import { Server } from 'http';
import { Request, Response, NextFunction } from 'express';

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

export const getCorsOptions = () => {
  return {
    credentials: true,
    origin: getAllowedHosts(),
  };
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
