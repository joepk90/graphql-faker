#!/usr/bin/env node

import * as chalk from 'chalk';
import * as fs from 'fs';
import { printSchema, Source } from 'graphql';
import * as path from 'path';
import { getProxyExecuteFn } from './proxy';
import { existsSync, getRemoteSchema, readSDL } from './utils';
import { getConfig } from './config';
import { runServer } from './app';
const log = console.log;

// const cliOptions = parseCLI();
const options = getConfig();

const { fileName, extendURL, headers, forwardHeaders } = options;

let userSDL = existsSync(fileName) && readSDL(fileName);

if (extendURL) {
  // run in proxy mode
  getRemoteSchema(extendURL, headers)
    .then((schema) => {
      const remoteSDL = new Source(
        printSchema(schema),
        `Introspection from "${extendURL}"`,
      );

      if (!userSDL) {
        let body = fs.readFileSync(
          path.join(__dirname, 'default-extend.graphql'),
          'utf-8',
        );

        const rootTypeName = schema.getQueryType().name;
        body = body.replace('___RootTypeName___', rootTypeName);

        userSDL = new Source(body, fileName);
      }

      const executeFn = getProxyExecuteFn(extendURL, headers, forwardHeaders);
      runServer(options, userSDL, remoteSDL, executeFn);
    })
    .catch((error) => {
      log(chalk.red(error.stack));
      process.exit(1);
    });
} else {
  if (!userSDL) {
    userSDL = new Source(
      fs.readFileSync(path.join(__dirname, 'default-schema.graphql'), 'utf-8'),
      fileName,
    );
  }
  runServer(options, userSDL);
}
