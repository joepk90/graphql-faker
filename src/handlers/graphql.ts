#!/usr/bin/env node
import { Request, Response, NextFunction } from 'express';
import { graphqlHTTP } from 'express-graphql';

import {
  getSchema,
  getGraphqlHTTPOptions,
  prepareRemoteSchema,
  prepareRemoteSDL,
  getUserSDLWithDefaultSDLFallback,
} from 'src/utils';

export const graphqlMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const remoteSchema = await prepareRemoteSchema();
    const remoteSDL = prepareRemoteSDL(remoteSchema);
    const userSDL = getUserSDLWithDefaultSDLFallback(remoteSchema);
    const schema = await getSchema(userSDL, remoteSDL);
    const graphqlHTTPOptions = await getGraphqlHTTPOptions(schema);

    const middleware = graphqlHTTP(graphqlHTTPOptions);
    return middleware(req, res);
    // 👆 Call the middleware with req and res, as it expects only two arguments
  } catch (error) {
    next(error);
  }
};
