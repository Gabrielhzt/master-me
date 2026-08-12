import { NotFoundError, UnprocessableEntityError } from "../../lib/errors.js";
import { classifyTopic, researchTopic, generateCourse } from "./courses.ai.js";
import { coursesRepository } from "./courses.repository.js";

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

    const slug = coursesRepository.slugify(classification.canonicalName);

    let existing = await coursesRepository.findCourseBySlug(slug);
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

      await coursesRepository.persistCourse({
        slug,
        topic: classification.canonicalName,
        generated,
      });

      // Re-read rather than using the insert result: if we lost the race, this
      // returns the course the winner wrote.
      existing = await coursesRepository.findCourseBySlug(slug);
    }

    if (!existing) {
      throw new Error(`Course ${slug} missing after write`);
    }

    await coursesRepository.enroll(input.userId, existing.id);

    return { course: existing, cached };
  },

  async getCourseBySlug(slug: string) {
    const course = await coursesRepository.findCourseBySlug(slug);

    if (!course) {
      throw new NotFoundError(`Course "${slug}" not found`);
    }

    return course;
  },
};
