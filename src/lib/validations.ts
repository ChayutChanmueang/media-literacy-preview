import { z } from "zod";

// Onboarding & Consent Form validation schema
export const onboardingSchema = z.object({
  ageGroup: z.enum(["under-50", "50-59", "60-69", "70-79", "80+", "other"], {
    required_error: "กรุณาเลือกช่วงอายุของท่าน",
    invalid_type_error: "กรุณาเลือกช่วงอายุของท่าน",
  }),
  province: z.string({
    required_error: "กรุณาเลือกจังหวัด",
  }).min(1, "กรุณาเลือกจังหวัด"),
  district: z.string({
    required_error: "กรุณาเลือกอำเภอ",
  }).min(1, "กรุณาเลือกอำเภอ"),
  subdistrict: z.string({
    required_error: "กรุณาเลือกตำบล",
  }).min(1, "กรุณาเลือกตำบล"),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "กรุณากดยอมรับเงื่อนไขความเป็นส่วนตัว" }),
  }),
  source: z.string().default("manual"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

// Quiz scoring engine validation schemas
export const answerSchema = z.object({
  question_id: z.string().min(1),
  selected_option_id: z.string().uuid("ตัวเลือกไม่ถูกต้อง"),
  is_correct: z.boolean(),
});

export const quizSubmissionSchema = z.object({
  session_id: z.string().uuid("เซสชันไม่ถูกต้อง"),
  test_type: z.enum(["pretest", "posttest"]),
  score: z.number().min(0),
  answers: z.array(answerSchema),
});

export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;

// Certificate name schema
export const certificateNameSchema = z.object({
  nickname: z.string().min(1, "กรุณากรอกชื่อเล่นของท่าน").max(15, "ชื่อเล่นต้องไม่ยาวเกิน 15 ตัวอักษร"),
});

export type CertificateNameInput = z.infer<typeof certificateNameSchema>;

// Anonymous leaderboard player profile
export const leaderboardNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อของคุณ")
    .max(30, "ชื่อต้องไม่ยาวเกิน 30 ตัวอักษร"),
});

export const leaderboardPlayerSchema = leaderboardNameSchema.extend({
  player_uuid: z.string().uuid(),
});

export const leaderboardResultSchema = leaderboardPlayerSchema.extend({
  attempt_uuid: z.string().uuid(),
  gid: z.string().trim().toUpperCase().min(1),
  score: z.number().int().min(0),
});

export type LeaderboardNameInput = z.infer<typeof leaderboardNameSchema>;
export type LeaderboardPlayer = z.infer<typeof leaderboardPlayerSchema>;
export type LeaderboardResultInput = z.infer<typeof leaderboardResultSchema>;
