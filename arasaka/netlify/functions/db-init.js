const { neon } = require('@netlify/neon');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  try {
    const sql = neon();
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id BIGINT PRIMARY KEY, user_id TEXT NOT NULL DEFAULT 'default',
      description TEXT NOT NULL, amount NUMERIC(15,2) NOT NULL,
      type TEXT NOT NULL, category TEXT NOT NULL, date TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS savings (
      id BIGINT PRIMARY KEY, user_id TEXT NOT NULL DEFAULT 'default',
      name TEXT NOT NULL, balance NUMERIC(15,2) NOT NULL,
      rate NUMERIC(6,4) DEFAULT 0, type TEXT NOT NULL, date TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS investments (
      id BIGINT PRIMARY KEY, user_id TEXT NOT NULL DEFAULT 'default',
      name TEXT NOT NULL, value NUMERIC(15,2) NOT NULL,
      cost NUMERIC(15,2) NOT NULL, type TEXT NOT NULL, date TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY DEFAULT 'default',
      currency TEXT DEFAULT 'USD',
      budgets JSONB DEFAULT '{"food":500,"transport":200,"entertainment":300,"health":250,"housing":1500}',
      updated_at TIMESTAMPTZ DEFAULT NOW())`;
    await sql`INSERT INTO user_settings (user_id) VALUES ('default') ON CONFLICT (user_id) DO NOTHING`;
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: 'Tables ready' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
