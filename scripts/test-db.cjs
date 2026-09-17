require('dotenv').config();
const pg = require('pg');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT COUNT(*) FROM public.quiz_questions')
  .then(r => {
    console.log('✅ Connection OK - quiz_questions rows:', r.rows[0].count);
    pool.end();
  })
  .catch(e => {
    console.error('❌ Connection FAIL:', e.message);
    pool.end();
  });
