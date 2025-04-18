import * as express from 'express';
import * as path from 'path';
import { express as graphqlVoyagerMiddleware } from 'graphql-voyager/middleware';

import { projectRoot } from 'src/utils';

const voyagerPath = 'node_modules/graphql-voyager/dist/voyager.worker.js';

const getAuthorizationHeader = () => {
  const token = process.env.AUTH_TOKEN || '';

  return JSON.stringify({
    Authorization: `Bearer ${token}`,
  });
};

export const voyagerWorkerMiddleware = () => {
  return express.static(path.join(projectRoot, voyagerPath));
};
export const voyagerMiddleware = () => {
  return graphqlVoyagerMiddleware({
    endpointUrl: '/graphql',
    headersJS: getAuthorizationHeader(),
    displayOptions: {
      headerEditorEnabled: true,
    },
  });
};
