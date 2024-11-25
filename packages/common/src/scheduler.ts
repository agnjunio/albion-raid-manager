import logger from "@black-river-gaming/logger";
import { CronJob } from "cron";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchedulerCallback = (fnOpts: any) => Promise<void>;

// Flag to keep infinite loops until program is closed
let running = true;
const timeoutIds = new Set<NodeJS.Timeout>();
const cronjobs = new Set<CronJob>();

const clean = () => {
  running = false;

  for (const timeoutId of timeoutIds) {
    logger.debug(`Cleaning timeout: ${timeoutId}`);
    clearTimeout(timeoutId);
    timeoutIds.delete(timeoutId);
  }

  for (const cronjob of cronjobs) {
    logger.debug(`Halting cronjob: ${cronjobs.size} remaining.`);
    cronjob.stop();
    cronjobs.delete(cronjob);
  }
};

//catches ctrl+c event
process.once("SIGINT", clean);
// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", clean);
process.on("SIGUSR2", clean);

export function sleep(milliseconds: number) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      timeoutIds.delete(timeoutId);
      return running ? resolve() : reject(new Error("Sleep trigger after program exited."));
    }, milliseconds);
    timeoutIds.add(timeoutId);
  });
}

export function timeout(fn: SchedulerCallback, milliseconds: number) {
  const timeout = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      reject(new Error(`Operation timeout (${milliseconds} ms)`));
    }, milliseconds);
    timeoutIds.add(timeoutId);
  });

  return Promise.race([fn, timeout]);
}

async function execFn(name: string, fn: SchedulerCallback, fnOpts: unknown) {
  try {
    return await fn(fnOpts);
  } catch (e) {
    logger.error(`An error ocurred in routine "${name}":`, e);
  }
}

// Functions that run on an interval after execFn completes,
// then waits (Default: 30 seconds) and repeat until process stops
export async function runInterval(
  name: string,
  fn: SchedulerCallback,
  fnOpts: unknown,
  { interval = 30000, runOnStart = false } = {},
) {
  if (!fn) return;
  if (runOnStart) {
    runInterval(name, fn, fnOpts, { interval, runOnStart: false });
    return await execFn(name, fn, fnOpts);
  }

  logger.debug(`Scheduling interval function: ${name}`, {
    name,
    interval,
    runOnStart,
  });
  while (running) {
    await sleep(interval);
    await execFn(name, fn, fnOpts);
  }
}

// Wrapper around cron which saves the jobs for halting
export function runCronjob(
  name: string,
  cronTime: string,
  fn: SchedulerCallback,
  fnOpts: unknown,
  { runOnStart = false } = {},
) {
  if (!fn) return;

  logger.debug(`Scheduling cronjob function: ${name}`, {
    name,
    cronTime,
    runOnStart,
  });
  const onTick = async () => {
    await execFn(name, fn, fnOpts);
  };
  const cronjob = new CronJob(cronTime, onTick, null, true, "utc", null, runOnStart);

  cronjobs.add(cronjob);
}

export function clearAll() {
  running = false;
}
