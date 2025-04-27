import { IncomingHttpHeaders } from 'http';
import { Headers } from 'node-fetch';
import {
  projectRoot,
  getJsonFileIfExists,
  allowCustomHeaders,
  customHeadersFileName,
  customHeadersDirName,
} from 'src/utils';

const validateHeaders = (headers: Object) => {
  const emptyHeaders = new Headers();
  if (!headers || typeof headers !== 'object') {
    return emptyHeaders;
  }

  const result = Object.entries(headers).every(
    ([key, value]) => typeof key === 'string' && typeof value === 'string',
  );

  if (!result) {
    return emptyHeaders;
  }

  return headers as Headers;
};

export const getCustomHeaders = (): Headers => {
  const useCustomHeaders = allowCustomHeaders();

  if (!useCustomHeaders) {
    return new Headers();
  }

  const customerHeadersFilePath = `${projectRoot}/${customHeadersDirName}/${customHeadersFileName}`;
  const headers = getJsonFileIfExists(customerHeadersFilePath);
  return validateHeaders(headers);
};

// copy the headers from a request
export const copyHeadersFromRequest = (
  requestHeaders: IncomingHttpHeaders,
  headersToCopy: string[],
) => {
  const proxyHeaders = Object.create(null);

  for (const name of headersToCopy) {
    proxyHeaders[name] = requestHeaders[name];
  }

  return proxyHeaders;
};
