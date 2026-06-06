exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const name = (body.name || '').trim();
  const attendance = body.attendance;

  if (!name || !['coming', 'not_coming'].includes(attendance)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid fields' }) };
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  const attendanceLabel = attendance === 'coming' ? '✅ Coming' : '❌ Cannot make it';
  const message =
    "🎉 New RSVP — Hope's Baptism\n\n" +
    '👤 Name: ' + name + '\n' +
    '📋 Attendance: ' + attendanceLabel;

  const telegramRes = await fetch(
    'https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    }
  );

  const telegramData = await telegramRes.json();

  if (!telegramData.ok) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Telegram error: ' + (telegramData.description || 'unknown') })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
};
