#!/usr/bin/env node

import { getConfig } from './config';
import { runServer } from './app';

(async () => {
  const options = getConfig();

  runServer(options);
})();
