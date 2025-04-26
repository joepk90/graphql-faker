import * as express from 'express';
import * as path from 'path';
import { express as graphqlVoyagerMiddleware } from 'graphql-voyager/middleware';
import { projectRoot, getCustomHeaders } from 'src/utils';

const voyagerPath = 'node_modules/graphql-voyager/dist/voyager.worker.js';

const getHeaders = () => {
  const customHeaders = getCustomHeaders();
  return JSON.stringify(customHeaders);
};

export const voyagerWorkerMiddleware = () => {
  return express.static(path.join(projectRoot, voyagerPath));
};
export const voyagerMiddleware = () => {
  return graphqlVoyagerMiddleware({
    endpointUrl: '/graphql',
    headersJS: getHeaders(),
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
