const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function exportFullAnalytics() {
  try {
    const data = {};

    // 1. Overview
    const overviewRes = await pool.query(`
      SELECT 
        count(distinct s.id) as total_unique_sessions,
        count(distinct a.session_id) as active_sessions_in_logs,
        (SELECT count(*) FROM public.action_logs) as total_action_events,
        min(s.created_at) as earliest_session,
        max(s.created_at) as latest_session,
        min(a.created_at) as earliest_action,
        max(a.created_at) as latest_action
      FROM public.sessions s
      FULL OUTER JOIN public.action_logs a ON s.id = a.session_id
    `);
    data.overview = overviewRes.rows[0];

    // 2. Identified vs Anonymous Users
    const consentRes = await pool.query(`
      WITH first_consent AS (
        SELECT session_id, payload, created_at,
               ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at ASC) as rn
        FROM public.action_logs
        WHERE event_name = 'consent_submitted'
      )
      SELECT 
        session_id,
        payload->>'age_range' as age_range,
        payload->>'province' as province,
        payload->>'district' as district,
        payload->>'sub_district' as sub_district,
        created_at
      FROM first_consent
      WHERE rn = 1
    `);
    data.identified_users_count = consentRes.rows.length;
    data.anonymous_sessions_count = Number(data.overview.total_unique_sessions) - consentRes.rows.length;

    // Demographics Aggregations
    const ageMap = {};
    const provMap = {};
    const distMap = {};
    const ageProvMap = {};

    consentRes.rows.forEach(r => {
      const a = r.age_range || 'ไม่ระบุ';
      const p = r.province || 'ไม่ระบุ';
      const d = (r.district || 'ไม่ระบุ') + ' (' + p + ')';
      
      ageMap[a] = (ageMap[a] || 0) + 1;
      provMap[p] = (provMap[p] || 0) + 1;
      distMap[d] = (distMap[d] || 0) + 1;

      if (!ageProvMap[p]) ageProvMap[p] = {};
      ageProvMap[p][a] = (ageProvMap[p][a] || 0) + 1;
    });

    data.demographics = {
      by_age: ageMap,
      by_province: provMap,
      by_district: distMap,
      age_by_province: ageProvMap
    };

    // 3. Usage Timeline & Volume
    const dailyRes = await pool.query(`
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') as date,
        count(distinct session_id) as active_users,
        count(*) as actions
      FROM public.action_logs
      GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD')
      ORDER BY date ASC
    `);
    data.daily_usage = dailyRes.rows;

    const monthlyRes = await pool.query(`
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM') as month,
        count(distinct session_id) as active_users,
        count(*) as actions
      FROM public.action_logs
      GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM')
      ORDER BY month ASC
    `);
    data.monthly_usage = monthlyRes.rows;

    // Session engagement intensity
    const intensityRes = await pool.query(`
      WITH s_counts AS (
        SELECT session_id, count(*) as c,
               min(created_at) as first_seen,
               max(created_at) as last_seen
        FROM public.action_logs
        GROUP BY session_id
      )
      SELECT 
        count(*) as total_users,
        round(avg(c), 2) as avg_actions,
        percentile_cont(0.5) within group (order by c) as median_actions,
        min(c) as min_actions,
        max(c) as max_actions,
        count(case when c <= 5 then 1 end) as tier_bounce_1_to_5,
        count(case when c between 6 and 30 then 1 end) as tier_low_6_to_30,
        count(case when c between 31 and 100 then 1 end) as tier_medium_31_to_100,
        count(case when c between 101 and 300 then 1 end) as tier_high_101_to_300,
        count(case when c > 300 then 1 end) as tier_power_over_300
      FROM s_counts
    `);
    data.engagement_intensity = intensityRes.rows[0];

    // 4. Content & Activity Breakdown
    const topEventsRes = await pool.query(`
      SELECT event_name, count(*) as total_count, count(distinct session_id) as unique_users
      FROM public.action_logs
      GROUP BY event_name
      ORDER BY count(*) DESC
    `);
    data.top_events = topEventsRes.rows;

    // 5. Completion Funnel
    const funnelCounts = await pool.query(`
      SELECT 
        (SELECT count(distinct session_id) FROM public.action_logs WHERE event_name = 'landing_page_view') as landing_page_views,
        (SELECT count(distinct session_id) FROM public.action_logs WHERE event_name = 'consent_page_view') as consent_page_views,
        (SELECT count(distinct session_id) FROM public.action_logs WHERE event_name = 'consent_submitted') as consent_submitted,
        (SELECT count(distinct session_id) FROM public.action_logs WHERE event_name = 'lessons_dashboard_view') as lessons_dashboard_views,
        (SELECT count(distinct session_id) FROM public.action_logs WHERE event_name in ('game_start', 'play_video', 'enter_video')) as started_any_content,
        -- Topic 1
        (SELECT count(distinct session_id) FROM public.lesson_progress WHERE lesson_id = 'topic-1' AND video_completed_at IS NOT NULL) as topic1_video_completed,
        (SELECT count(distinct session_id) FROM public.lesson_progress WHERE lesson_id = 'topic-1' AND game_completed_at IS NOT NULL) as topic1_game_completed,
        (SELECT count(distinct session_id) FROM public.lesson_progress WHERE lesson_id = 'topic-1' AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL) as topic1_both_completed,
        -- Topic 3
        (SELECT count(distinct session_id) FROM public.lesson_progress WHERE lesson_id = 'topic-3' AND video_completed_at IS NOT NULL) as topic3_video_completed,
        (SELECT count(distinct session_id) FROM public.lesson_progress WHERE lesson_id = 'topic-3' AND game_completed_at IS NOT NULL) as topic3_game_completed,
        (SELECT count(distinct session_id) FROM public.lesson_progress WHERE lesson_id = 'topic-3' AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL) as topic3_both_completed,
        -- Topic 6
        (SELECT count(distinct session_id) FROM public.lesson_progress WHERE lesson_id = 'topic-6' AND video_completed_at IS NOT NULL) as topic6_video_completed,
        (SELECT count(distinct session_id) FROM public.lesson_progress WHERE lesson_id = 'topic-6' AND game_completed_at IS NOT NULL) as topic6_game_completed,
        (SELECT count(distinct session_id) FROM public.lesson_progress WHERE lesson_id = 'topic-6' AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL) as topic6_both_completed,
        -- Course Completion End-to-End
        (SELECT count(*) FROM (
           SELECT session_id 
           FROM public.lesson_progress 
           WHERE video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL
             AND lesson_id IN ('topic-1', 'topic-3', 'topic-6')
           GROUP BY session_id
           HAVING count(distinct lesson_id) = 3
         ) sub) as completed_all_3_topics,
        (SELECT count(distinct session_id) FROM public.action_logs WHERE event_name = 'course_completion_view') as course_completion_views,
        (SELECT count(distinct session_id) FROM public.action_logs WHERE event_name = 'course_completion_back_home') as course_completion_back_home
    `);
    data.funnel = funnelCounts.rows[0];

    // Devices & OS
    const deviceRes = await pool.query(`
      WITH parsed AS (
        SELECT 
          s.id,
          COALESCE(s.device_metadata->>'os_name', 'Unknown') as os_name,
          COALESCE(s.device_metadata->>'browser_name', 'Unknown') as browser_name,
          COALESCE(s.device_metadata->>'device_type', 'mobile') as device_type
        FROM public.sessions s
      )
      SELECT os_name, count(*) as user_count
      FROM parsed
      GROUP BY os_name
      ORDER BY user_count DESC
    `);
    data.device_os = deviceRes.rows;

    const outDir = path.resolve('docs/analytics/sep19');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outPath = path.join(outDir, 'unique_users_data.json');
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Successfully written data to:', outPath);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

exportFullAnalytics();
