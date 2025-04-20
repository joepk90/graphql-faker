import * as express from 'express';
import * as path from 'path';
import { express as graphqlVoyagerMiddleware } from 'graphql-voyager/middleware';

import { projectRoot, getAuthToken } from 'src/utils';

const voyagerPath = 'node_modules/graphql-voyager/dist/voyager.worker.js';

const getAuthorizationHeader = () => {
  return JSON.stringify({
    Authorization: `Bearer ${getAuthToken()}`,
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

// ALSO WORKS
// export const voyagerMiddlewareRenderPage = () => {
//   return (_req, res) => {
//     res.send(
//       renderVoyagerPage({
//         endpointUrl: '/graphql',
//         headersJS: getAuthorizationHeader(),
//       }),
//     );
//   };
// };
