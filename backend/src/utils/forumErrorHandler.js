// src/utils/forumErrorHandler.js

export const FORUM_ERRORS = {
  UNAUTHORIZED: { status: 401, message: 'Unauthorized' },
  FORBIDDEN: { status: 403, message: 'Forbidden' },
  NOT_FOUND: { status: 404, message: 'Not found' },
  VALIDATION_ERROR: { status: 400, message: 'Validation error' },
  SERVER_ERROR: { status: 500, message: 'Internal server error' },
  COURSE_NOT_FOUND: { status: 404, message: 'Course not found' },
  POST_NOT_FOUND: { status: 404, message: 'Post not found' },
  REPLY_NOT_FOUND: { status: 404, message: 'Reply not found' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  POST_LOCKED: { status: 403, message: 'Post is locked' },
  NOT_ENROLLED: { status: 403, message: 'You are not enrolled in this course' },
  NOT_AUTHOR: { status: 403, message: 'You are not the author of this post' },
  NOT_AUTHOR_OR_STAFF: { status: 403, message: 'Only the author or staff can modify this' }
};

/**
 * Send formatted error response
 */
export const sendError = (res, errorKey, customMessage = null) => {
  const error = FORUM_ERRORS[errorKey] || FORUM_ERRORS.SERVER_ERROR;
  return res.status(error.status).json({
    message: customMessage || error.message,
    error: errorKey
  });
};

/**
 * Handle validation errors
 */
export const sendValidationError = (res, errors) => {
  return res.status(400).json({
    message: 'Validation failed',
    errors,
    error: 'VALIDATION_ERROR'
  });
};

/**
 * Send success response
 */
export const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json(data);
};

/**
 * Handle async errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  FORUM_ERRORS,
  sendError,
  sendValidationError,
  sendSuccess,
  asyncHandler
};
