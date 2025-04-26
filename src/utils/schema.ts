import * as path from 'path';
import * as chalk from 'chalk';

import { Source, GraphQLSchema, printSchema } from 'graphql';
import {
  getFile,
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

// TODO review fs.readFileSync usage - can this be abstracted?

// if a remote schema is in use, appent `-ext` to the file, otherwise if a user attempts
// to use the app again but wihout a remote schema, this file will be loaded but won't work,
// because the service is no longer in extend mode
export const getSchemaFileNameWithRemoteSchemaExt = () => {
  const fileName = getSchemaFileName();
  const extenedUrl = getSchemaExtendURL();

  if (extenedUrl) {
    return fileName + '-ext';
  }

  return fileName;
};

export const getCustomSchemaFilePath = () => {
  const fileName = getSchemaFileNameWithRemoteSchemaExt();
  return `${customSchemaExtensionsDirName}/${fileName}.graphql`;
};

const getCustomerSchemaAndConvertToSource = () => {
  const filePath = getCustomSchemaFilePath();
  return existsSync(filePath) && readSDL(filePath);
};

export const getUserSDL = (fileName: string) => {
  const filePath = path.join(schemaDir, fileName);
  return getFile(filePath);
};

export const readSDL = (filepath: string): Source =>
  new Source(getFile(filepath), filepath);

export const prepareDefaultSDL = () => {
  const fileName = getSchemaFileNameWithRemoteSchemaExt();
  return new Source(getUserSDL(defaultSchemaFileName), fileName);
};

export const prepareDefaultExtendedSDL = (schema) => {
  const fileName = getSchemaFileNameWithRemoteSchemaExt();
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
