import * as chalk from 'chalk';
import * as fs from 'fs';

import {
  getUserSDLWithDefaultSDLFallback,
  prepareRemoteSchema,
  prepareRemoteSDL,
  getSchemaFileName,
  getCustomerSchemaFilePath,
} from 'src/utils';

export const schemaHandlerPost = () => {
  const fileName = getSchemaFileName();

  return (req, res) => {
    try {
      const customSchemaFilePath = getCustomerSchemaFilePath();
      fs.writeFileSync(customSchemaFilePath, req.body);

      const date = new Date().toLocaleString();
      console.log(
        `${chalk.green('✚')} schema saved to ${chalk.magenta(
          fileName,
        )} on ${date}`,
      );

      res.status(200).send('ok');
    } catch (err) {
      res.status(500).send(err.message);
    }
  };
};

export const schemaHandlerGet = () => {
  return async (_, res) => {
    const remoteSchema = await prepareRemoteSchema();
    const userSDL = getUserSDLWithDefaultSDLFallback(remoteSchema);
    const remoteSDL = prepareRemoteSDL(remoteSchema);

    res.status(200).json({
      userSDL: userSDL.body,
      remoteSDL: remoteSDL?.body,
    });
  };
};
