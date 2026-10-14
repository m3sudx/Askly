
import type { RequestHandler } from "express";
import { AppError } from "../util/error.js";

const notFound: RequestHandler = (req, _res, next) => {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      404
    )
  );
};

export default notFound;
