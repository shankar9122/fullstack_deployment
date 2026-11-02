import { AppError } from '../utils/AppError.js';

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
}

// Teachers may read; only admins may create, update or delete
export function adminOnlyWrites(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  return authorize('admin')(req, res, next);
}
