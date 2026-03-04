const { neon } = require('@netlify/neon');

exports.handler = async function(event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const sql = neon();
    const result = await sql`SELECT NOW() as time`;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'OK',
        db_connected: true,
        db_time: result[0].time,
        env_var_present: !!process.env.NETLIFY_DATABASE_URL
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'ERROR',
        db_connected: false,
        error: err.message,
        env_var_present: !!process.env.NETLIFY_DATABASE_URL
      })
    };
  }
};
