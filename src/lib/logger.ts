/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
export const logger = {
  log: (message: string, _meta?: any): void => {
    console.log(`LOG: ${message}`);
  },

  info: (message: string, _meta?: any): void => {
    console.info(`INFO: ${message}`);
  },

  warn: (message: string, _meta?: any): void => {
    console.warn(`WARN: ${message}`);
  },

  error: (message: string, _meta?: any): void => {
    console.error(`ERROR: ${message}`);
  },
};
