import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';

import { Source, GraphQLSchema, printSchema } from 'graphql';
import {
  existsSync,
  schemaDir,
  prettyPrintValidationErrors,
  getRemoteSchema,
} from 'src/utils';

import {
  buildWithFakeDefinitions,
  ValidationErrors,
} from 'src/fake_definition';

const defaultSchemaFileName = 'default-schema.graphql';
const extendedSchemaFileName = 'default-extend.graphql';

// TODO review fs.readFileSync usage - can this be abstracted?

export const getUserSDL = (fileName) =>
  fs.readFileSync(path.join(schemaDir, fileName), 'utf-8');

export const readSDL = (filepath: string): Source =>
  new Source(fs.readFileSync(filepath, 'utf-8'), filepath);

export const prepareDefaultSDL = (fileName) =>
  new Source(getUserSDL(defaultSchemaFileName), fileName);

export const prepareDefaultExtendedSDL = (fileName, schema) => {
  let body = getUserSDL(extendedSchemaFileName);

  const rootTypeName = schema.getQueryType().name;
  body = body.replace('___RootTypeName___', rootTypeName);

  return new Source(body, fileName);
};

export const getDynamicUserSDLTest = (fileName, remoteSchema) => {
  if (!remoteSchema) {
    return prepareDefaultSDL(fileName);
  }

  return prepareDefaultExtendedSDL(fileName, remoteSchema);
};

export const mergeUserSDL = (fileName, remoteSchema) => {
  let userSDL = existsSync(fileName) && readSDL(fileName);
  if (!userSDL) {
    userSDL = getDynamicUserSDLTest(fileName, remoteSchema);
  }
  return userSDL;
};

export const getSchema = (userSDL, remoteSDL): GraphQLSchema => {
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

export const prepareRemoteSchema = async (extendURL, headers) => {
  if (!extendURL) {
    return;
  }
  try {
    return await getRemoteSchema(extendURL, headers);
  } catch (error) {
    console.log(chalk.red(error.stack));
    process.exit(1);
  }
};

export const prepareRemoteSDL = (remoteSchema, extendURL) => {
  if (!remoteSchema) {
    return;
  }

  return new Source(
    printSchema(remoteSchema),
    `Introspection from "${extendURL}"`,
  );
};
