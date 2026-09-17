-- ====================================================================
-- Media Literacy Project: Master SQL Analytics & Reporting Script
-- Database Schema: PostgreSQL / Supabase
-- Description: รวบรวม SQL Query สำหรับการวิเคราะห์ข้อมูลผู้เรียน,
--              การเปรียบเทียบผลสัมฤทธิ์ Pre/Post-Test,
--              ความก้าวหน้าในบทเรียน และสถิติรายข้อสอบ
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. OVERVIEW DASHBOARD (สรุปภาพรวมระบบ)
-- --------------------------------------------------------------------
SELECT 
    COUNT(DISTINCT s.id) AS total_sessions,
    COUNT(DISTINCT CASE WHEN s.role = 'elder' THEN s.id END) AS total_elder_users,
    COUNT(DISTINCT CASE WHEN s.role = 'leader' THEN s.id END) AS total_leader_users,
    COUNT(DISTINCT pre.session_id) AS total_pretest_completed,
    COUNT(DISTINCT post.session_id) AS total_posttest_completed,
    COUNT(DISTINCT paired.session_id) AS total_completed_both_tests,
    ROUND(
        COUNT(DISTINCT paired.session_id)::NUMERIC / NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2
    ) AS full_completion_rate_percent
FROM public.sessions s
LEFT JOIN public.quiz_attempts pre ON s.id = pre.session_id AND pre.test_type = 'pretest'
LEFT JOIN public.quiz_attempts post ON s.id = post.session_id AND post.test_type = 'posttest'
LEFT JOIN (
    SELECT session_id 
    FROM public.quiz_attempts 
    GROUP BY session_id 
    HAVING COUNT(DISTINCT test_type) = 2
) paired ON s.id = paired.session_id;


-- --------------------------------------------------------------------
-- 2. DEMOGRAPHICS ANALYSIS (วิเคราะห์สถิติตามกลุ่มอายุและพื้นที่)
-- --------------------------------------------------------------------

-- 2.1 จำแนกตามช่วงอายุ (Age Range)
SELECT 
    COALESCE(age_range, 'Unspecified') AS age_range,
    role,
    COUNT(*) AS total_users,
    ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER() * 100, 2) AS percentage
FROM public.sessions
GROUP BY age_range, role
ORDER BY age_range, role;

-- 2.2 จำแนกตามพื้นที่ (District & Sub-district)
SELECT 
    COALESCE(selected_district, 'ไม่ระบุ') AS district,
    COALESCE(selected_sub_district, 'ไม่ระบุ') AS sub_district,
    COUNT(*) AS total_users,
    COUNT(DISTINCT CASE WHEN location_consent = true THEN id END) AS consent_given_count
FROM public.sessions
GROUP BY selected_district, selected_sub_district
ORDER BY total_users DESC;


-- --------------------------------------------------------------------
-- 3. PRE-TEST VS POST-TEST EVALUATION (วิเคราะห์เปรียบเทียบผลสัมฤทธิ์)
-- --------------------------------------------------------------------

-- 3.1 สถิติรวมของคะแนน Pre-test และ Post-test
SELECT 
    test_type,
    COUNT(*) AS total_attempts,
    ROUND(AVG(score)::NUMERIC, 2) AS avg_score,
    MIN(score) AS min_score,
    MAX(score) AS max_score,
    ROUND(STDDEV(score)::NUMERIC, 2) AS std_dev
FROM public.quiz_attempts
GROUP BY test_type;

-- 3.2 การเปรียบเทียบคะแนนรายบุคคล (Paired Sample Analysis: Pre vs Post)
WITH paired_scores AS (
    SELECT 
        s.id AS session_id,
        s.age_range,
        s.role,
        s.selected_district,
        pre.score AS pre_score,
        post.score AS post_score,
        (post.score - pre.score) AS score_difference
    FROM public.quiz_attempts pre
    JOIN public.quiz_attempts post ON pre.session_id = post.session_id
    JOIN public.sessions s ON pre.session_id = s.id
    WHERE pre.test_type = 'pretest' 
      AND post.test_type = 'posttest'
)
SELECT 
    COUNT(*) AS paired_user_count,
    ROUND(AVG(pre_score)::NUMERIC, 2) AS avg_pre_score,
    ROUND(AVG(post_score)::NUMERIC, 2) AS avg_post_score,
    ROUND(AVG(score_difference)::NUMERIC, 2) AS avg_improvement,
    COUNT(CASE WHEN score_difference > 0 THEN 1 END) AS improved_count,
    COUNT(CASE WHEN score_difference = 0 THEN 1 END) AS unchanged_count,
    COUNT(CASE WHEN score_difference < 0 THEN 1 END) AS declined_count,
    ROUND(
        COUNT(CASE WHEN score_difference > 0 THEN 1 END)::NUMERIC / COUNT(*) * 100, 2
    ) AS improvement_rate_percent
FROM paired_scores;

