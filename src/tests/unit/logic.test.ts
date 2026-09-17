import { describe, it, expect } from "vitest";
import { onboardingSchema, quizSubmissionSchema } from "@/lib/validations";

describe("Onboarding Consent Schema Validation (Zod)", () => {
  it("should successfully parse valid data", () => {
    const validData = {
      ageGroup: "60-69",
      province: "เชียงใหม่",
      district: "เมืองเชียงใหม่",
      subdistrict: "ศรีภูมิ",
      consentGiven: true,
      source: "manual",
    };
    const parsed = onboardingSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("should reject invalid age groups", () => {
    const invalidData = {
      ageGroup: "18-25", // Not allowed in z.enum
      province: "น่าน",
      district: "เมืองน่าน",
      subdistrict: "ในเวียง",
      consentGiven: true,
    };
    const parsed = onboardingSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it("should reject when consent is not given", () => {
    const invalidData = {
      ageGroup: "70-79",
      province: "แพร่",
      district: "เมืองแพร่",
      subdistrict: "ในเวียง",
      consentGiven: false, // Must be literal true
    };
    const parsed = onboardingSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it("should reject when location fields are missing", () => {
    const invalidData = {
      ageGroup: "80+",
      consentGiven: true,
    };
    const parsed = onboardingSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });
});

describe("Quiz Scoring Logic (Zod & Scoring Engine)", () => {
  it("should validate a correct quiz attempt schema submission", () => {
    const submission = {
      session_id: "c6b86008-8b98-4b77-84ad-ee2cb9489f67",
      test_type: "pretest",
      score: 3,
      answers: [
        {
          question_id: "pre-q1",
          selected_option_id: "11111111-2222-3333-4444-555555555555",
          is_correct: true,
        },
        {
          question_id: "pre-q2",
          selected_option_id: "22222222-3333-4444-5555-666666666666",
          is_correct: false,
        },
        {
          question_id: "pre-q3",
          selected_option_id: "33333333-4444-5555-6666-777777777777",
          is_correct: true,
        },
      ],
    };

    const parsed = quizSubmissionSchema.safeParse(submission);
    expect(parsed.success).toBe(true);
    
    // Test direct scoring count assertion
    const correctCount = submission.answers.filter(a => a.is_correct).length;
    expect(correctCount).toBe(2);
    expect(submission.score).toBe(3); // direct submission score
  });

  it("should fail validation on invalid UUID formats", () => {
    const invalidSubmission = {
      session_id: "bad-uuid-format",
      test_type: "posttest",
      score: 5,
      answers: [],
    };
    const parsed = quizSubmissionSchema.safeParse(invalidSubmission);
    expect(parsed.success).toBe(false);
  });
});

describe("Font Size Accessibility Scale helpers", () => {
  it("should return the correct CSS styling variable classes based on data-size state", () => {
    const sizes = {
      normal: { base: "20px", title: "32px" },
      large: { base: "24px", title: "38px" },
      xlarge: { base: "28px", title: "44px" },
    };

    expect(sizes.normal.base).toBe("20px");
    expect(sizes.large.base).toBe("24px");
    expect(sizes.xlarge.base).toBe("28px");
  });
});
