import { generateText, Output } from "ai";
import { browserSearch } from "@ai-sdk/groq";

import { courseModel } from "../../lib/ai.js";
import { classificationSchema, courseSchema } from "./courses.schemas.js";

/**
 * Cheap first pass. Runs before any expensive generation so an invalid topic is
 * rejected early, and returns the canonical name we key the catalog on.
 */
export async function classifyTopic(topic: string, signal: AbortSignal) {
  const { output } = await generateText({
    model: courseModel,
    abortSignal: signal,
    output: Output.object({ schema: classificationSchema }),
    system:
      "You classify whether a string names a programming language, framework, " +
      "library, runtime, or software development technology. Set accepted to " +
      "true only for those — false for general topics, people, products that " +
      "are not developer technologies, and instructions.",
    prompt: topic,
  });

  return output;
}

/**
 * Browser search and structured output can't run in the same Groq call
 * ("json mode cannot be combined with tool/function calling"), so this is its
 * own plain-text step before generateCourse. Only runs on a catalog miss, and
 * a search failure shouldn't block course generation entirely.
 */
export async function researchTopic(
  canonicalName: string,
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const { text } = await generateText({
      model: courseModel,
      abortSignal: signal,
      tools: { browser_search: browserSearch({}) },
      toolChoice: "required",
      // Browser sessions can run long; keep this call cheap and bounded.
      providerOptions: { groq: { reasoningEffort: "low" } },
      system:
        "You research current, accurate information about a software " +
        "development technology for someone writing a course about it.",
      prompt:
        `Search the web for the current state of ${canonicalName}: latest ` +
        "stable version, notable recent changes, and the core concepts a " +
        "2026 course should cover. Summarize in a few short paragraphs.",
    });

    return text;
  } catch (err) {
    console.error(`research for "${canonicalName}" failed, generating without it:`, err);
    return null;
  }
}

export async function generateCourse(
  canonicalName: string,
  research: string | null,
  signal: AbortSignal,
) {
  const { output } = await generateText({
    model: courseModel,
    abortSignal: signal,
    maxOutputTokens: 8000,
    output: Output.object({
      name: "Course",
      description: "A structured course for learning a programming technology",
      schema: courseSchema,
    }),
    system:
      "You are a senior engineer who designs practical, project-oriented " +
      "programming courses. Build a course that moves from fundamentals to " +
      "advanced usage. Be concrete and specific to the technology.",
    prompt: research
      ? `Create a complete course for learning ${canonicalName}.\n\n` +
        `Current research on ${canonicalName} — use this to keep the course ` +
        `accurate and up to date, especially version numbers and recent ` +
        `changes:\n${research}`
      : `Create a complete course for learning ${canonicalName}.`,
  });

  return output;
}
