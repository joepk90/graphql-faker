export const customHeadersDirName = '.headers';
export const customSchemaExtensionsDirName = 'schema-extensions'; // move to hidden dir (.schemaExtensions)
export const defaultSchemaFileName = 'default-schema.graphql';
export const extendedSchemaFileName = 'default-extend.graphql';
export const customHeadersFileName = '.headers.json';

const defaultAllowedHost = 'http://localhost:5173';

// use the getSchemaFileNameWithRemoteSchemaExt function to ensure the correct schema file is found
export const getSchemaFileName = () =>
  process.env.SCHEMA_FILE_NAME || 'schema_extension';
export const getPort = () => process.env.SERVER_PORT || '3000';
export const getSchemaExtendURL = () => process.env.EXTEND_URL;

export const getHeadersToForward = () =>
  process.env.FORWARD_HEADERS?.split(',') || [];

// allows a custom headers to be injected from a .headers.json file in the root directory
export const allowCustomHeaders = () =>
  process.env.CUSTOM_HEADERS === 'TRUE' || false;

// allowed hosts config is required for cors, so that the client (editor) can make requests
export const getAllowedHosts = () =>
  process.env.ALLOWED_HOSTS?.split(',') || [defaultAllowedHost];
