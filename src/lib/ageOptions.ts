// Figma node 2065:7239. Labels come from the design; values keep the buckets already stored in
// the database so data collected before this redesign stays comparable ("under-50" is new).
export const AGE_OPTIONS = [
  { value: "under-50", label: "น้อยกว่า 50" },
  { value: "50-59", label: "51 ถึง 59" },
  { value: "60-69", label: "61 ถึง 69" },
  { value: "70-79", label: "71 ถึง 79" },
  { value: "80+", label: "มากกว่า 80" },
] as const;

export type AgeGroup = (typeof AGE_OPTIONS)[number]["value"];
