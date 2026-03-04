const { neon } = require('@netlify/neon');

const USER_ID = 'default';
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  const sql = neon();

  try {
    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT * FROM user_settings WHERE user_id = ${USER_ID}`;
      return { statusCode: 200, headers, body: JSON.stringify(rows[0] || {}) };
    }
    if (event.httpMethod === 'POST') {
      const { currency, budgets } = JSON.parse(event.body);
      await sql`INSERT INTO user_settings (user_id, currency, budgets, updated_at)
        VALUES (${USER_ID}, ${currency}, ${JSON.stringify(budgets)}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET currency=EXCLUDED.currency, budgets=EXCLUDED.budgets, updated_at=NOW()`;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
