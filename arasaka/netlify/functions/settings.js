import { neon } from '@netlify/neon';

const USER_ID = 'default';

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

export default async function handler(req, context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const sql = neon();

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM user_settings WHERE user_id = ${USER_ID}
      `;
      return new Response(JSON.stringify(rows[0] || {}), {
        status: 200, headers: corsHeaders()
      });
    }

    if (req.method === 'POST') {
      const { currency, budgets } = await req.json();
      await sql`
        INSERT INTO user_settings (user_id, currency, budgets, updated_at)
        VALUES (${USER_ID}, ${currency}, ${JSON.stringify(budgets)}, NOW())
        ON CONFLICT (user_id) DO UPDATE
          SET currency = EXCLUDED.currency,
              budgets = EXCLUDED.budgets,
              updated_at = NOW()
      `;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: corsHeaders()
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: corsHeaders()
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500, headers: corsHeaders()
    });
  }
}

export const config = { path: '/api/settings' };
