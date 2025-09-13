import NotFoundError from "../../domain/errors/not-found-error.js";
import ValidationError from "../../domain/errors/validation-error.js";
import UnauthorizedError from "../../domain/errors/unauthorized-error.js";

const globalErrorHandlingMiddleware = (error, req, res, next) => {
  console.log("Global error handler caught:", error.name, error.code, error.message);
  if (error instanceof NotFoundError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else if (error instanceof UnauthorizedError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
  } else if (error && error.code === 11000) {
    // Duplicate key error
    console.log("Handling duplicate key error");
    res.status(409).json({
      message: "Location already exists",
    });
  } else {
    console.log("Falling through to 500 error");
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default globalErrorHandlingMiddleware;