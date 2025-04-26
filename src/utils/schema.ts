import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';

import { mkdirSync } from 'fs';
import { Source, GraphQLSchema, printSchema } from 'graphql';
import {
  existsSync,
  schemaDir,
  prettyPrintValidationErrors,
  getRemoteSchema,
  getSchemaFileName,
  getSchemaExtendURL,
  customSchemaExtensionsDirName,
  defaultSchemaFileName,
  extendedSchemaFileName,
} from 'src/utils';

// TODO - fake_definition kept seperate, it should potentially be moved out of the utils folder
import {
  buildWithFakeDefinitions,
  ValidationErrors,
} from 'src/utils/fake_definition';

export const createDirIfNonExistent = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
};

// TODO review fs.readFileSync usage - can this be abstracted?

export const getCustomerSchemaFilePath = () => {
  const fileName = getSchemaFileName();
  return `${customSchemaExtensionsDirName}/${fileName}.graphql`;
};

const getCustomerSchemaAndConvertToSource = () => {
  const filePath = getCustomerSchemaFilePath();
  return existsSync(filePath) && readSDL(filePath);
};

export const getUserSDL = (fileName) =>
  fs.readFileSync(path.join(schemaDir, fileName), 'utf-8');

export const readSDL = (filepath: string): Source =>
  new Source(fs.readFileSync(filepath, 'utf-8'), filepath);

export const prepareDefaultSDL = () => {
  const fileName = getSchemaFileName();
  return new Source(getUserSDL(defaultSchemaFileName), fileName);
};

export const prepareDefaultExtendedSDL = (schema) => {
  const fileName = getSchemaFileName();
  let body = getUserSDL(extendedSchemaFileName);

  // TODO: CONVERT UTIL FUNCTION!
  const rootTypeName = schema.getQueryType().name;
  body = body.replace('___RootTypeName___', rootTypeName);

  return new Source(body, fileName);
};

export const getDynamicUserSDLTest = (remoteSchema) => {
  if (!remoteSchema) {
    return prepareDefaultSDL();
  }

  return prepareDefaultExtendedSDL(remoteSchema);
};

export const getUserSDLWithDefaultSDLFallback = (remoteSchema) => {
  const userSDL = getCustomerSchemaAndConvertToSource();
  if (userSDL) {
    return userSDL;
  }

  return getDynamicUserSDLTest(remoteSchema);
};

export const getSchema = (userSDL, remoteSDL): GraphQLSchema => {
  // apply faker defintions
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

export const prepareRemoteSchema = async () => {
  const extendURL = getSchemaExtendURL();

  if (!extendURL) {
    return;
  }
  try {
    return await getRemoteSchema(extendURL);
  } catch (error) {
    console.log(chalk.red(error.stack));
    process.exit(1);
  }
};

export const prepareRemoteSDL = (remoteSDL) => {
  if (!remoteSDL) {
    return;
  }

  const extendURL = getSchemaExtendURL();
  return new Source(
    printSchema(remoteSDL),
    `Introspection from "${extendURL}"`,
  );
};
