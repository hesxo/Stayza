import NotFoundError from "../../domain/errors/not-found-error-error.js";
import ValidationError from "../../domain/errors/validation-error.js";

export default function globalErrorHandlingMiddleware(err, req, res, next) {
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ message: err.message });
    return;
  }

  if (err && err.name === "ValidationError") {
    const message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ") || "Validation error";
    res.status(400).json({ message });
    return;
  }

  if (err && err.name === "CastError") {
    res.status(400).json({ message: "Invalid identifier" });
    return;
  }

  const isDuplicateKey =
    (err && err.code === 11000) ||
    (err && typeof err.message === "string" && err.message.includes("E11000"));
  if (isDuplicateKey) {
    const fields = err.keyValue ? Object.keys(err.keyValue).join(", ") : undefined;
    const fieldPart = fields ? ` for fields: ${fields}` : "";
    res.status(409).json({ message: `Duplicate value${fieldPart}` });
    return;
  }

  const showStack = process.env.NODE_ENV !== "production";
  res.status(500).json({
    message: "Internal server error",
    ...(showStack ? { error: err?.message, stack: err?.stack } : {}),
  });
}
