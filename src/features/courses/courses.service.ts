import { UnprocessableEntityError } from "../../lib/errors.js";
import { classifyTopic, researchTopic, generateCourse } from "./courses.ai.js";
import {
  slugify,
  findCourseBySlug,
  persistCourse,
  enroll,
} from "./courses.repository.js";

export const courseService = {
  async createCourse(input: {
    topic: string;
    userId: string;
    signal: AbortSignal;
  }) {
    const classification = await classifyTopic(input.topic, input.signal);

    if (!classification.accepted) {
      throw new UnprocessableEntityError(
        "Value not accepted. Enter a programming language or framework.",
      );
    }

    const slug = slugify(classification.canonicalName);

    let existing = await findCourseBySlug(slug);
    const cached = Boolean(existing);

    // Catalog miss — generate once, then everyone else reuses it for free.
    if (!existing) {
      const research = await researchTopic(
        classification.canonicalName,
        input.signal,
      );

      const generated = await generateCourse(
        classification.canonicalName,
        research,
        input.signal,
      );

      await persistCourse({
        slug,
        topic: classification.canonicalName,
        generated,
      });

      // Re-read rather than using the insert result: if we lost the race, this
      // returns the course the winner wrote.
      existing = await findCourseBySlug(slug);
    }

    if (!existing) {
      throw new Error(`Course ${slug} missing after write`);
    }

    await enroll(input.userId, existing.id);

    return { course: existing, cached };
  },
};
