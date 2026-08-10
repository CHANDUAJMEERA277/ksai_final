/**
 * Utility functions for AI Practice Engine:
 * - Text Normalization & Deduplication
 * - Weak Topic Extraction (From attempted INCORRECT questions ONLY)
 * - Marks & Score Calculation
 * - Certificate Eligibility Verification
 */

/**
 * Normalizes question text for strict deduplication comparison.
 * Lowercases, removes punctuation, and collapses whitespace.
 */
export function normalizeQuestionText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generates a unique hash key for a question.
 */
export function getQuestionHash(questionText: string): string {
  return normalizeQuestionText(questionText);
}

/**
 * Checks if a question text is a duplicate against a set of existing hashes.
 */
export function isDuplicateQuestion(questionText: string, existingHashes: Set<string>): boolean {
  const hash = getQuestionHash(questionText);
  if (!hash) return true;
  return existingHashes.has(hash);
}

/**
 * Question mark allocation mapping:
 * - Easy: 2 marks
 * - Medium: 3 marks
 * - Hard: 5 marks
 * - Coding: 5 marks
 */
export function getQuestionMarks(difficulty: string, type?: string): number {
  if (type === "coding" || type === "code") return 5;
  const d = String(difficulty).toLowerCase();
  if (d === "easy") return 2;
  if (d === "hard") return 5;
  return 3;
}

/**
 * Calculates score percentage based strictly on attempted questions:
 * - If attemptedCount === 0 => scorePercent = 0
 * - Else => scorePercent = Math.round((earnedMarks / totalMarks) * 100)
 */
export function calculatePracticeScore({
  earnedMarks,
  totalMarks,
  attemptedCount,
}: {
  earnedMarks: number;
  totalMarks: number;
  attemptedCount: number;
}): number {
  if (attemptedCount === 0 || totalMarks === 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((earnedMarks / totalMarks) * 100)));
}

/**
 * Calculates accuracy strictly across attempted questions:
 * - If attemptedCount === 0 => accuracy = 0
 * - Else => accuracy = Math.round((correctCount / attemptedCount) * 100)
 */
export function calculateAccuracy({
  correctCount,
  attemptedCount,
}: {
  correctCount: number;
  attemptedCount: number;
}): number {
  if (attemptedCount === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((correctCount / attemptedCount) * 100)));
}

/**
 * Extracts Weak Topics strictly from attempted INCORRECT questions ONLY.
 * - Ignores skipped questions.
 * - Returns array of topic names sorted by frequency of incorrect answers.
 */
export function extractWeakTopicsFromIncorrectOnly(
  perQuestionEvaluations: Array<{
    topic?: string | null;
    isAttempted?: boolean;
    isCorrect?: boolean;
    correct?: boolean;
  }>
): string[] {
  const incorrectTopicCounts: Record<string, number> = {};

  for (const item of perQuestionEvaluations) {
    const isAttempted = Boolean(item.isAttempted);
    const isCorrect = Boolean(item.isCorrect ?? item.correct);

    if (isAttempted && !isCorrect) {
      const t = String(item.topic || "General").trim();
      if (t) {
        incorrectTopicCounts[t] = (incorrectTopicCounts[t] || 0) + 1;
      }
    }
  }

  // Sort by frequency descending
  return Object.keys(incorrectTopicCounts).sort(
    (a, b) => incorrectTopicCounts[b] - incorrectTopicCounts[a]
  );
}

/**
 * Verifies certificate eligibility:
 * - All questions attempted (attemptedCount === totalQuestions)
 * - Score >= 75%
 * - Proctor mode = ON (isProctored === true)
 */
export function checkCertificateEligibility({
  scorePercent,
  attemptedCount,
  totalQuestions,
  isProctored,
}: {
  scorePercent: number;
  attemptedCount: number;
  totalQuestions: number;
  isProctored: boolean;
}): boolean {
  if (!isProctored) return false;
  if (totalQuestions === 0 || attemptedCount < totalQuestions) return false;
  return scorePercent >= 75;
}
