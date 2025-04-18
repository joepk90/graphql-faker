import * as fetch from 'node-fetch';
import { Headers } from 'node-fetch';
import {
  GraphQLSchema,
  getIntrospectionQuery,
  buildClientSchema,
} from 'graphql';
import { Options } from 'express-graphql';
// TODO - fake_schema kept seperate, it should potentially be moved out of the utils folder
import { fakeFieldResolver, fakeTypeResolver } from 'src/utils/fake_schema';
import { getProxyExecuteFn } from 'src/utils';

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

export const getGraphqlHTTPOptions = async (
  options,
  schema: GraphQLSchema,
): Promise<Options> => {
  const { extendURL, headers, forwardHeaders } = options;

  const customExecuteFn = await getProxyExecuteFn(
    extendURL,
    headers,
    forwardHeaders,
  );

  return {
    schema,
    typeResolver: fakeTypeResolver,
    fieldResolver: fakeFieldResolver,
    customExecuteFn,
    graphiql: { headerEditorEnabled: true },
  };
};

export const getCorsOptions = (options) => {
  return {
    credentials: true,
    origin: options?.corsOrigin,
  };
};

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
