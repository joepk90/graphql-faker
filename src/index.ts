#!/usr/bin/env node
import * as dotenv from 'dotenv';
import { runServer } from 'src/app';

dotenv.config();

(async () => {
  runServer();
})();
