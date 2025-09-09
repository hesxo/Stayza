import UnauthorizedError from "../../domain/errors/unauthorized-error.js";

const isAuthenticated = (req, res, next) => {
  try {
    const auth = typeof req.auth === "function" ? req.auth() : { isAuthenticated: false };
    if (auth && auth.isAuthenticated === false) {
      throw new UnauthorizedError("Unauthorized");
    }
    next();
  } catch (err) {
    next(err);
  }
};

export default isAuthenticated;