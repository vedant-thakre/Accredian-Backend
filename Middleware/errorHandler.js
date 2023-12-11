export const ErrorHandler = (message, statusCode, res) => {
  return res.status(statusCode).json({
    status: false,
    message: message,
  });
};
