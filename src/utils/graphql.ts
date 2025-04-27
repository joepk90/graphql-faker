import fetch, { Headers } from 'node-fetch';
import {
  GraphQLSchema,
  getIntrospectionQuery,
  buildClientSchema,
} from 'graphql';
import { Options } from 'express-graphql';
// TODO - fake_schema kept seperate, it should potentially be moved out of the utils folder
import { fakeFieldResolver, fakeTypeResolver } from 'src/utils/fake_schema';
import { getProxyExecuteFn } from 'src/utils';

export type Maybe<T> = T | null | undefined;

export interface GraphQLRequestVariables {
  [key: string]: any;
}

interface GraphQLRequestHeaders {
  [key: string]: string;
}

interface GraphQLRequestBody {
  operationName?: Maybe<string>;
  query: string;
  variables?: GraphQLRequestVariables;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: any[];
}

export function graphqlRequest(
  url: string,
  query: string,
  headers?: Headers | GraphQLRequestHeaders,
  variables?: GraphQLRequestVariables,
  operationName?: Maybe<string>,
): Promise<GraphQLResponse> {
  const requestBody: GraphQLRequestBody = {
    operationName,
    query,
    variables,
  };

  return fetch(url, {
    method: 'POST',
    headers: new Headers({
      'content-type': 'application/json',
      ...(headers || {}),
    }),
    body: JSON.stringify(requestBody),
  }).then((response) => {
    if (response.ok) return response.json() as Promise<GraphQLResponse>;
    return response.text().then((body) => {
      throw Error(`${response.status} ${response.statusText}\n${body}`);
    });
  });
}

export const getGraphqlHTTPOptions = async (
  schema: GraphQLSchema,
): Promise<Options> => {
  const customExecuteFn = await getProxyExecuteFn();

  return {
    schema,
    typeResolver: fakeTypeResolver,
    fieldResolver: fakeFieldResolver,
    customExecuteFn,
    graphiql: { headerEditorEnabled: true },
  };
};

export function getRemoteSchema(url: string): Promise<GraphQLSchema> {
  return graphqlRequest(url, getIntrospectionQuery())
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
