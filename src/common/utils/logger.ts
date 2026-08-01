import log from 'npmlog';

export class Logger {
    public static info(prefix: string, message: string, ...args: any[]): void {
        log.info(prefix, message, ...args);
    }

    public static error(prefix: string, message: string, ...args: any[]): void {
        log.error(prefix, message, ...args);
    }

    public static warn(prefix: string, message: string, ...args: any[]): void {
        log.warn(prefix, message, ...args);
    }

    public static get log() {
        return log;
    }
}

export const logger = Logger.log;
