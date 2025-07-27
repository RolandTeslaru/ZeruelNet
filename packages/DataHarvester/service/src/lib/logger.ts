import chalk from 'chalk';
import { eventBus } from './eventBus';

type LogLevel = 'info' | 'error' | 'warn' | 'success' | 'debug';

const levelColors: { [key in LogLevel]: chalk.Chalk } = {
    info: chalk.blue,
    error: chalk.red,
    warn: chalk.yellow,
    success: chalk.green,
    debug: chalk.gray,
};

const emitLog = (level: LogLevel, message: string, data?: any) => {
    // 1. Emit the structured log event for WebSocket clients
    eventBus.emit('publish', {
        topic: 'harvester_logs',
        payload: {
            level,
            message,
            timestamp: new Date().toISOString(),
            data: data || null,
        }
    });

    // 2. Print the colorful log to the server console
    const color = levelColors[level] || chalk.white;
    const formattedMessage = `[${level.toUpperCase()}] ${message}`;
    if (data) {
        console.log(color(formattedMessage), data);
    } else {
        console.log(color(formattedMessage));
    }
}

export const Logger = {
    info: (message: string, data?: any) => emitLog('info', message, data),
    error: (message: string, data?: any) => emitLog('error', message, data),
    warn: (message: string, data?: any) => emitLog('warn', message, data),
    success: (message: string, data?: any) => emitLog('success', message, data),
    debug: (message: string, data?: any) => emitLog('debug', message, data),
}; 