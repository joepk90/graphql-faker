import * as chalk from 'chalk';
import * as fs from 'fs';

export const schemaHandlerPost = (userSDL) => {
  return (req, res) => {
    try {
      const fileName = userSDL.name;
      fs.writeFileSync(fileName, req.body);

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

export const schemaHandlerGet = (userSDL, remoteSDL) => {
  return (_, res) => {
    res.status(200).json({
      userSDL: userSDL.body,
      remoteSDL: remoteSDL?.body,
    });
  };
};
