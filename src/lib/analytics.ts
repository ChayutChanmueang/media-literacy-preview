import { getDatabasePool } from "@/lib/database";

export interface ActionLogAnalyticsFilters {
  from?: string; // ISO date string, inclusive lower bound on created_at
  to?: string; // ISO date string, inclusive upper bound on created_at
  eventName?: string;
  sessionId?: string;
}

export interface ActionLogAnalytics {
  totalEvents: number;
  byEventName: { event_name: string; count: number }[];
  byPageUrl: { page_url: string | null; count: number }[];
  byDay: { day: string; count: number }[];
}

export async function getActionLogAnalytics(
  filters: ActionLogAnalyticsFilters = {}
): Promise<ActionLogAnalytics> {
  const { from, to, eventName, sessionId } = filters;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (from) {
    params.push(from);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`created_at <= $${params.length}`);
  }
  if (eventName) {
    params.push(eventName);
    conditions.push(`event_name = $${params.length}`);
  }
  if (sessionId) {
    params.push(sessionId);
    conditions.push(`session_id = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const pool = getDatabasePool();

  const [totalResult, byEventNameResult, byPageUrlResult, byDayResult] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM action_logs ${whereClause};`, params),
    pool.query(
      `SELECT event_name, COUNT(*)::int AS count
       FROM action_logs ${whereClause}
       GROUP BY event_name
       ORDER BY count DESC;`,
      params
    ),
    pool.query(
      `SELECT page_url, COUNT(*)::int AS count
       FROM action_logs ${whereClause}
       GROUP BY page_url
       ORDER BY count DESC;`,
      params
    ),
    pool.query(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
       FROM action_logs ${whereClause}
       GROUP BY 1
       ORDER BY 1 ASC;`,
      params
    ),
  ]);

  return {
    totalEvents: totalResult.rows[0]?.count ?? 0,
    byEventName: byEventNameResult.rows,
    byPageUrl: byPageUrlResult.rows,
    byDay: byDayResult.rows,
  };
}
