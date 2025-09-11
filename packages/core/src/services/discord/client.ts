import axios from "axios";

import { logger } from "@albion-raid-manager/core/logger";
import { sleep } from "@albion-raid-manager/core/scheduler";

export const discordApiClient = axios.create({
  baseURL: "https://discord.com/api/v10",
});

// Handle Discord 429: Too Many Requests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
discordApiClient.interceptors.response.use(null, async (error: any) => {
  const { config, response } = error;

  if (config && response && response.status == 429) {
    let retryAfter = 5000;
    if (response.data) retryAfter = response.data.retry_after || retryAfter;
    if (response.headers) retryAfter = response.headers["retry-after"] || retryAfter;
    logger.warn(`Discord API request to ${config.url} returned ${response.status}. Retrying in ${retryAfter}s...`, {
      response: {
        headers: response.headers,
        data: response.data,
      },
      retryAfter,
    });
    await sleep(retryAfter * 1000);
    return discordApiClient.request(config);
  }

  return Promise.reject(error);
});
