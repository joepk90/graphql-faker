#!/usr/bin/env node
import * as dotenv from 'dotenv';
import { getConfig } from 'src/config';
import { runServer } from 'src/app';

dotenv.config();

(async () => {
  const options = getConfig();
  runServer(options);
})();
