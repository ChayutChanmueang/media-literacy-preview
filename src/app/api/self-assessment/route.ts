import { NextRequest, NextResponse } from "next/server";
import { getDatabasePool } from "@/lib/database";
import { findItemSetProblem } from "@/lib/selfAssessmentPhase";
import {
  getSelfAssessmentStatus,
  saveSelfAssessmentSubmission,
  type DbPool,
} from "@/lib/selfAssessmentStore";
import { selfAssessmentStatusQuerySchema, selfAssessmentSubmissionSchema } from "@/lib/validations";

// Research pre/post self-assessment — see docs/software/10-research-pre-post-backend.md.
// There is deliberately no endpoint that returns answers; research data leaves via scripts/export-self-assessment.cjs.

const pool = () => getDatabasePool() as unknown as DbPool;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลแบบทดสอบไม่ถูกต้อง" }, { status: 400 });
  }

  const parsed = selfAssessmentSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลแบบทดสอบไม่ถูกต้อง" }, { status: 400 });
  }

  const problem = findItemSetProblem(parsed.data.item_set, parsed.data.answers, parsed.data.item_order);
  if (problem) {
    return NextResponse.json({ error: "คำตอบไม่ครบหรือไม่ตรงกับชุดคำถาม", reason: problem }, { status: 400 });
  }

  try {
    const result = await saveSelfAssessmentSubmission(pool(), parsed.data);
    if (result.status === "duplicate") {
      return NextResponse.json({ duplicate: true, reason: result.reason }, { status: 200 });
    }
    return NextResponse.json({ submission: result.submission }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/self-assessment:", error);
    return NextResponse.json({ error: "ไม่สามารถบันทึกแบบทดสอบได้" }, { status: 500 });
  }
}

/** GET /api/self-assessment?session_id=<uuid> → { pre: boolean, post: boolean } (no answers). */
export async function GET(request: NextRequest) {
  const parsed = selfAssessmentStatusQuerySchema.safeParse({
    session_id: request.nextUrl.searchParams.get("session_id"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "เซสชันไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    const status = await getSelfAssessmentStatus(pool(), parsed.data.session_id);
    return NextResponse.json({ status }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/self-assessment:", error);
    return NextResponse.json({ error: "ไม่สามารถตรวจสถานะแบบทดสอบได้" }, { status: 500 });
  }
}
