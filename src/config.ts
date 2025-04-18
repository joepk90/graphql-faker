import * as dotenv from 'dotenv';

interface Options {
  fileName: string;
  port: number;
  corsOrigin: string | true;
  openEditor: boolean;
  extendURL: string | undefined;
  headers: { [key: string]: string };
  forwardHeaders: ReadonlyArray<string>;
}

export const getConfig = (): Options => {
  dotenv.config();

  const config = {
    fileName: './schema_extension.faker.graphql',
    port: 9002,
    openEditor: false,
    headers: {}, // Example default header
    forwardHeaders: ['user-agent', 'authorization'], // Example default forwarded headers
    cors: false,
    corsOrigin: '*',
    extendURL: process.env.EXTEND_URL,
  };

  return config;
};
