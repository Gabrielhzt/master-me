import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";

import { env } from "../config/env.js";

const groq = createGroq({
  apiKey: env.GROQ_API_KEY,
});

const mistral = createMistral({
  apiKey: env.MISTRAL_API_KEY,
});

// researchTopic() calls Groq's browser_search tool directly — that tool only
// works against a Groq-backed model, so this stays pinned to Groq regardless
// of which model powers structured generation below.
export const researchModel = groq("openai/gpt-oss-20b");

// Must be a model that supports the json_schema response format, structured
// output is how the course and lesson content are generated.
export const courseModel = mistral("mistral-medium-2505");
export const lessonModel = courseModel;
