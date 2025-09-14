import UnauthorizedError from "../../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  let auth: ReturnType<typeof getAuth> | undefined;
  try {
    auth = getAuth(req);
  } catch (e) {
    // Clerk middleware not initialized; treat as unauthenticated
    throw new UnauthorizedError("Unauthorized");
  }
  console.log("AUTH_OBJECT", auth);

  if (!auth || !auth.userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  // Expose userId to downstream handlers without re-calling getAuth
  (req as any).userId = auth.userId;

  next();
};

export default isAuthenticated;
