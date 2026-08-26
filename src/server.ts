import { migrate } from "drizzle-orm/node-postgres/migrator";
import app from "./app.js";
import { env } from "./config/env.js";
import { db } from "./db/index.js";

async function start() {
  try {
    console.log("Applying database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Database migrations applied successfully.");

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server due to migration error:", error);
    process.exit(1);
  }
}

void start();

