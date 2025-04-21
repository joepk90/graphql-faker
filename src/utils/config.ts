export const customSchemaExtensionsDirName = 'schema-extensions';
export const defaultSchemaFileName = 'default-schema.graphql';
export const extendedSchemaFileName = 'default-extend.graphql';

export const getSchemaFileName = () => process.env.SCHEMA_FILE_NAME;
export const getSchemaExtendURL = () => process.env.EXTEND_URL;
export const getAuthToken = () => process.env.AUTH_TOKEN;
export const getPort = () => process.env.PORT || '9092';
export const getOpenBrowser = () =>
  process.env.OPEN_BROWSER === 'TRUE' || false;
export const getForwardHeaders = () =>
  process.env.FORWARD_HEADERS === 'TRUE' || false;
export const getCustomHeaders = () =>
  process.env.CUSTOM_HEADERS?.split(',') || [];
export const getAllowedHosts = () =>
  process.env.ALLOWED_HOSTS?.split(',') || [];
