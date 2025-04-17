#!/usr/bin/env node

import * as fs from 'fs';
import * as open from 'open';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as chalk from 'chalk';
import * as cors from 'cors';
import * as express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';

import {
  prepareRemoteSchema,
  prepareRemoteSDL,
  mergeUserSDL,
  getSchema,
  getGraphqlHTTPOptions,
  getCorsOptions,
} from './utils';

export const runServer = async (options) => {
  const { fileName, extendURL, headers, port, openEditor } = options;

  const remoteSchema = await prepareRemoteSchema(extendURL, headers);
  const remoteSDL = prepareRemoteSDL(remoteSchema, extendURL);
  const userSDL = mergeUserSDL(fileName, remoteSchema);
  const schema = await getSchema(userSDL, remoteSDL);

  const corsOptions = getCorsOptions(options);
  const graphqlHTTPOptions = await getGraphqlHTTPOptions(options, schema);
  const app = express();

  app.options('/graphql', cors(corsOptions));
  app.use('/graphql', cors(corsOptions), graphqlHTTP(graphqlHTTPOptions));

  app.get('/user-sdl', (_, res) => {
    res.status(200).json({
      userSDL: userSDL.body,
      remoteSDL: remoteSDL?.body,
    });
  });

  app.use('/user-sdl', bodyParser.text({ limit: '8mb' }));
  app.post('/user-sdl', (req, res) => {
    try {
      const fileName = userSDL.name;
      fs.writeFileSync(fileName, req.body);

      const date = new Date().toLocaleString();
      console.log(
        `${chalk.green('✚')} schema saved to ${chalk.magenta(
          fileName,
        )} on ${date}`,
      );

      res.status(200).send('ok');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.use('/editor', express.static(path.join(__dirname, 'editor')));
  app.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }));
  app.use(
    '/voyager.worker.js',
    express.static(
      path.join(
        __dirname,
        '../node_modules/graphql-voyager/dist/voyager.worker.js',
      ),
    ),
  );

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
