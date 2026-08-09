/**
 * XP Configuration & Reward Constants
 * 
 * Centralized definition of XP reward amounts for all learning activities.
 * All XP calculations must happen server-side using these constants to prevent tampering.
 */

export const XP_CONFIG = {
  /**
   * Base XP awarded for completing a chapter reading / lesson.
   * Rationale: Standard reward for engaging with core learning content.
   */
  CHAPTER_COMPLETE: 50,

  /**
   * Base XP awarded for passing a chapter quiz (score >= 70%).
   * Rationale: Higher reward than simple reading to incentivize active retention.
   */
  QUIZ_PASS: 100,

  /**
   * Accuracy bonus awarded when a student achieves a perfect 100% score on a quiz.
   * Rationale: Extra reward for mastery and complete correctness on first or retry attempts.
   */
  ACCURACY_BONUS_PERFECT_QUIZ: 50,

  /**
   * Challenge completion rewards scaled by problem difficulty tier.
   * - EASY: 30 XP (Quick syntax and concept checks)
   * - MEDIUM: 75 XP (Algorithmic & multi-step problems)
   * - HARD: 150 XP (Complex DSA, optimization, and system problems)
   */
  CHALLENGE_SOLVED: {
    EASY: 30,
    MEDIUM: 75,
    HARD: 150,
  },

  /**
   * Daily streak milestone bonuses awarded when reaching continuous activity milestones.
   * Key milestones:
   * - 3 Days:  50 XP  (Early habit-building bonus)
   * - 7 Days:  150 XP (1 Week streak milestone)
   * - 14 Days: 300 XP (2 Weeks continuous learning)
   * - 30 Days: 1000 XP (1 Month major streak milestone)
   */
  STREAK_MILESTONES: {
    3: 50,
    7: 150,
    14: 300,
    30: 1000,
  } as Record<number, number>,
} as const;

export type XpSourceType =
  | "chapter_complete"
  | "quiz_pass"
  | "challenge_solved"
  | "streak_bonus"
  | "accuracy_bonus"
  | "ai_chat"
  | "editor_practice";
