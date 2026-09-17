-- Standard Postgres DDL Schema for Media Literacy Project
-- Replaces Supabase-specific configurations (RLS, policies, etc.)

-- Create sessions table (anonymous session tracking)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY, -- generated on client (v4 UUID)
    age_range TEXT NOT NULL, -- e.g. "50-59", "60-69", "70-79", "80+"
    role TEXT DEFAULT 'elder', -- 'elder' | 'leader'
    location_consent BOOLEAN NOT NULL DEFAULT false,
    selected_district TEXT,
    selected_sub_district TEXT,
    gps_latitude NUMERIC, -- browser coordinates
    gps_longitude NUMERIC, -- browser coordinates
    user_agent TEXT,
    device_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create page_views table for user access logs
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    page_path TEXT NOT NULL,
    referrer TEXT,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create action_logs table for asynchronous event analytics
CREATE TABLE IF NOT EXISTS public.action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL, -- e.g., 'skip_video', 'enter_question', 'toggle_audio', etc.
    page_url TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create lesson_progress table for tracking course progression
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    lesson_id TEXT NOT NULL,
    video_completed_at TIMESTAMPTZ,
    game_completed_at TIMESTAMPTZ,
    PRIMARY KEY (session_id, lesson_id)
);

-- Create per-game leaderboard registry and score history
CREATE TABLE IF NOT EXISTS public.game_id (
    gid VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.player_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_uuid UUID NOT NULL UNIQUE,
    player_uuid UUID NOT NULL,
    name VARCHAR NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 30),
    gid VARCHAR REFERENCES public.game_id(gid) ON UPDATE CASCADE ON DELETE RESTRICT NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 1000000),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO public.game_id (gid, name)
VALUES
    ('G1', 'จริงหรือมั่ว?'),
    ('G2', 'จับสัญญาณมิจ'),
    ('G3', 'AI หรือ คน?'),
    ('G5', 'กางโล่กู้ชีพ'),
    ('G6', 'จำลองแชท LINE'),
    ('G13', 'ต่อไอติมรู้ทันสื่อ')
ON CONFLICT (gid) DO UPDATE SET name = EXCLUDED.name;

-- Browser roles must not access leaderboard tables directly; Next.js Route
-- Handlers use the server-side DATABASE_URL instead.
ALTER TABLE public.game_id ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_info ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.game_id FROM anon, authenticated;
REVOKE ALL ON TABLE public.player_info FROM anon, authenticated;

-- Create quiz_questions table for pretest/posttest questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id TEXT PRIMARY KEY, -- e.g. 'pre-q1', 'post-q1'
    test_type TEXT NOT NULL CHECK (test_type IN ('pretest', 'posttest')),
    question_text TEXT NOT NULL,
    media_url TEXT, -- image or video URL
    explanation TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create quiz_options table for pretest/posttest question choices
CREATE TABLE IF NOT EXISTS public.quiz_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id TEXT REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create quiz_attempts table for pretest/posttest completions
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('pretest', 'posttest')),
    score INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (session_id, test_type)
);

-- Create quiz_answers table for question responses
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id TEXT REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
    selected_option_id UUID REFERENCES public.quiz_options(id) ON DELETE CASCADE NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance tuning
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_session_id ON public.action_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session_id ON public.quiz_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON public.quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON public.quiz_options(question_id);
CREATE INDEX IF NOT EXISTS player_info_leaderboard_idx
    ON public.player_info(gid, score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS player_info_player_uuid_idx
    ON public.player_info(player_uuid);
