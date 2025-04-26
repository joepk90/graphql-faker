export const customSchemaExtensionsDirName = 'schema-extensions';
export const defaultSchemaFileName = 'default-schema.graphql';
export const extendedSchemaFileName = 'default-extend.graphql';

const defaultAllowedHost = 'http://localhost:8080';

// use the getSchemaFileNameWithRemoteSchemaExt function to ensure the correct schema file is found
export const getSchemaFileName = () => process.env.SCHEMA_FILE_NAME;
export const getSchemaExtendURL = () => process.env.EXTEND_URL;
export const getAuthToken = () => process.env.AUTH_TOKEN;
export const getPort = () => process.env.SERVER_PORT || '9092';

export const getHeadersToForward = () =>
  process.env.FORWARD_HEADERS?.split(',') || [];

export const getAllowedHosts = () =>
  process.env.ALLOWED_HOSTS?.split(',') || [defaultAllowedHost];
