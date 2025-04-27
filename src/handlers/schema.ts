import chalk from 'chalk';
import fs from 'fs';
import { Request, Response } from 'express';

import {
  getUserSDLWithDefaultSDLFallback,
  prepareRemoteSchema,
  prepareRemoteSDL,
  getSchemaFileName,
  getCustomSchemaFilePath,
} from 'src/utils';

export const schemaHandlerPost = () => {
  const fileName = getSchemaFileName();

  return (req: Request, res: Response) => {
    try {
      const customSchemaFilePath = getCustomSchemaFilePath();
      fs.writeFileSync(customSchemaFilePath, req.body);

      const date = new Date().toLocaleString();
      console.log(
        `${chalk.green('✚')} schema saved to ${chalk.magenta(
          fileName,
        )} on ${date}`,
      );

      res.status(200).send('ok');
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send('An unknown error occurred');
      }
    }
  };
};

export const schemaHandlerGet = () => {
  return async (_req: Request, res: Response) => {
    const remoteSchema = await prepareRemoteSchema();
    const userSDL = getUserSDLWithDefaultSDLFallback(remoteSchema);
    const remoteSDL = prepareRemoteSDL(remoteSchema);

    res.status(200).json({
      userSDL: userSDL.body,
      remoteSDL: remoteSDL?.body,
    });
  };
};
