import { createGroq } from "@ai-sdk/groq";

import { env } from "../config/env.js";

const groq = createGroq({
  apiKey: env.GROQ_API_KEY,
});

// Must be a model that supports the json_schema response format, structured
// output is how the course is generated. compound-* models do NOT support it
// and fail with a 400.
// https://console.groq.com/docs/structured-outputs#supported-models
export const courseModel = groq("openai/gpt-oss-20b");
