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
  // Ties the score to its player for the staff data export (docs/software/12 §11.2). Optional so
  // clients still running an older cached build can keep saving scores.
  session_id: z.string().uuid().optional(),
});

// Staff data export request (docs/software/12 §7.2)
export const dataExportRequestSchema = z
  .object({
    scope: z.discriminatedUnion("type", [
      z.object({ type: z.literal("all") }).strict(),
      z.object({ type: z.literal("session"), session_id: z.string().trim().uuid() }).strict(),
    ]),
    row_filter: z
      .object({
        registered_only: z.boolean().default(false),
        self_assessment_pair_only: z.boolean().default(false),
      })
      .strict()
      .default({}),
    groups: z
      .array(z.enum(["age", "location", "self_assessment", "usage_summary", "event_breakdown", "completion_funnel", "lesson_progress"]))
      .default([]),
    group_options: z.object({ self_assessment_items: z.boolean().default(true) }).strict().default({}),
    files: z.array(z.enum(["event_log", "usage_detail", "leaderboard"])).default([]),
  })
  .strict()
  .refine((value) => value.groups.length + value.files.length > 0, { message: "เลือกข้อมูลอย่างน้อย 1 ชุด" })
  .refine((value) => new Set(value.groups).size === value.groups.length && new Set(value.files).size === value.files.length, {
    message: "เลือกชุดข้อมูลซ้ำ",
  });

export type DataExportRequest = z.infer<typeof dataExportRequestSchema>;

// Research-mode self-assessment (pre/post) submission — see docs/software/10-research-pre-post-backend.md.
// Whether answers/item_order cover exactly the item set is checked by findItemSetProblem().
export const selfAssessmentSubmissionSchema = z.object({
  submission_uuid: z.string().uuid(),
  session_id: z.string().uuid(),
  phase: z.enum(["pre", "post"]),
  item_set: z.string().min(1),
  answers: z.record(z.string(), z.number().int().min(1).max(5)),
  item_order: z.array(z.string().min(1)).min(1),
  started_at: z.string().datetime({ offset: true }).optional(),
  submitted_at: z.string().datetime({ offset: true }),
  app_mode: z.enum(["normal", "research"]),
  app_version: z.string().max(32).optional(),
  is_dev_skip: z.boolean(),
  client_meta: z.record(z.string(), z.unknown()).optional(),
});

export const selfAssessmentStatusQuerySchema = z.object({
  session_id: z.string().uuid(),
});

export type SelfAssessmentSubmissionInput = z.infer<typeof selfAssessmentSubmissionSchema>;

export type LeaderboardNameInput = z.infer<typeof leaderboardNameSchema>;
export type LeaderboardPlayer = z.infer<typeof leaderboardPlayerSchema>;
export type LeaderboardResultInput = z.infer<typeof leaderboardResultSchema>;
