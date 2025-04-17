#!/usr/bin/env node

import { getConfig } from 'src/config';
import { runServer } from 'src/app';

(async () => {
  const options = getConfig();

  runServer(options);
})();
