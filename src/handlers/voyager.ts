import * as express from 'express';
import * as path from 'path';
import { express as graphqlVoyagerMiddleware } from 'graphql-voyager/middleware';

import { projectRoot } from 'src/utils';

const voyagerPath = 'node_modules/graphql-voyager/dist/voyager.worker.js';

export const voyagerWorkerMiddleware = () => {
  return express.static(path.join(projectRoot, voyagerPath));
};
export const voyagerMiddleware = () =>
  graphqlVoyagerMiddleware({ endpointUrl: '/graphql' });
