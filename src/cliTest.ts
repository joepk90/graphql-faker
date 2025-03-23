export function getConfig() {
  // Default options for headers and forwardHeaders
  const options = {
    port: '9002',
    open: false,
    header: {},  // Example default header
    forwardHeaders: ['user-agent', 'authorization'],  // Example default forwarded headers
    cors: false,
    corsOrigin: '*',
    extendURL: "https://myaccount.dev.merit.uw.systems/graphql"
  };

  const config = {
    fileName: './schema_extension.faker.graphql',
    port: options.port,
    cors: options.cors,
    open: options.open,
    headers: options.header,
    extendURL:  "https://myaccount.dev.merit.uw.systems/graphql",
    forwardHeaders: options.forwardHeaders,
    'cors-origin': options.corsOrigin,
  };

  return config;
}