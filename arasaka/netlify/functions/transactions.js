import { neon } from '@netlify/neon';

const USER_ID = 'default'; // replace with auth user id when you add auth

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

export default async function handler(req, context) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const sql = neon();

  try {
    // GET — fetch all transactions
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM transactions
        WHERE user_id = ${USER_ID}
        ORDER BY created_at DESC
      `;
      return new Response(JSON.stringify(rows), {
        status: 200, headers: corsHeaders()
      });
    }

    // POST — insert a transaction
    if (req.method === 'POST') {
      const body = await req.json();
      const { id, description, amount, type, category, date } = body;

      await sql`
        INSERT INTO transactions (id, user_id, description, amount, type, category, date)
        VALUES (${id}, ${USER_ID}, ${description}, ${amount}, ${type}, ${category}, ${date})
        ON CONFLICT (id) DO NOTHING
      `;
      return new Response(JSON.stringify({ ok: true }), {
        status: 201, headers: corsHeaders()
      });
    }

    // DELETE — remove a transaction by id
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: corsHeaders() });

      await sql`DELETE FROM transactions WHERE id = ${id} AND user_id = ${USER_ID}`;
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

export const config = { path: '/api/transactions' };
