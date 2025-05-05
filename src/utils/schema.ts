import path from 'path';
import chalk from 'chalk';

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
} from 'src/fakeDefinitions';

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

export const prepareDefaultExtendedSDL = (schema: GraphQLSchema) => {
  const fileName = getSchemaFileNameWithRemoteSchemaExt();
  let body = getUserSDL(extendedSchemaFileName);

  // TODO: CONVERT UTIL FUNCTION!
  const queryType = schema.getQueryType();
  if (!queryType) {
    throw new Error('Query type is not defined in the schema.');
  }
  const rootTypeName = queryType.name;
  body = body.replace('___RootTypeName___', rootTypeName);

  return new Source(body, fileName);
};

export const getDynamicUserSDLTest = (
  remoteSchema: GraphQLSchema | undefined,
) => {
  if (!remoteSchema) {
    return prepareDefaultSDL();
  }

  return prepareDefaultExtendedSDL(remoteSchema);
};

export const getUserSDLWithDefaultSDLFallback = (
  remoteSchema: GraphQLSchema | undefined,
) => {
  const userSDL = getCustomerSchemaAndConvertToSource();
  if (userSDL) {
    return userSDL;
  }

  return getDynamicUserSDLTest(remoteSchema);
};

// build the schema with just the user schema, or both the user schema and remote schema
export const buildSchemaWithFakeDefsFromSources = (
  userSDL: Source,
  remoteSDL?: Source,
) => {
  return remoteSDL
    ? buildWithFakeDefinitions(remoteSDL, userSDL)
    : buildWithFakeDefinitions(userSDL);
};

export const getSchema = async (
  userSDL: Source,
  remoteSDL: Source | undefined,
): Promise<GraphQLSchema> => {
  let schema: GraphQLSchema | undefined = undefined;

  // // apply faker defintions
  try {
    schema = await buildSchemaWithFakeDefsFromSources(userSDL, remoteSDL);
  } catch (error) {
    if (error instanceof ValidationErrors) {
      prettyPrintValidationErrors(error);
      process.exit(1);
    }
  }

  if (!schema) {
    throw new Error('Schema could not be built.');
  }

  return schema;
};

export const prepareRemoteSchema = async () => {
  const extendURL = getSchemaExtendURL();

  if (!extendURL) {
    return;
  }
  try {
    return await getRemoteSchema(extendURL);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(chalk.red(error.stack));
    }
    console.log(chalk.red(error));
    process.exit(1);
  }
};

export const prepareRemoteSDL = (remoteSDL: GraphQLSchema | undefined) => {
  if (!remoteSDL) {
    return;
  }

  const extendURL = getSchemaExtendURL();
  return new Source(
    printSchema(remoteSDL),
    `Introspection from "${extendURL}"`,
  );
};
