import { IncomingHttpHeaders } from 'http';
import {
  projectRoot,
  getJsonFileIfExists,
  allowCustomHeaders,
  customHeadersFileName,
  customHeadersDirName,
} from 'src/utils';

const validateHeaders = (headers: Object) => {
  if (!headers || typeof headers !== 'object') {
    return null;
  }

  const result = Object.entries(headers).every(
    ([key, value]) => typeof key === 'string' && typeof value === 'string',
  );

  if (!result) {
    return null;
  }

  return headers as Record<string, string>;
};

export const getCustomHeaders = (): Record<string, string> | null => {
  const useCustomHeaders = allowCustomHeaders();

  if (!useCustomHeaders) {
    return null;
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
