import type { NextFunction, Request, RequestHandler, Response } from "express";

export const Logger: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(`Request: ${req.method} ${req.path}`);
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} | Completed in ${duration}ms | From ${req.ip} | ${res.statusCode}`,
    );
  });
  next();
};
