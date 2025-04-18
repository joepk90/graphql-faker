#!/usr/bin/env node

import * as bodyParser from 'body-parser';
import * as express from 'express';

import {
  mergeUserSDL,
  prepareRemoteSchema,
  prepareRemoteSDL,
  editorDir,
  shutdown,
  logServerStartup,
  openEditorInBrowser,
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
  // i think user sdl represent a custom schema that is being saved to a
  // schema_extension.faker.graphql file
  app.get('/user-sdl', schemaHandlerGet(userSDL, remoteSDL));
  app.use('/user-sdl', bodyParser.text({ limit: '8mb' }));
  app.post('/user-sdl', schemaHandlerPost(userSDL));

  // editor
  app.use('/editor', express.static(editorDir));

  // voyager
  app.use('/voyager', voyagerMiddleware());
  app.use('/voyager.worker.js', voyagerWorkerMiddleware());

  // app
  const server = app.listen(port);
  logServerStartup(port);
  openEditorInBrowser(openEditor, port);

  // shutdown
  process.on('SIGINT', () => shutdown(server));
  process.on('SIGTERM', () => shutdown(server));
};
