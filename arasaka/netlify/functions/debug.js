import { neon } from '@netlify/neon';

export default async function handler(req, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const sql = neon();
    // Test DB connection
    const result = await sql`SELECT NOW() as time, current_database() as db`;
    return new Response(JSON.stringify({
      status: 'OK',
      db_connected: true,
      db_time: result[0].time,
      db_name: result[0].db,
      env_var_present: !!process.env.NETLIFY_DATABASE_URL
    }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({
      status: 'ERROR',
      db_connected: false,
      error: err.message,
      env_var_present: !!process.env.NETLIFY_DATABASE_URL
    }), { status: 500, headers });
  }
}

export const config = { path: '/api/debug' };
