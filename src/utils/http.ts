import { IncomingHttpHeaders } from 'http';
import { Headers } from 'node-fetch';
import {
  projectRoot,
  getJsonFileIfExists,
  allowCustomHeaders,
  customHeadersFileName,
  customHeadersDirName,
} from 'src/utils';

// TODO: update logic to use node-fetch Headers class

// WARNNG: This will change the requirements of working with the headers object everywhere.
// header valies are stored as "Authorization": ["Bearer XXX"]
// This means unless you use the getter method of the Headers object, an array will be passed to the request

const validatedHeaders = (headers: Object) => {
  const emptyHeaders = Object.create(null);
  if (!headers || typeof headers !== 'object') {
    return emptyHeaders;
  }

  const validatedHeaders = Object.create(null);
  Object.entries(headers).forEach(([key, value]) => {
    if (typeof key !== 'string' || typeof value !== 'string') {
      console.warn(
        'Headers not valid, excluded from the request. Header Key: ',
        key,
      );
      return;
    }

    validatedHeaders[key] = value;
  });

  return validatedHeaders;
};

export const getCustomHeaders = (): Headers => {
  const useCustomHeaders = allowCustomHeaders();

  if (!useCustomHeaders) {
    return new Headers();
  }

  const customerHeadersFilePath = `${projectRoot}/${customHeadersDirName}/${customHeadersFileName}`;
  const headers = getJsonFileIfExists(customerHeadersFilePath);
  return validatedHeaders(headers);
};

// copy the headers from a request
export const copyHeadersFromRequest = (
  requestHeaders: IncomingHttpHeaders,
  headersToCopy: string[],
) => {
  const proxyHeaders = Object.create(null);

  for (const name of headersToCopy) {
    if (!requestHeaders[name]) {
      continue;
    }

    proxyHeaders[name] = requestHeaders[name];
  }

  return proxyHeaders;
};
