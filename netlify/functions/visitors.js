const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    // Get or create visitor ID from cookie
    const cookies = event.headers.cookie || '';
    let vid = cookies.match(/vid=([^;]+)/)?.[1];
    const isNew = !vid;
    if (!vid) vid = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const now = Math.floor(Date.now() / 1000);
    const key = `visitor:${vid}`;

    // Set visitor with 30s expiry
    await redis.set(key, now, { ex: 30 });

    // Count all active visitors (keys matching visitor:*)
    let count = 0;
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, { match: 'visitor:*', count: 100 });
      cursor = result[0];
      count += result[1].length;
    } while (cursor !== 0);

    const response = {
      statusCode: 200,
      headers,
      body: JSON.stringify({ count }),
    };

    // Set cookie for new visitors
    if (isNew) {
      response.headers['Set-Cookie'] = `vid=${vid}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`;
    }

    return response;
  } catch (err) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ count: 1 }),
    };
  }
};
