import * as chalk from 'chalk';
import * as open from 'open';

export const shutdown = (server) => {
  server.close();
  process.exit(0);
};

export const logServerStartup = (port: string) => {
  console.log(`\n${chalk.green('✔')} Your GraphQL Fake API is ready to use 🚀
    Here are your links:
  
    ${chalk.blue('❯')} Interactive Editor: http://localhost:${port}/editor
    ${chalk.blue('❯')} GraphQL API:        http://localhost:${port}/graphql
    ${chalk.blue('❯')} GraphQL Voyager:    http://localhost:${port}/voyager
  
    `);
};

export const openEditorInBrowser = (openEditor: boolean, port: string) => {
  if (openEditor) {
    setTimeout(() => open(`http://localhost:${port}/editor`), 500);
  }
};
