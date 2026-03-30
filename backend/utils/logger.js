import winston from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';

const logDir = path.resolve('logs');
const isWritableLogsDir = () => {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.accessSync(logDir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

const useFileLogging =
  process.env.NODE_ENV !== 'production' && !process.env.VERCEL && isWritableLogsDir();

const { combine, timestamp, printf, errors, json, colorize } = winston.format;

// Format for console log
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const documentRotateOptions = {
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d' // retain logs for 14 days
};

const buildTransports = (level) => {
  if (!useFileLogging) {
    return [
      new winston.transports.Console({
        level,
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          errors({ stack: true }),
          json()
        ),
      }),
    ];
  }

  return [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      level: 'error',
      ...documentRotateOptions,
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      ...documentRotateOptions,
    }),
  ];
};

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'giftsutra-backend' },
  transports: buildTransports('info'),
});

export const auditLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'audit-trail' },
  transports: !useFileLogging
    ? buildTransports('info')
    : [
        new winston.transports.DailyRotateFile({
          filename: path.join(logDir, 'audit-%DATE%.log'),
          ...documentRotateOptions,
        }),
      ],
});

if (useFileLogging) {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    ),
  }));
}
