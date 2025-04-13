#!/usr/bin/env node

import * as chalk from 'chalk';
import * as fs from 'fs';
import { printSchema, Source, GraphQLSchema } from 'graphql';
import * as path from 'path';
import { getProxyExecuteFn } from './proxy';
import { existsSync, getRemoteSchema, readSDL } from './utils';
import { getConfig } from './config';
import { runServer } from './app';
import { buildWithFakeDefinitions, ValidationErrors } from './fake_definition';

const log = console.log;

// const cliOptions = parseCLI();
const options = getConfig();

const { fileName, extendURL, headers, forwardHeaders } = options;

let userSDL = existsSync(fileName) && readSDL(fileName);

const getUserSDL = (fileName) =>
  fs.readFileSync(path.join(__dirname, fileName), 'utf-8');

const prepareDefaultExtendedSDL = (fileName, schema) => {
  let body = getUserSDL('default-extend.graphql');

  const rootTypeName = schema.getQueryType().name;
  body = body.replace('___RootTypeName___', rootTypeName);

  return new Source(body, fileName);
};

const prepareDefaultSDL = (fileName) =>
  new Source(getUserSDL('default-schema.graphql'), fileName);

function prettyPrintValidationErrors(validationErrors: ValidationErrors) {
  const { subErrors } = validationErrors;
  console.log(
    chalk.red(
      subErrors.length > 1
        ? `\nYour schema contains ${subErrors.length} validation errors: \n`
        : `\nYour schema contains a validation error: \n`,
    ),
  );

  for (const error of subErrors) {
    const [message, ...otherLines] = error.toString().split('\n');
    console.log([chalk.yellow(message), ...otherLines].join('\n') + '\n\n');
  }
}

const prepareRemoteSchema = async () => {
  try {
    return await getRemoteSchema(extendURL, headers);
  } catch (error) {
    log(chalk.red(error.stack));
    process.exit(1);
  }
};

const prepareRemoteSDL = (schema) => {
  return new Source(printSchema(schema), `Introspection from "${extendURL}"`);
};

const getSchema = (userSDL, remoteSDL): GraphQLSchema => {
  try {
    return remoteSDL
      ? buildWithFakeDefinitions(remoteSDL, userSDL)
      : buildWithFakeDefinitions(userSDL);
  } catch (error) {
    if (error instanceof ValidationErrors) {
      prettyPrintValidationErrors(error);
      process.exit(1);
    }
  }
};

const getDynamicUserSDLTest = (fileName, remoteSchema) => {
  if (!remoteSchema) {
    return prepareDefaultSDL(fileName);
  }

  return prepareDefaultExtendedSDL(fileName, remoteSchema);
};

/**
 * TODO Futher Refactoring required
 */

(async () => {
  let remoteSDL = null;
  let remoteSchema = null;

  if (extendURL) {
    remoteSchema = await prepareRemoteSchema();
    remoteSDL = prepareRemoteSDL(remoteSchema);
  }

  if (!userSDL) {
    userSDL = getDynamicUserSDLTest(fileName, remoteSchema);
  }

  const schema = await getSchema(userSDL, remoteSDL);

  // if extendURL is false, undefined is returned
  const executeFn = await getProxyExecuteFn(extendURL, headers, forwardHeaders);

  // remoteSDL/executeFn may be undefined
  runServer(options, userSDL, schema, remoteSDL, executeFn);
})();
