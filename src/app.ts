#!/usr/bin/env node

import * as bodyParser from 'body-parser';
import * as express from 'express';

import {
  editorDir,
  shutdown,
  logServerStartup,
  openEditorInBrowser,
  corsMiddleware,
  getPort,
  routeDebuggingMiddleware,
} from 'src/utils';

import {
  graphqlMiddleware,
  schemaHandlerPost,
  schemaHandlerGet,
  voyagerWorkerMiddleware,
  voyagerMiddleware,
} from 'src/handlers';

export const runServer = async () => {
  const app = express();

  // graphql
  app.options('/graphql', corsMiddleware());
  app.use('/graphql', corsMiddleware(), graphqlMiddleware);

  // user-sdl (schema)
  // used to represent a custom schema that is being saved to a schema_extension.faker.graphql file
  app.use('/user-sdl', bodyParser.text({ limit: '8mb' }), corsMiddleware());
  app.get('/user-sdl', schemaHandlerGet(), routeDebuggingMiddleware);
  app.post('/user-sdl', schemaHandlerPost(), routeDebuggingMiddleware);

  // editor
  app.use('/editor', express.static(editorDir));

  // voyager
  app.use('/voyager', voyagerMiddleware());
  app.use('/voyager.worker.js', voyagerWorkerMiddleware());

  // app
  const port = getPort();
  const server = app.listen(port);
  logServerStartup();
  openEditorInBrowser();

  // shutdown
  process.on('SIGINT', () => shutdown(server, 'SIGINT'));
  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
};
