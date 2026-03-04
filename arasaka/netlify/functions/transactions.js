const { neon } = require('@netlify/neon');

const USER_ID = 'default';
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  const sql = neon();

  try {
    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT * FROM transactions WHERE user_id = ${USER_ID} ORDER BY created_at DESC`;
      return { statusCode: 200, headers, body: JSON.stringify(rows) };
    }
    if (event.httpMethod === 'POST') {
      const { id, description, amount, type, category, date } = JSON.parse(event.body);
      await sql`INSERT INTO transactions (id, user_id, description, amount, type, category, date)
        VALUES (${id}, ${USER_ID}, ${description}, ${amount}, ${type}, ${category}, ${date})
        ON CONFLICT (id) DO NOTHING`;
      return { statusCode: 201, headers, body: JSON.stringify({ ok: true }) };
    }
    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      await sql`DELETE FROM transactions WHERE id = ${id} AND user_id = ${USER_ID}`;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
