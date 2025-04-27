#!/usr/bin/env node
import dotenv from 'dotenv';
import { runServer } from 'src/app';

dotenv.config();

(async () => {
  runServer();
})();
