import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from '../lib/logger.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
