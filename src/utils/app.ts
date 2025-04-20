import * as chalk from 'chalk';
import * as open from 'open';
import * as cors from 'cors';

import { getAllowedHosts, getPort, getOpenBrowser } from 'src/utils';

export const routeDebuggingMiddleware = (req, _, next) => {
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

export const shutdown = (server) => {
  server.close();
  process.exit(0);
};

export const logServerStartup = () => {
  const port = getPort();

  console.log(`\n${chalk.green('✔')} Your GraphQL Fake API is ready to use 🚀
    Here are your links:
  
    ${chalk.blue('❯')} GraphQL API:        http://localhost:${port}/graphql
    ${chalk.blue('❯')} GraphQL Voyager:    http://localhost:${port}/voyager
  
    `);
};

export const openEditorInBrowser = () => {
  const openBrowser = getOpenBrowser();

  if (openBrowser) {
    const port = getPort();
    setTimeout(() => open(`http://localhost:${port}/editor`), 500);
  }
};
