import type { ErrorRequestHandler } from "express";

type HttpError = Error & {
  status?: number;
  statusCode?: number;
  expose?: boolean;
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const httpErr = err as HttpError;
  const status = httpErr.statusCode ?? httpErr.status ?? 500;

  if (status < 500) {
    res.status(status).json({
      message: httpErr.expose ? httpErr.message : "Bad request",
    });
    return;
  }

  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
};
