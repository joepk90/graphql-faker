#!/usr/bin/env node

import * as bodyParser from 'body-parser';
import * as chalk from 'chalk';
import * as cors from 'cors';
import * as express from 'express';
import { graphqlHTTP } from 'express-graphql';
import * as fs from 'fs';
import { Source } from 'graphql';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import * as open from 'open';
import * as path from 'path';
import { fakeFieldResolver, fakeTypeResolver } from './fake_schema';

import { getProxyExecuteFn } from './proxy';
import {
  existsSync,
  readSDL,
  prepareRemoteSchema,
  prepareRemoteSDL,
  getDynamicUserSDLTest,
  getSchema,
} from './utils';

export const runServer = async (options) => {
  let remoteSDL = null;
  let remoteSchema = null;

  const { fileName, extendURL, headers, forwardHeaders } = options;

  let userSDL = existsSync(fileName) && readSDL(fileName);

  if (extendURL) {
    remoteSchema = await prepareRemoteSchema(extendURL, headers);
    remoteSDL = prepareRemoteSDL(remoteSchema, extendURL);
  }

  if (!userSDL) {
    userSDL = getDynamicUserSDLTest(fileName, remoteSchema);
  }

  const schema = await getSchema(userSDL, remoteSDL);

  const customExecuteFn = await getProxyExecuteFn(
    extendURL,
    headers,
    forwardHeaders,
  );

  const { port, openEditor } = options;
  const corsOptions = {
    credentials: true,
    origin: options.corsOrigin,
  };
  const app = express();

  app.options('/graphql', cors(corsOptions));
  app.use(
    '/graphql',
    cors(corsOptions),
    graphqlHTTP(() => ({
      schema,
      typeResolver: fakeTypeResolver,
      fieldResolver: fakeFieldResolver,
      customExecuteFn,
      graphiql: { headerEditorEnabled: true },
    })),
  );

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
      userSDL = new Source(req.body, fileName);

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
