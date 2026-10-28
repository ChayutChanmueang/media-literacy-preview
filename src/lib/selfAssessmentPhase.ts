import ITEMS from "@/data/self-assessment-items.json";

export const SELF_ASSESSMENT_PHASES = {
  pre: { title: "แบบทดสอบก่อนเรียน" },
  post: { title: "แบบทดสอบหลังเรียน" },
} as const;

export type SelfAssessmentPhase = keyof typeof SELF_ASSESSMENT_PHASES;

/** Change whenever src/data/self-assessment-items.json changes (text, items added or removed),
 *  and add a matching row to self_assessment_item_sets / self_assessment_items. */
export const SELF_ASSESSMENT_ITEM_SET = "sa-v1";

/** Item ids of every set the server still accepts — keep old sets so queued offline submissions still save. */
export const SELF_ASSESSMENT_ITEM_SETS: Readonly<Record<string, readonly string[]>> = {
  [SELF_ASSESSMENT_ITEM_SET]: ITEMS.map((item) => item.id),
};

export const isSelfAssessmentPhase = (value: unknown): value is SelfAssessmentPhase =>
  value === "pre" || value === "post";

/**
 * Checks that a submission answers exactly the items of its set: every id once in `itemOrder`,
 * the same ids as keys of `answers`. Returns a reason when it doesn't, null when it does.
 */
export function findItemSetProblem(
  itemSet: string,
  answers: Record<string, number>,
  itemOrder: readonly string[],
): string | null {
  const expected = SELF_ASSESSMENT_ITEM_SETS[itemSet];
  if (!expected) return `unknown item_set "${itemSet}"`;

  const expectedIds = new Set(expected);
  const answerIds = Object.keys(answers);
  if (new Set(itemOrder).size !== itemOrder.length) return "item_order has duplicate ids";
  if (itemOrder.length !== expected.length || itemOrder.some((id) => !expectedIds.has(id))) {
    return "item_order does not match the item set";
  }
  if (answerIds.length !== expected.length || answerIds.some((id) => !expectedIds.has(id))) {
    return "answers do not match the item set";
  }
  return null;
}
