#!/usr/bin/env node
import * as cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

import { getSchema, getGraphqlHTTPOptions, getCorsOptions } from 'src/utils';

export const getGraphqlMiddleware = async ({ options, userSDL, remoteSDL }) => {
  const schema = await getSchema(userSDL, remoteSDL);
  const graphqlHTTPOptions = await getGraphqlHTTPOptions(options, schema);

  return graphqlHTTP(graphqlHTTPOptions);
};

export const getCorsMiddleware = (options) => {
  const corsOptions = getCorsOptions(options);
  return cors(corsOptions);
};
