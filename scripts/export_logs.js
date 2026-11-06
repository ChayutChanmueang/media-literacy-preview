import pg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL is not defined in environment variables.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function escapeCsvField(field) {
  if (field === null || field === undefined) return '';
  const stringified = typeof field === 'object' ? JSON.stringify(field) : String(field);
  if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n') || stringified.includes('\r')) {
    return '"' + stringified.replace(/"/g, '""') + '"';
  }
  return stringified;
}

async function exportLogs() {
  const targetDirName = process.argv[2] || 'aug18';
  const targetDir = path.resolve(`docs/analytics/${targetDirName}`);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Fetching action_logs from Supabase for target folder: ${targetDirName}...`);
  const query = 'SELECT id, session_id, event_name, page_url, payload, created_at FROM action_logs ORDER BY created_at ASC;';
  const res = await pool.query(query);
  console.log(`Fetched ${res.rows.length} rows.`);

  const header = 'id,session_id,event_name,page_url,payload,created_at\n';
  const lines = res.rows.map(row => {
    return [
      escapeCsvField(row.id),
      escapeCsvField(row.session_id),
      escapeCsvField(row.event_name),
      escapeCsvField(row.page_url),
      escapeCsvField(row.payload),
      escapeCsvField(row.created_at ? row.created_at.toISOString() : '')
    ].join(',');
  });

  const content = header + lines.join('\n');
  const targetPath = path.join(targetDir, 'action_logs.csv');
  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log(`Successfully wrote ${lines.length} lines to ${targetPath}`);
  await pool.end();
}

exportLogs().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
