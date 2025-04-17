import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
  Source,
  printSchema,
} from 'graphql';
import * as fetch from 'node-fetch';
import { Headers } from 'node-fetch';

import { buildWithFakeDefinitions, ValidationErrors } from './fake_definition';

export function existsSync(filePath: string): boolean {
  try {
    fs.statSync(filePath);
  } catch (err) {
    if (err.code == 'ENOENT') return false;
  }
  return true;
}

export function readSDL(filepath: string): Source {
  return new Source(fs.readFileSync(filepath, 'utf-8'), filepath);
}

export function getRemoteSchema(
  url: string,
  headers: { [name: string]: string },
): Promise<GraphQLSchema> {
  return graphqlRequest(url, headers, getIntrospectionQuery())
    .then((response) => {
      if (response.errors) {
        throw Error(JSON.stringify(response.errors, null, 2));
      }
      return buildClientSchema(response.data);
    })
    .catch((error) => {
      throw Error(`Can't get introspection from ${url}:\n${error.message}`);
    });
}

export function graphqlRequest(
  url,
  headers,
  query,
  variables?,
  operationName?,
) {
  return fetch(url, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      ...(headers || {}),
    }),
    body: JSON.stringify({
      operationName,
      query,
      variables,
    }),
  }).then((response) => {
    if (response.ok) return response.json();
    return response.text().then((body) => {
      throw Error(`${response.status} ${response.statusText}\n${body}`);
    });
  });
}

export const getUserSDL = (fileName) =>
  fs.readFileSync(path.join(__dirname, fileName), 'utf-8');

const prepareDefaultExtendedSDL = (fileName, schema) => {
  let body = getUserSDL('default-extend.graphql');

  const rootTypeName = schema.getQueryType().name;
  body = body.replace('___RootTypeName___', rootTypeName);

  return new Source(body, fileName);
};

export const prepareDefaultSDL = (fileName) =>
  new Source(getUserSDL('default-schema.graphql'), fileName);

export function prettyPrintValidationErrors(
  validationErrors: ValidationErrors,
) {
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

export const prepareRemoteSchema = async (extendURL, headers) => {
  try {
    return await getRemoteSchema(extendURL, headers);
  } catch (error) {
    console.log(chalk.red(error.stack));
    process.exit(1);
  }
};

export const prepareRemoteSDL = (schema, extendURL) => {
  return new Source(printSchema(schema), `Introspection from "${extendURL}"`);
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

export const getDynamicUserSDLTest = (fileName, remoteSchema) => {
  if (!remoteSchema) {
    return prepareDefaultSDL(fileName);
  }

  return prepareDefaultExtendedSDL(fileName, remoteSchema);
};

// WARNING - if the utils file is moved it may break the fileName path. the fileName relates to the (sibling) .graphql files
// TOOD - review function - what does this actually do? Does it actually merge the user SDl? I named it this
export const mergeUserSDL = (fileName, remoteSchema) => {
  let userSDL = existsSync(fileName) && readSDL(fileName);
  if (!userSDL) {
    userSDL = getDynamicUserSDLTest(fileName, remoteSchema);
  }
  return userSDL;
};
