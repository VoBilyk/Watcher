import { commonEnvironment } from './enviroment.common';

export const environment = {
  ...commonEnvironment,
  production: true,
  server_url: 'https://bsa-watcher.azurewebsites.net/api',
  client_url: 'https://bsa-watcher.azurewebsites.net'
};
