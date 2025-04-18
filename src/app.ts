#!/usr/bin/env node

import * as open from 'open';
import * as bodyParser from 'body-parser';
import * as chalk from 'chalk';
import * as express from 'express';

import {
  mergeUserSDL,
  prepareRemoteSchema,
  prepareRemoteSDL,
  editorDir,
} from 'src/utils';
import {
  getGraphqlMiddleware,
  getCorsMiddleware,
  schemaHandlerPost,
  schemaHandlerGet,
  voyagerWorkerMiddleware,
  voyagerMiddleware,
} from 'src/handlers';

export const runServer = async (options) => {
  const { extendURL, headers, fileName, port, openEditor } = options;

  const remoteSchema = await prepareRemoteSchema(extendURL, headers);
  const remoteSDL = prepareRemoteSDL(remoteSchema, extendURL);
  const userSDL = mergeUserSDL(fileName, remoteSchema);

  const app = express();

  // graphql
  const graphqlMiddlewareArgs = { options, userSDL, remoteSDL };
  const graphqlMiddleware = await getGraphqlMiddleware(graphqlMiddlewareArgs);
  const corsMiddleware = getCorsMiddleware(options);
  app.options('/graphql', corsMiddleware);
  app.use('/graphql', corsMiddleware, graphqlMiddleware);

  // user-sdl (schema)
  app.get('/user-sdl', schemaHandlerGet(userSDL, remoteSDL));
  app.use('/user-sdl', bodyParser.text({ limit: '8mb' }));
  app.post('/user-sdl', schemaHandlerPost(userSDL));

  // editor
  app.use('/editor', express.static(editorDir));

  // voyager
  app.use('/voyager', voyagerMiddleware());
  app.use('/voyager.worker.js', voyagerWorkerMiddleware());

  const server = app.listen(port);

  const shutdown = () => {
    server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log(`\n${chalk.green('✔')} Your GraphQL Fake API is ready to use 🚀
  Here are your links:

  ${chalk.blue('❯')} Interactive Editor: http://localhost:${port}/editor
  ${chalk.blue('❯')} GraphQL API:        http://localhost:${port}/graphql
  ${chalk.blue('❯')} GraphQL Voyager:    http://localhost:${port}/voyager

  `);

  if (openEditor) {
    setTimeout(() => open(`http://localhost:${port}/editor`), 500);
  }
};
