import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { coursesRouter } from "./features/courses/courses.routes.js";
import { coursesLimiter } from "./features/courses/courses.middleware.js";
import { requireAuth } from "./middleware/require-auth.js";
import { lessonsRouter } from "./features/lessons/lessons.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// MUST stay above express.json() — Better Auth reads the raw request body.
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/courses", requireAuth, coursesLimiter, coursesRouter);
app.use("/lessons", requireAuth, coursesLimiter, lessonsRouter);

// Must be after routes
app.use(notFoundHandler);
// Error middleware MUST be last
app.use(errorHandler);

export default app;