-- 3.3 สรุปพัฒนาการแบ่งตามช่วงอายุ (Improvement by Age Range)
WITH paired_scores AS (
    SELECT 
        s.age_range,
        pre.score AS pre_score,
        post.score AS post_score,
        (post.score - pre.score) AS score_difference
    FROM public.quiz_attempts pre
    JOIN public.quiz_attempts post ON pre.session_id = post.session_id
    JOIN public.sessions s ON pre.session_id = s.id
    WHERE pre.test_type = 'pretest' AND post.test_type = 'posttest'
)
SELECT 
    COALESCE(age_range, 'Unspecified') AS age_range,
    COUNT(*) AS user_count,
    ROUND(AVG(pre_score)::NUMERIC, 2) AS avg_pre_score,
    ROUND(AVG(post_score)::NUMERIC, 2) AS avg_post_score,
    ROUND(AVG(score_difference)::NUMERIC, 2) AS avg_score_diff
FROM paired_scores
GROUP BY age_range
ORDER BY age_range;


-- --------------------------------------------------------------------
-- 4. LESSON & MINIGAME PROGRESSION (ความก้าวหน้าในแต่ละบทเรียน)
-- --------------------------------------------------------------------
SELECT 
    lp.lesson_id,
    COUNT(DISTINCT lp.session_id) AS total_learners,
    COUNT(DISTINCT lp.video_completed_at) AS video_completed_count,
    COUNT(DISTINCT lp.game_completed_at) AS game_completed_count,
    COUNT(DISTINCT CASE WHEN lp.video_completed_at IS NOT NULL AND lp.game_completed_at IS NOT NULL THEN lp.session_id END) AS fully_completed_count,
    ROUND(
        COUNT(DISTINCT CASE WHEN lp.video_completed_at IS NOT NULL AND lp.game_completed_at IS NOT NULL THEN lp.session_id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT lp.session_id), 0) * 100, 2
    ) AS lesson_completion_rate_percent
FROM public.lesson_progress lp
GROUP BY lp.lesson_id
ORDER BY lp.lesson_id;


-- --------------------------------------------------------------------
-- 5. ITEM DIFFICULTY & QUESTION ACCURACY ANALYSIS (วิเคราะห์ข้อสอบรายข้อ)
-- --------------------------------------------------------------------

-- 5.1 ความถูกต้องของข้อสอบรายข้อ (Pre-test vs Post-test Accuracy Rate per Question)
WITH question_stats AS (
    SELECT 
        q.id AS question_id,
        q.test_type,
        q.question_text,
        COUNT(qa.id) AS total_answers,
        COUNT(CASE WHEN qa.is_correct = true THEN 1 END) AS correct_answers,
        ROUND(
            COUNT(CASE WHEN qa.is_correct = true THEN 1 END)::NUMERIC / NULLIF(COUNT(qa.id), 0) * 100, 2
        ) AS accuracy_percent
    FROM public.quiz_questions q
    LEFT JOIN public.quiz_answers qa ON q.id = qa.question_id
    GROUP BY q.id, q.test_type, q.question_text
)
SELECT 
    question_id,
    test_type,
    question_text,
    total_answers,
    correct_answers,
    accuracy_percent,
    CASE 
        WHEN accuracy_percent >= 80 THEN 'ง่ายมาก (Very Easy)'
        WHEN accuracy_percent >= 60 THEN 'ปานกลาง (Moderate)'
        WHEN accuracy_percent >= 40 THEN 'ค่อนข้างยาก (Hard)'
        ELSE 'ยากมาก (Very Hard)'
    END AS difficulty_level
FROM question_stats
ORDER BY test_type, question_id;

-- 5.2 วิเคราะห์ตัวเลือกที่ถูกตอบบ่อยที่สุดในแต่ละข้อ (Distractor Analysis)
SELECT 
    q.id AS question_id,
    q.test_type,
    q.question_text,
    qo.id AS option_id,
    qo.option_text,
    qo.is_correct,
    COUNT(qa.id) AS select_count,
    ROUND(
        COUNT(qa.id)::NUMERIC / NULLIF(SUM(COUNT(qa.id)) OVER(PARTITION BY q.id), 0) * 100, 2
    ) AS selection_percent
FROM public.quiz_questions q
JOIN public.quiz_options qo ON q.id = qo.question_id
LEFT JOIN public.quiz_answers qa ON qo.id = qa.selected_option_id
GROUP BY q.id, q.test_type, q.question_text, qo.id, qo.option_text, qo.is_correct
ORDER BY q.test_type, q.id, select_count DESC;


-- --------------------------------------------------------------------
-- 6. USER BEHAVIOR & ACTION LOGS ANALYTICS (พฤติกรรมและการมีส่วนร่วม)
-- --------------------------------------------------------------------

-- 6.1 เวลาเฉลี่ยที่ใช้งานในแต่ละหน้า (Page Duration Analytics)
SELECT 
    page_path,
    COUNT(*) AS total_views,
    COUNT(DISTINCT session_id) AS unique_visitors,
    ROUND(AVG(duration_seconds)::NUMERIC, 1) AS avg_duration_sec,
    MAX(duration_seconds) AS max_duration_sec
FROM public.page_views
GROUP BY page_path
ORDER BY total_views DESC;

-- 6.2 สรุปเหตุการณ์สำคัญจาก Action Logs (Top User Events)
SELECT 
    event_name,
    COUNT(*) AS total_occurrences,
    COUNT(DISTINCT session_id) AS unique_users_triggered
FROM public.action_logs
GROUP BY event_name
ORDER BY total_occurrences DESC;
