import chalk from "chalk";
import { curry } from "ramda";

export enum LogType {
  ERROR = "ERROR",
  INFO = "INFO",
  WARNING = "WARNING",
  SUCCESS = "SUCCESS",
  DEBUG = "DEBUG",
}

const logger = curry((type: keyof typeof LogType, message: string | number) => {
  switch (type) {
    case LogType.ERROR:
      console.error(chalk.red(`${LogType.ERROR}: `) + chalk.white(`${message}`));
      break;
    case LogType.INFO:
      console.log(chalk.blue(`${LogType.INFO}: `) + chalk.white(`${message}`));
      break;
    case LogType.WARNING:
      console.log(
        chalk.yellow(`${LogType.WARNING}: `) + chalk.white(`${message}`)
      );
      break;
    case LogType.SUCCESS:
      console.log(chalk.green(`${LogType.SUCCESS}: ${message}`));
      break;
    case LogType.DEBUG:
      console.log(chalk.white(`${LogType.DEBUG}: ${message}`));
      break;
    default:
      console.log(message);
      break;
  }
});

export const logError = logger(LogType.ERROR);
export const logWarning = logger(LogType.WARNING);
export const logInfo = logger(LogType.INFO);
export const logSuccess = logger(LogType.SUCCESS);
export const log = logger(LogType.DEBUG);
