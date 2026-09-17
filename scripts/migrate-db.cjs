require('dotenv').config();
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

console.log('Running ALTER TABLE public.sessions migration...');
pool.query("ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS device_metadata JSONB DEFAULT '{}'::jsonb")
  .then(() => {
    console.log('✅ Migration succeeded: device_metadata column added to public.sessions table!');
    pool.end();
  })
  .catch(e => {
    console.error('❌ Migration failed:', e.message);
    pool.end();
  });
