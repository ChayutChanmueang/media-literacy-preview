const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TARGET_DIR = path.resolve('docs/analytics/sep19');

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function writeCsv(filename, headers, rows) {
  const filePath = path.join(TARGET_DIR, filename);
  // Add UTF-8 BOM (\uFEFF) for Excel compatibility with Thai text
  const headerLine = headers.join(',');
  const rowLines = rows.map(r => headers.map(h => escapeCsv(r[h])).join(','));
  const content = '\uFEFF' + headerLine + '\n' + rowLines.join('\n') + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Saved ${filename} (${rows.length} rows)`);
}

async function exportDomainCsvs() {
  try {
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    console.log('🚀 Exporting CSV files separated by analytical domain...\n');

    // =========================================================================
    // DOMAIN 1: UNIQUE USERS MASTER TABLE (ข้อมูลผู้ใช้งานรายบุคคลระดับ Master)
    // =========================================================================
    const masterQuery = `
      WITH first_consent AS (
        SELECT session_id, payload, created_at,
               ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at ASC) as rn
        FROM public.action_logs
        WHERE event_name = 'consent_submitted'
      ),
      actions_agg AS (
        SELECT 
          session_id,
          count(*) as total_actions,
          min(created_at AT TIME ZONE 'Asia/Bangkok') as first_seen,
          max(created_at AT TIME ZONE 'Asia/Bangkok') as last_seen
        FROM public.action_logs
        GROUP BY session_id
      ),
      lessons_agg AS (
        SELECT 
          session_id,
          bool_or(lesson_id = 'topic-1' AND video_completed_at IS NOT NULL) as t1_video,
          bool_or(lesson_id = 'topic-1' AND game_completed_at IS NOT NULL) as t1_game,
          bool_or(lesson_id = 'topic-1' AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL) as t1_both,
          bool_or(lesson_id = 'topic-3' AND video_completed_at IS NOT NULL) as t3_video,
          bool_or(lesson_id = 'topic-3' AND game_completed_at IS NOT NULL) as t3_game,
          bool_or(lesson_id = 'topic-3' AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL) as t3_both,
          bool_or(lesson_id = 'topic-6' AND video_completed_at IS NOT NULL) as t6_video,
          bool_or(lesson_id = 'topic-6' AND game_completed_at IS NOT NULL) as t6_game,
          bool_or(lesson_id = 'topic-6' AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL) as t6_both,
          count(distinct lesson_id) FILTER (WHERE video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL AND lesson_id IN ('topic-1','topic-3','topic-6')) as core_lessons_done
        FROM public.lesson_progress
        GROUP BY session_id
      ),
      end_events AS (
        SELECT 
          session_id,
          bool_or(event_name = 'course_completion_view') as saw_completion_screen,
          bool_or(event_name = 'course_completion_back_home') as clicked_back_home
        FROM public.action_logs
        GROUP BY session_id
      )
      SELECT 
        s.id as user_session_id,
        TO_CHAR(s.created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') as registered_at,
        TO_CHAR(act.first_seen, 'YYYY-MM-DD HH24:MI:SS') as first_active_at,
        TO_CHAR(act.last_seen, 'YYYY-MM-DD HH24:MI:SS') as last_active_at,
        COALESCE(act.total_actions, 0) as total_actions,
        CASE 
          WHEN COALESCE(act.total_actions, 0) <= 5 THEN 'Bounce (1-5)'
          WHEN COALESCE(act.total_actions, 0) <= 30 THEN 'Low (6-30)'
          WHEN COALESCE(act.total_actions, 0) <= 100 THEN 'Medium (31-100)'
          WHEN COALESCE(act.total_actions, 0) <= 300 THEN 'High (101-300)'
          ELSE 'Power User (>300)'
        END as engagement_tier,
        CASE WHEN c.session_id IS NOT NULL THEN 'Yes' ELSE 'No' END as is_consent_submitted,
        COALESCE(c.payload->>'age_range', s.age_range, 'Unknown') as age_range,
        COALESCE(c.payload->>'province', 
                 CASE 
                   WHEN s.selected_district IN ('สันทราย','เมืองเชียงใหม่','หางดง','สันกำแพง','ฝาง','สารภี','ดอยเต่า','ดอยสะเก็ด','เชียงดาว','แม่อาย','สะเมิง','สันป่าตอง','อมก๋อย','แม่ริม','แม่แตง','แม่ออน','ฮอด') THEN 'เชียงใหม่'
                   WHEN s.selected_district IN ('เมืองแพร่','หนองม่วงไข่','ลอง','สูงเม่น','ร้องกวาง','สอง','วังชิ้น','เด่นชัย') THEN 'แพร่'
                   WHEN s.selected_district IN ('นาน้อย','ท่าวังผา','เวียงสา','เชียงกลาง','เมืองน่าน','สันติสุข','ภูเพียง','บ่อเกลือ','สองแคว','ปัว') THEN 'น่าน'
                   WHEN s.selected_district IS NOT NULL THEN 'อื่น ๆ'
                   ELSE 'ไม่ระบุ' 
                 END) as province,
        COALESCE(c.payload->>'district', s.selected_district, 'ไม่ระบุ') as district,
        COALESCE(c.payload->>'sub_district', s.selected_sub_district, 'ไม่ระบุ') as sub_district,
        COALESCE(s.device_metadata->>'os_name', 'Unknown') as os_name,
        COALESCE(s.device_metadata->>'browser_name', 'Unknown') as browser_name,
        COALESCE(s.device_metadata->>'screen_resolution', 'Unknown') as screen_resolution,
        COALESCE(l.t1_both, false) as topic1_factcheck_completed,
        COALESCE(l.t3_both, false) as topic3_ai_completed,
        COALESCE(l.t6_both, false) as topic6_line_completed,
        COALESCE(l.core_lessons_done, 0) as core_topics_completed_count,
        CASE WHEN COALESCE(l.core_lessons_done, 0) = 3 THEN true ELSE false END as is_completed_all_3_topics,
        COALESCE(e.saw_completion_screen, false) as course_completion_viewed,
        COALESCE(e.clicked_back_home, false) as course_completion_back_home
      FROM public.sessions s
      LEFT JOIN (SELECT session_id, payload FROM first_consent WHERE rn = 1) c ON s.id = c.session_id
      LEFT JOIN actions_agg act ON s.id = act.session_id
      LEFT JOIN lessons_agg l ON s.id = l.session_id
      LEFT JOIN end_events e ON s.id = e.session_id
      ORDER BY s.created_at ASC
    `;
    const masterRes = await pool.query(masterQuery);
    const masterHeaders = [
      'user_session_id', 'registered_at', 'first_active_at', 'last_active_at', 'total_actions', 'engagement_tier',
      'is_consent_submitted', 'age_range', 'province', 'district', 'sub_district',
      'os_name', 'browser_name', 'screen_resolution',
      'topic1_factcheck_completed', 'topic3_ai_completed', 'topic6_line_completed',
      'core_topics_completed_count', 'is_completed_all_3_topics',
      'course_completion_viewed', 'course_completion_back_home'
    ];
    writeCsv('domain1_unique_users_master.csv', masterHeaders, masterRes.rows);

    // =========================================================================
    // DOMAIN 1.1: DEMOGRAPHICS BY AGE & LOCATION SUMMARY (สรุปประชากรศาสตร์)
    // =========================================================================
    const demoQuery = `
      WITH consent_users AS (
        SELECT 
          session_id,
          payload->>'age_range' as age_range,
          payload->>'province' as province,
          payload->>'district' as district,
          payload->>'sub_district' as sub_district
        FROM (
          SELECT session_id, payload,
                 ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at ASC) as rn
          FROM public.action_logs
          WHERE event_name = 'consent_submitted'
        ) sub WHERE rn = 1
      )
      SELECT 
        COALESCE(province, 'ไม่ระบุ') as province,
        COALESCE(district, 'ไม่ระบุ') as district,
        COALESCE(sub_district, 'ไม่ระบุ') as sub_district,
        COALESCE(age_range, 'ไม่ระบุ') as age_range,
        count(distinct session_id) as unique_users,
        ROUND(count(distinct session_id)::numeric / 291 * 100, 2) as pct_of_identified_users
      FROM consent_users
      GROUP BY province, district, sub_district, age_range
      ORDER BY province, district, sub_district, age_range
    `;
    const demoRes = await pool.query(demoQuery);
    writeCsv('domain1_demographics_summary.csv', 
      ['province', 'district', 'sub_district', 'age_range', 'unique_users', 'pct_of_identified_users'], 
      demoRes.rows);

    // =========================================================================
    // DOMAIN 2: DAILY USAGE TIMELINE (ปริมาณการใช้งานรายวัน)
    // =========================================================================
    const dailyQuery = `
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD') as date_th,
        count(distinct session_id) as active_unique_users,
        count(*) as total_actions,
        ROUND(count(*)::numeric / NULLIF(count(distinct session_id), 0), 2) as avg_actions_per_user
      FROM public.action_logs
      GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD')
      ORDER BY date_th ASC
    `;
    const dailyRes = await pool.query(dailyQuery);
    writeCsv('domain2_daily_usage_timeline.csv', 
      ['date_th', 'active_unique_users', 'total_actions', 'avg_actions_per_user'], 
      dailyRes.rows);

    // =========================================================================
    // DOMAIN 2.1: MONTHLY USAGE TIMELINE (ปริมาณการใช้งานรายเดือน)
    // =========================================================================
    const monthlyQuery = `
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM') as month_th,
        count(distinct session_id) as active_unique_users,
        count(*) as total_actions,
        ROUND(count(*)::numeric / NULLIF(count(distinct session_id), 0), 2) as avg_actions_per_user
      FROM public.action_logs
      GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM')
      ORDER BY month_th ASC
    `;
    const monthlyRes = await pool.query(monthlyQuery);
    writeCsv('domain2_monthly_usage_timeline.csv', 
      ['month_th', 'active_unique_users', 'total_actions', 'avg_actions_per_user'], 
      monthlyRes.rows);

    // =========================================================================
    // DOMAIN 2.2: ACTION LOG EVENTS BREAKDOWN (จำแนกตามประเภทกิจกรรม)
    // =========================================================================
    const eventsQuery = `
      SELECT 
        event_name,
        count(*) as total_occurrences,
        count(distinct session_id) as unique_users_triggered,
        ROUND(count(distinct session_id)::numeric / 548 * 100, 2) as pct_of_all_users,
        CASE 
          WHEN event_name IN ('scoop_catch','bomb_dodge','double_catch','scoop_miss','bomb_hit','double_miss','game_start','game_complete','game_finish','game_intro_start','g13_dev_skip_timer') THEN 'Minigame: G1/G13 IceCream'
          WHEN event_name IN ('answer_question','enter_question') THEN 'Minigame: G1/G3 Questions'
          WHEN event_name IN ('enter_scenario','select_response','check_scenario') THEN 'Minigame: G6 LINE Chat'
          WHEN event_name IN ('play_video','enter_video','video_complete','video_auto_advance','video_slow_load_shown','video_slow_load_resolved','video_skip_slow_load','unmute_video','replay_video','video_skip_stutter','toggle_audio','video_complete_skipped','skip_video') THEN 'Video Engagement'
          WHEN event_name IN ('landing_page_view','consent_page_view','consent_submitted','lessons_dashboard_view','select_lesson','course_completion_view','course_completion_back_home','reset_application_state','nav_home_from_drawer','resume_flow','click_locked_lesson') THEN 'Navigation & Course Flow'
          WHEN event_name IN ('leaderboard_page_view','leaderboard_browse_open','leaderboard_score_saved','leaderboard_name_saved','leaderboard_name_skipped','nav_leaderboard_from_drawer') THEN 'Leaderboard'
          WHEN event_name IN ('gps_location_requested','gps_location_success','gps_location_failed') THEN 'Location / GPS'
          WHEN event_name IN ('pretest_completed_screen_transition','posttest_completed_screen_transition','start_quiz','submit_quiz_answer') THEN 'Quiz / Assessment'
          WHEN event_name IN ('certificate_page_view','generate_certificate','certificate_back_to_dashboard') THEN 'Certificate'
          ELSE 'Other'
        END as functional_domain
      FROM public.action_logs
      GROUP BY event_name
      ORDER BY count(*) DESC
    `;
    const eventsRes = await pool.query(eventsQuery);
    writeCsv('domain2_action_events_summary.csv', 
      ['event_name', 'functional_domain', 'total_occurrences', 'unique_users_triggered', 'pct_of_all_users'], 
      eventsRes.rows);

    // =========================================================================
    // DOMAIN 3: COMPLETION FUNNEL BREAKDOWN (ขั้นตอนและการผ่านหลักสูตร)
    // =========================================================================
    const funnelSteps = [
      { step: 1, step_code: 'landing', step_name: 'เข้าสู่หน้าแรก (Landing Page)', event: 'landing_page_view' },
      { step: 2, step_code: 'consent_view', step_name: 'เข้าสู่หน้ายินยอม (Consent Page View)', event: 'consent_page_view' },
      { step: 3, step_code: 'consent_submitted', step_name: 'ยืนยันความยินยอมและระบุข้อมูล (Consent Submitted)', event: 'consent_submitted' },
      { step: 4, step_code: 'dashboard_view', step_name: 'เข้าสู่หน้าเลือกบทเรียน (Lessons Dashboard View)', event: 'lessons_dashboard_view' },
      { step: 5, step_code: 'started_content', step_name: 'เริ่มทำกิจกรรมใดๆ (Started Content)', custom: "event_name IN ('game_start', 'play_video', 'enter_video')" },
      { step: 6, step_code: 'topic1_completed', step_name: 'จบหมวด 1: ข่าวจริง/มั่ว (วิดีโอ + เกม)', table: "lesson_progress WHERE lesson_id = 'topic-1' AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL" },
      { step: 7, step_code: 'topic6_completed', step_name: 'จบหมวด 6: แชท LINE (วิดีโอ + เกม)', table: "lesson_progress WHERE lesson_id = 'topic-6' AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL" },
      { step: 8, step_code: 'topic3_completed', step_name: 'จบหมวด 3: AI หรือคนจริง (วิดีโอ + เกม)', table: "lesson_progress WHERE lesson_id = 'topic-3' AND video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL" },
      { step: 9, step_code: 'all_3_completed', step_name: 'จบครบทั้ง 3 หมวดหมู่หลัก (Completed All 3 Core Topics)', table: "lesson_progress WHERE video_completed_at IS NOT NULL AND game_completed_at IS NOT NULL AND lesson_id IN ('topic-1','topic-3','topic-6') GROUP BY session_id HAVING count(distinct lesson_id) = 3" },
      { step: 10, step_code: 'completion_screen', step_name: 'เข้าถึงหน้าจบหลักสูตร (Course Completion View)', event: 'course_completion_view' },
      { step: 11, step_code: 'back_home', step_name: 'กดกลับสู่หน้าหลักหลังจบหลักสูตร (Course Completion Back Home)', event: 'course_completion_back_home' }
    ];

    const funnelData = [];
    const landingCount = 453;
    const consentCount = 291;

    for (const f of funnelSteps) {
      let count = 0;
      if (f.event) {
        const r = await pool.query(`SELECT count(distinct session_id) FROM public.action_logs WHERE event_name = $1`, [f.event]);
        count = Number(r.rows[0].count);
      } else if (f.custom) {
        const r = await pool.query(`SELECT count(distinct session_id) FROM public.action_logs WHERE ${f.custom}`);
        count = Number(r.rows[0].count);
      } else if (f.table) {
        if (f.table.includes('GROUP BY')) {
          const r = await pool.query(`SELECT count(*) FROM (SELECT session_id FROM public.${f.table}) sub`);
          count = Number(r.rows[0].count);
        } else {
          const r = await pool.query(`SELECT count(distinct session_id) FROM public.${f.table}`);
          count = Number(r.rows[0].count);
        }
      }

      funnelData.push({
        step_order: f.step,
        step_code: f.step_code,
        step_name: f.step_name,
        unique_users: count,
        pct_of_landing_page: ((count / landingCount) * 100).toFixed(2),
        pct_of_identified_users: ((count / consentCount) * 100).toFixed(2)
      });
    }

    writeCsv('domain3_completion_funnel.csv', 
      ['step_order', 'step_code', 'step_name', 'unique_users', 'pct_of_landing_page', 'pct_of_identified_users'], 
      funnelData);

    // =========================================================================
    // DOMAIN 3.1: DETAILED LESSON PROGRESSION (ความคืบหน้าของบทเรียนรายคน)
    // =========================================================================
    const progressQuery = `
      SELECT 
        lp.session_id as user_session_id,
        lp.lesson_id,
        CASE 
          WHEN lp.lesson_id = 'topic-1' THEN 'หมวด 1: ข่าวจริงหรือข่าวปลอม (G1/G13)'
          WHEN lp.lesson_id = 'topic-2' THEN 'หมวด 2: ภัยการเงินและหลอกลวง'
          WHEN lp.lesson_id = 'topic-3' THEN 'หมวด 3: AI และภัยไซเบอร์ (G3)'
          WHEN lp.lesson_id = 'topic-5' THEN 'หมวด 5: ความเป็นส่วนตัว'
          WHEN lp.lesson_id = 'topic-6' THEN 'หมวด 6: มิจฉาชีพทางแชท LINE (G6)'
          ELSE lp.lesson_id
        END as lesson_name,
        TO_CHAR(lp.video_completed_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') as video_completed_at,
        TO_CHAR(lp.game_completed_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') as game_completed_at,
        CASE WHEN lp.video_completed_at IS NOT NULL AND lp.game_completed_at IS NOT NULL THEN true ELSE false END as is_fully_completed
      FROM public.lesson_progress lp
      ORDER BY lp.session_id, lp.lesson_id
    `;
    const progressRes = await pool.query(progressQuery);
    writeCsv('domain3_user_lesson_progress.csv', 
      ['user_session_id', 'lesson_id', 'lesson_name', 'video_completed_at', 'game_completed_at', 'is_fully_completed'], 
      progressRes.rows);

    // =========================================================================
    // DOMAIN 4: LEADERBOARD & GAME SCORES (คะแนนมินิเกมรายผู้เล่น)
    // =========================================================================
    const scoresQuery = `
      SELECT 
        p.id as entry_id,
        p.player_uuid,
        p.attempt_uuid,
        p.name as player_nickname,
        p.gid as game_id,
        g.name as game_name,
        p.score,
        TO_CHAR(p.created_at AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD HH24:MI:SS') as played_at
      FROM public.player_info p
      LEFT JOIN public.game_id g ON p.gid = g.gid
      ORDER BY p.score DESC, p.created_at ASC
    `;
    const scoresRes = await pool.query(scoresQuery);
    writeCsv('domain4_leaderboard_player_scores.csv', 
      ['entry_id', 'player_uuid', 'attempt_uuid', 'player_nickname', 'game_id', 'game_name', 'score', 'played_at'], 
      scoresRes.rows);

    console.log('\n🎉 All domain CSV files exported successfully to:', TARGET_DIR);

  } catch (err) {
    console.error('❌ Error exporting domain CSVs:', err);
  } finally {
    await pool.end();
  }
}

exportDomainCsvs();
