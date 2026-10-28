-- Postgres schema for the Media Literacy project
-- Matches the self-hosted Supabase DBs (100.75.225.202, 100.75.146.233) as checked on 2026-10-28:
-- column order, constraints and indexes are what those databases actually have.
-- Every table has RLS enabled with no policies, so anon/authenticated (PostgREST)
-- cannot read or write rows; the Next.js route handlers connect with DATABASE_URL.

-- Anonymous session tracking (one row per device/browser)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY, -- generated on client (v4 UUID)
    age_range TEXT NOT NULL, -- e.g. "50-59", "60-69", "70-79", "80+"; 'unknown' when created by a log before consent
    role TEXT DEFAULT 'elder', -- 'elder' | 'leader'
    location_consent BOOLEAN NOT NULL DEFAULT false,
    selected_district TEXT,
    selected_sub_district TEXT,
    gps_latitude NUMERIC, -- unused: GPS lookup was removed (FB-2026-08-18), always NULL
    gps_longitude NUMERIC, -- unused: always NULL
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    device_metadata JSONB DEFAULT '{}'::jsonb -- added later by scripts/migrate-db.cjs
);

-- User access logs (no rows are written in practice)
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id),
    page_path TEXT NOT NULL,
    referrer TEXT,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Asynchronous event analytics
CREATE TABLE IF NOT EXISTS public.action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id),
    event_name TEXT NOT NULL, -- e.g., 'skip_video', 'enter_question', 'toggle_audio', etc.
    page_url TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Course progression
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    session_id UUID REFERENCES public.sessions(id) NOT NULL,
    lesson_id TEXT NOT NULL,
    video_completed_at TIMESTAMPTZ,
    game_completed_at TIMESTAMPTZ,
    PRIMARY KEY (session_id, lesson_id)
);

-- Per-game leaderboard registry and score history
CREATE TABLE IF NOT EXISTS public.game_id (
    gid VARCHAR PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS public.player_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    name VARCHAR NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 30),
    gid VARCHAR REFERENCES public.game_id(gid) NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 1000000),
    player_uuid UUID NOT NULL,
    attempt_uuid UUID NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS player_info_leaderboard_idx
    ON public.player_info(gid, score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS player_info_player_uuid_idx
    ON public.player_info(player_uuid);

INSERT INTO public.game_id (gid, name)
VALUES
    ('G1', 'จริงหรือมั่ว?'),
    ('G2', 'จับสัญญาณมิจ'),
    ('G3', 'AI หรือ คน?'),
    ('G5', 'กางโล่กู้ชีพ'),
    ('G6', 'จำลองแชท LINE'),
    ('G13', 'ต่อไอติมฝึกสมอง'),
    ('G15', 'ลองถามเอไอ'),
    ('G16', 'คิดก่อนโพสต์'),
    ('G17', 'โล่กันโกง'),
    ('G18', 'จำให้ขึ้นใจ'),
    ('G19', 'เรียงผลไม้'),
    ('G20', 'ผักบุ้งลอยฟ้าช')
ON CONFLICT (gid) DO UPDATE SET name = EXCLUDED.name;

-- Legacy multiple-choice pretest/posttest (/pretest, /posttest; not used by research mode)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id TEXT PRIMARY KEY, -- e.g. 'pre-q1', 'post-q1'
    test_type TEXT NOT NULL CHECK (test_type IN ('pretest', 'posttest')),
    question_text TEXT NOT NULL,
    media_url TEXT, -- image or video URL
    explanation TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id TEXT REFERENCES public.quiz_questions(id) NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- No UNIQUE (session_id, test_type) on the live DBs, so the ON CONFLICT upsert in
-- src/app/api/quiz-attempts/route.ts fails there; the route is legacy-only.
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('pretest', 'posttest')),
    score INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.quiz_attempts(id) NOT NULL,
    question_id TEXT REFERENCES public.quiz_questions(id) NOT NULL,
    selected_option_id UUID REFERENCES public.quiz_options(id) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_id ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Research mode: pre/post self-assessment
-- Reuses public.sessions (participant, demographics, pre<->post key) and
-- public.action_logs (behaviour events, backfill source) unchanged.
-- ============================================================================

