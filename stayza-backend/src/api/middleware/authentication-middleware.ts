import UnauthorizedError from "../../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  console.log("AUTH_OBJECT", auth);

  if (!auth || !auth.userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  next();
};

export default isAuthenticated;
