export const getSchemaFileName = () => process.env.SCHEMA_FILE_NAME;
export const getSchemaExtendURL = () => process.env.EXTEND_URL;
export const getPort = () => process.env.PORT || '9092';
export const getOpenBrowser = () =>
  process.env.OPEN_BROWSER === 'TRUE' || false;
export const getForwardHeaders = () =>
  process.env.FORWARD_HEADERS === 'TRUE' || false;
export const getCustomHeaders = () =>
  process.env.CUSTOM_HEADERS?.split(',') || [];
export const getAllowedHosts = () =>
  process.env.ALLOWED_HOSTS?.split(',') || [];