-- 1) Item catalogue: which statement text an item id meant in a given set
CREATE TABLE IF NOT EXISTS public.self_assessment_item_sets (
    item_set TEXT PRIMARY KEY,                          -- 'sa-v1'
    item_count SMALLINT NOT NULL CHECK (item_count > 0),  -- used by views to flag incomplete sets
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.self_assessment_items (
    item_set TEXT NOT NULL REFERENCES public.self_assessment_item_sets(item_set) ON DELETE RESTRICT,
    item_id TEXT NOT NULL,                              -- 'sa-01'
    text TEXT NOT NULL,
    sort_order SMALLINT NOT NULL,                       -- order in the JSON file (display is shuffled)
    PRIMARY KEY (item_set, item_id),
    UNIQUE (item_set, sort_order)
);

-- 2) One row per press of "submit"
CREATE TABLE IF NOT EXISTS public.self_assessment_submissions (
    submission_uuid UUID PRIMARY KEY,                   -- client crypto.randomUUID(); idempotency key
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE RESTRICT,
    phase TEXT NOT NULL CHECK (phase IN ('pre', 'post')),
    item_set TEXT NOT NULL REFERENCES public.self_assessment_item_sets(item_set) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ,                             -- client clock: questions page opened
    submitted_at TIMESTAMPTZ NOT NULL,                  -- client clock: submit pressed
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),     -- server clock
    app_mode TEXT CHECK (app_mode IN ('normal', 'research')),  -- NULL only for backfill
    app_version TEXT,
    is_dev_skip BOOLEAN NOT NULL DEFAULT false,
    source TEXT NOT NULL DEFAULT 'client' CHECK (source IN ('client', 'backfill')),
    source_log_id UUID,                                 -- action_logs.id the backfill row came from
    client_meta JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(client_meta) = 'object'),
    UNIQUE (submission_uuid, item_set),                 -- target of the answers FK below
    CHECK (started_at IS NULL OR started_at <= submitted_at),
    CHECK (source = 'backfill' OR app_mode IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_sa_submissions_session_phase
    ON public.self_assessment_submissions(session_id, phase, submitted_at);

-- Pre and post once per session (live, non-test rows only; old backfilled repeats are allowed)
CREATE UNIQUE INDEX IF NOT EXISTS uq_sa_submissions_once_per_phase
    ON public.self_assessment_submissions(session_id, phase)
    WHERE source = 'client' AND NOT is_dev_skip;

CREATE UNIQUE INDEX IF NOT EXISTS uq_sa_submissions_source_log
    ON public.self_assessment_submissions(source_log_id)
    WHERE source_log_id IS NOT NULL;

-- 3) One row per answered item
CREATE TABLE IF NOT EXISTS public.self_assessment_answers (
    submission_uuid UUID NOT NULL,
    item_set TEXT NOT NULL,
    item_id TEXT NOT NULL,
    value SMALLINT NOT NULL,
    shown_position SMALLINT NOT NULL CHECK (shown_position >= 1),   -- 1 = first on screen
    PRIMARY KEY (submission_uuid, item_id),
    UNIQUE (submission_uuid, shown_position),
    FOREIGN KEY (submission_uuid, item_set)
        REFERENCES public.self_assessment_submissions(submission_uuid, item_set) ON DELETE CASCADE,
    FOREIGN KEY (item_set, item_id)
        REFERENCES public.self_assessment_items(item_set, item_id) ON DELETE RESTRICT,
    CHECK (value BETWEEN 1 AND 5)
);

-- 4) Analysis views (security_invoker so they never bypass the tables' RLS)
CREATE OR REPLACE VIEW public.self_assessment_primary
WITH (security_invoker = true) AS
SELECT DISTINCT ON (session_id, phase) *
FROM public.self_assessment_submissions
WHERE NOT is_dev_skip
ORDER BY session_id, phase, submitted_at, received_at;

CREATE OR REPLACE VIEW public.self_assessment_scores
WITH (security_invoker = true) AS
SELECT s.submission_uuid, s.session_id, s.phase, s.item_set, s.submitted_at,
       count(a.*)                       AS answered,
       sum(a.value)                     AS total,
       round(avg(a.value), 2)           AS mean,
       count(a.*) = st.item_count       AS is_complete,
       count(DISTINCT a.value) = 1      AS is_straight_line
FROM public.self_assessment_primary s
JOIN public.self_assessment_item_sets st USING (item_set)
LEFT JOIN public.self_assessment_answers a USING (submission_uuid)
GROUP BY s.submission_uuid, s.session_id, s.phase, s.item_set, s.submitted_at, st.item_count;

CREATE OR REPLACE VIEW public.self_assessment_pairs
WITH (security_invoker = true) AS
SELECT pre.session_id, pre.item_set,
       pre.submission_uuid AS pre_submission, post.submission_uuid AS post_submission,
       pre.total AS pre_total, post.total AS post_total, post.total - pre.total AS diff,
       pre.is_straight_line AS pre_straight_line, post.is_straight_line AS post_straight_line
FROM public.self_assessment_scores pre
JOIN public.self_assessment_scores post
  ON post.session_id = pre.session_id AND post.item_set = pre.item_set AND post.phase = 'post'
WHERE pre.phase = 'pre' AND pre.is_complete AND post.is_complete;

-- 5) Server-only access (Next.js route handlers use DATABASE_URL)
ALTER TABLE public.self_assessment_item_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_assessment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_assessment_answers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE
    public.self_assessment_item_sets, public.self_assessment_items,
    public.self_assessment_submissions, public.self_assessment_answers,
    public.self_assessment_primary, public.self_assessment_scores, public.self_assessment_pairs
