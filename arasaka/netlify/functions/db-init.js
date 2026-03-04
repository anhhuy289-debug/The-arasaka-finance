import { neon } from '@netlify/neon';

export default async function handler(req, context) {
  const sql = neon(); // uses NETLIFY_DATABASE_URL automatically

  try {
    // Create all tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id BIGINT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default',
        description TEXT NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income','expense')),
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS savings (
        id BIGINT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default',
        name TEXT NOT NULL,
        balance NUMERIC(15,2) NOT NULL,
        rate NUMERIC(6,4) DEFAULT 0,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS investments (
        id BIGINT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'default',
        name TEXT NOT NULL,
        value NUMERIC(15,2) NOT NULL,
        cost NUMERIC(15,2) NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY DEFAULT 'default',
        currency TEXT DEFAULT 'USD',
        budgets JSONB DEFAULT '{"food":500,"transport":200,"entertainment":300,"health":250,"housing":1500}',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Insert default settings row if not exists
    await sql`
      INSERT INTO user_settings (user_id)
      VALUES ('default')
      ON CONFLICT (user_id) DO NOTHING
    `;

    return new Response(JSON.stringify({ ok: true, message: 'Tables ready' }), {
      status: 200,
      headers: corsHeaders()
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

export const config = { path: '/api/db-init' };
