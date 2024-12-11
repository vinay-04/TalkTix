import type { NextFunction, Request, Response } from "express";
import { JwtTokenUtils } from "../utils/jwttokenUtils";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticateUser: (
  req: Request,
  res: Response,
  next: NextFunction,
) => void = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = JwtTokenUtils.verifyToken(token);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const isSpeaker = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "speaker") {
      return res
        .status(403)
        .json({ message: "Access denied. Speaker role required" });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Authorization failed",
    });
  }
};
