import { neon } from '@netlify/neon';

const USER_ID = 'default';

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
        SELECT * FROM investments
        WHERE user_id = ${USER_ID}
        ORDER BY created_at DESC
      `;
      return new Response(JSON.stringify(rows), {
        status: 200, headers: corsHeaders()
      });
    }

    if (req.method === 'POST') {
      const { id, name, value, cost, type, date } = await req.json();
      await sql`
        INSERT INTO investments (id, user_id, name, value, cost, type, date)
        VALUES (${id}, ${USER_ID}, ${name}, ${value}, ${cost}, ${type}, ${date})
        ON CONFLICT (id) DO NOTHING
      `;
      return new Response(JSON.stringify({ ok: true }), {
        status: 201, headers: corsHeaders()
      });
    }

    if (req.method === 'DELETE') {
      const id = new URL(req.url).searchParams.get('id');
      if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: corsHeaders() });
      await sql`DELETE FROM investments WHERE id = ${id} AND user_id = ${USER_ID}`;
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

export const config = { path: '/api/investments' };
