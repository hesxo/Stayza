import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      auth(): {
        isAuthenticated: boolean;
        userId?: string;
        sessionId?: string;
        // Add other Clerk auth properties as needed
      } | null;
    }
  }
}

export {};
