import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[paramName])) {
      return next(new AppError(`Invalid ${paramName}`, 400));
    }
    next();
  };
}
