const AppError = require('../utils/AppError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };
    
    // Sequelize Validation Error
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const message = error.errors.map(el => el.message).join('. ');
      error = new AppError(message, 400);
    }
    
    // JWT Errors
    if (error.name === 'JsonWebTokenError') error = new AppError('Invalid token. Please log in again.', 401);
    if (error.name === 'TokenExpiredError') error = new AppError('Your token has expired. Please log in again.', 401);

    sendErrorProd(error, res);
  }
};
