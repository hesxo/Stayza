import { getAuth } from "@clerk/express";
import { NextFunction, Request, Response } from "express";
import ForbiddenError from "../../domain/errors/forbidden-error";

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const role = (auth?.sessionClaims?.metadata as any)?.role;

  if (role !== "admin") {
    throw new ForbiddenError("Forbidden");
  }
  next();
};

export default isAdmin;