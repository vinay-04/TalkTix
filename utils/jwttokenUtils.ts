import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

interface TokenPayload {
  userId: string;
  role: string;
}

export class JwtTokenUtils {
  private static readonly SECRET_KEY = process.env.JWT_SECRET_KEY;

  generateToken(payload: TokenPayload, expiresIn = "48h"): string {
    if (!JwtTokenUtils.SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }
    return jwt.sign(payload, JwtTokenUtils.SECRET_KEY, { expiresIn });
  }

  static verifyToken(token: string): TokenPayload {
    if (!JwtTokenUtils.SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }
    try {
      const decoded = jwt.verify(token, JwtTokenUtils.SECRET_KEY);
      return decoded as unknown as TokenPayload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as unknown as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}
