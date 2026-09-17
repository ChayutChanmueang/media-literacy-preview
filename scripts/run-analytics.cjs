require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function runAnalytics() {
  console.log('📊 Running Master Analytics Queries...\n');

  const sqlFilePath = path.join(__dirname, 'analytics-queries.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  // Separate sql queries by semicolon, ignoring comments
  const queries = [
    { title: '1. OVERVIEW DASHBOARD', query: `
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
    `},
    { title: '2.1 DEMOGRAPHICS BY AGE RANGE', query: `
      SELECT 
          COALESCE(age_range, 'Unspecified') AS age_range,
          role,
          COUNT(*) AS total_users,
          ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER() * 100, 2) AS percentage
      FROM public.sessions
      GROUP BY age_range, role
      ORDER BY age_range, role;
    `},
    { title: '3.1 PRE/POST-TEST OVERVIEW', query: `
      SELECT 
          test_type,
          COUNT(*) AS total_attempts,
          ROUND(AVG(score)::NUMERIC, 2) AS avg_score,
          MIN(score) AS min_score,
          MAX(score) AS max_score,
          ROUND(STDDEV(score)::NUMERIC, 2) AS std_dev
      FROM public.quiz_attempts
      GROUP BY test_type;
    `},
    { title: '3.2 PAIRED PRE/POST COMPARISON', query: `
      WITH paired_scores AS (
          SELECT 
              s.id AS session_id,
              pre.score AS pre_score,
              post.score AS post_score,
              (post.score - pre.score) AS score_difference
          FROM public.quiz_attempts pre
          JOIN public.quiz_attempts post ON pre.session_id = post.session_id
          JOIN public.sessions s ON pre.session_id = s.id
          WHERE pre.test_type = 'pretest' AND post.test_type = 'posttest'
      )
      SELECT 
          COUNT(*) AS paired_user_count,
          ROUND(AVG(pre_score)::NUMERIC, 2) AS avg_pre_score,
          ROUND(AVG(post_score)::NUMERIC, 2) AS avg_post_score,
          ROUND(AVG(score_difference)::NUMERIC, 2) AS avg_improvement,
          COUNT(CASE WHEN score_difference > 0 THEN 1 END) AS improved_count,
          COUNT(CASE WHEN score_difference = 0 THEN 1 END) AS unchanged_count,
          COUNT(CASE WHEN score_difference < 0 THEN 1 END) AS declined_count
      FROM paired_scores;
    `},
    { title: '4. LESSON & MINIGAME PROGRESSION', query: `
      SELECT 
          lp.lesson_id,
          COUNT(DISTINCT lp.session_id) AS total_learners,
          COUNT(DISTINCT lp.video_completed_at) AS video_completed_count,
          COUNT(DISTINCT lp.game_completed_at) AS game_completed_count,
          COUNT(DISTINCT CASE WHEN lp.video_completed_at IS NOT NULL AND lp.game_completed_at IS NOT NULL THEN lp.session_id END) AS fully_completed_count
      FROM public.lesson_progress lp
      GROUP BY lp.lesson_id
      ORDER BY lp.lesson_id;
    `},
    { title: '5.1 QUESTION ACCURACY & DIFFICULTY', query: `
      WITH question_stats AS (
          SELECT 
              q.id AS question_id,
              q.test_type,
              COUNT(qa.id) AS total_answers,
              COUNT(CASE WHEN qa.is_correct = true THEN 1 END) AS correct_answers,
              ROUND(
                  COUNT(CASE WHEN qa.is_correct = true THEN 1 END)::NUMERIC / NULLIF(COUNT(qa.id), 0) * 100, 2
              ) AS accuracy_percent
          FROM public.quiz_questions q
          LEFT JOIN public.quiz_answers qa ON q.id = qa.question_id
          GROUP BY q.id, q.test_type
      )
      SELECT 
          question_id,
          test_type,
          total_answers,
          correct_answers,
          accuracy_percent
      FROM question_stats
      ORDER BY test_type, question_id;
    `}
  ];

  for (const q of queries) {
    try {
      const res = await pool.query(q.query);
      console.log(`========================================`);
      console.log(`📌 ${q.title}`);
      console.log(`========================================`);
      console.table(res.rows);
      console.log('\n');
    } catch (err) {
      console.error(`❌ Error executing ${q.title}:`, err.message);
    }
  }

  await pool.end();
  console.log('✅ Analytics Execution Finished.');
}

runAnalytics().catch(e => {
  console.error(e);
  pool.end();
});