FROM anon, authenticated;

-- Seed: item set sa-v1 = src/data/self-assessment-items.json (add a new item_set whenever that file changes)
INSERT INTO public.self_assessment_item_sets (item_set, item_count) VALUES ('sa-v1', 12)
ON CONFLICT (item_set) DO NOTHING;

INSERT INTO public.self_assessment_items (item_set, item_id, text, sort_order)
VALUES
    ('sa-v1', 'sa-01', 'ฉันรู้ว่าข้อมูลสุขภาพที่แชร์กันใน LINE อาจไม่ถูกต้องและไม่ควรเชื่อทันที', 1),
    ('sa-v1', 'sa-02', 'เมื่อเห็นข่าวหรือคลิปที่ทำให้รู้สึกโกรธ กลัว หรือตื่นเต้นมาก ฉันจะหยุดคิดก่อนว่าอาจถูกสร้างขึ้นมาเพื่อหลอกให้เชื่อ', 2),
    ('sa-v1', 'sa-03', 'ฉันไม่ส่งต่อข้อมูลในกลุ่ม LINE ถ้ายังไม่แน่ใจว่าเป็นความจริง', 3),
    ('sa-v1', 'sa-04', 'ฉันรู้ว่า AI สามารถสร้างเสียงของคนที่เราคุ้นเคยได้ เช่น เสียงลูกหลานหรือหมอ', 4),
    ('sa-v1', 'sa-05', 'ฉันมั่นใจว่าถึงแม้ภาพหรือวิดีโอจะดูสมจริงมาก ก็อาจถูกสร้างจาก AI ได้', 5),
    ('sa-v1', 'sa-06', 'ฉันมั่นใจว่าสามารถสังเกตได้ว่าภาพ วิดีโอ หรือข้อความนั้นถูกสร้างโดย AI หรือไม่', 6),
    ('sa-v1', 'sa-07', 'เมื่อเห็นวิดีโอหรือได้ยินเสียงที่อ้างว่าเป็นคนดังหรือผู้เชี่ยวชาญ ฉันจะไม่เชื่อทันทีโดยไม่ตรวจสอบก่อน', 7),
    ('sa-v1', 'sa-08', 'เมื่อมีคนส่งลิงก์มาหรือขอข้อมูลส่วนตัว ฉันจะตรวจสอบก่อนว่าใครเป็นคนส่งมาทุกครั้ง', 8),
    ('sa-v1', 'sa-09', 'ฉันรู้ว่ามิจฉาชีพมักแอบอ้างเป็นหน่วยงานที่น่าเชื่อถือ เช่น ธนาคาร ตำรวจ หรือโรงพยาบาล', 9),
    ('sa-v1', 'sa-10', 'ฉันมั่นใจว่าจะไม่โอนเงินหรือบอกรหัสข้อมูลส่วนตัวใดๆ แม้ผู้โทรจะฟังดูน่าเชื่อหรืออ้างว่าเร่งด่วน', 10),
    ('sa-v1', 'sa-11', 'ถ้าฉันไม่แน่ใจว่าสิ่งที่เห็นออนไลน์เป็นการหลอกลวงหรือของปลอม ฉันจะถามคนที่ไว้ใจได้ก่อน', 11),
    ('sa-v1', 'sa-12', 'ฉันมั่นใจว่าตัวเองจะไม่ถูกหลอกจากมิจฉาชีพ ทางข้อความ โทรศัพท์ หรือออนไลน์', 12)
ON CONFLICT (item_set, item_id) DO NOTHING;
