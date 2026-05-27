const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamo = new DynamoDBClient({ region: process.env.REGION || 'us-east-1' });
const ses = new SESClient({ region: process.env.REGION || 'us-east-1' });

const TABLE_NAME = process.env.OCCASION_TABLE;
const FROM_EMAIL = process.env.FROM_EMAIL;
const APP_URL = process.env.APP_URL || 'https://www.whatwhenwherewho.com';

const respond = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

exports.handler = async (event) => {
  console.log('Path:', event.path);
  console.log('TABLE_NAME:', TABLE_NAME);

  if (event.httpMethod === 'OPTIONS') {
    return respond(200, {});
  }

  let occasionId;
  try {
    const parsed = JSON.parse(event.body || '{}');
    occasionId = parsed.occasionId;
  } catch (e) {
    return respond(400, { error: 'Invalid request body' });
  }

  if (!occasionId) {
    return respond(400, { error: 'occasionId is required' });
  }

  let occasion;
  try {
    const result = await dynamo.send(new GetItemCommand({
      TableName: TABLE_NAME,
      Key: { id: { S: occasionId } },
    }));
    if (!result.Item) {
      return respond(404, { error: 'Occasion not found' });
    }
    occasion = unmarshall(result.Item);
    console.log('Occasion found:', occasion.title);
  } catch (e) {
    console.error('DynamoDB error:', e.message);
    return respond(500, { error: 'Failed to fetch occasion: ' + e.message });
  }

  let respondents = [];
  try {
    if (Array.isArray(occasion.respondents)) {
      respondents = occasion.respondents;
    } else {
      respondents = JSON.parse(occasion.respondents || '[]');
    }
  } catch (e) {
    return respond(500, { error: 'Failed to parse respondents: ' + e.message });
  }

  const toEmail = respondents.filter(r => r.email);
  if (toEmail.length === 0) {
    return respond(200, { sent: 0, message: 'No respondents with emails' });
  }

  const occasionUrl = `${APP_URL}/occasion/${occasionId}`;
  const path = event.path || '';
  const isFinalized = path.includes('share-finalized');

  let sent = 0;
  for (const r of toEmail) {
    try {
      const message = isFinalized
        ? buildFinalizedEmail(r, occasion, occasionUrl)
        : buildReminderEmail(r, occasion, occasionUrl);

      await ses.send(new SendEmailCommand({
        Source: FROM_EMAIL,
        ReplyToAddresses: [occasion.ownerEmail],
        Destination: { ToAddresses: [r.email] },
        Message: message,
      }));
      sent++;
    } catch (e) {
      console.error(`Failed to send to ${r.email}:`, e.message);
    }
  }

  return respond(200, { sent });
};

function buildReminderEmail(r, occasion, occasionUrl) {
  return {
    Subject: { Data: `${occasion.ownerName} would like your input on ${occasion.title}` },
    Body: {
      Html: {
        Data: `<p>Hi ${r.name || 'there'},</p>
<p>${occasion.ownerName} would like to know your availability and location preference for <strong>${occasion.title}</strong>.</p>
<p>
  <a href="${occasionUrl}" style="background:#3f51b5;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-right:8px;">View Occasion</a>
  <a href="${APP_URL}" style="background:#1E3A1E;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">View All Your Occasions</a>
</p>
<p>Please direct questions or concerns about the occasion to <a href="mailto:${occasion.ownerEmail}">${occasion.ownerName}</a>.</p>`,
      },
      Text: {
        Data: `Hi ${r.name || 'there'},\n\n${occasion.ownerName} would like to know your availability and location preference for "${occasion.title}".\n\n${occasionUrl}\n\nPlease direct questions or concerns to ${occasion.ownerName} at ${occasion.ownerEmail}`,
      },
    },
  };
}

function buildFinalizedEmail(r, occasion, occasionUrl) {
  const date = formatDate(occasion.finalDate);
  const startTime = formatTime(occasion.finalStartTime);
  const endTime = formatTime(occasion.finalEndTime);
  const endDate = occasion.finalEndDate && occasion.finalEndDate !== occasion.finalDate
    ? formatDate(occasion.finalEndDate) : null;

  const timeRange = startTime
    ? (endTime ? `${startTime} – ${endTime}` : startTime)
    : null;

  const detailsHtml = [
    date ? `<tr><td style="padding:6px 12px;color:#666;width:100px;">Date</td><td style="padding:6px 12px;font-weight:500;">${date}${endDate ? ` – ${endDate}` : ''}</td></tr>` : '',
    timeRange ? `<tr><td style="padding:6px 12px;color:#666;">Time</td><td style="padding:6px 12px;font-weight:500;">${timeRange}</td></tr>` : '',
    occasion.finalLocation ? `<tr><td style="padding:6px 12px;color:#666;">Location</td><td style="padding:6px 12px;font-weight:500;">${occasion.finalLocation}</td></tr>` : '',
    occasion.finalNotes ? `<tr><td style="padding:6px 12px;color:#666;vertical-align:top;">Notes</td><td style="padding:6px 12px;">${occasion.finalNotes}</td></tr>` : '',
  ].filter(Boolean).join('');

  const detailsText = [
    date ? `Date: ${date}${endDate ? ` – ${endDate}` : ''}` : '',
    timeRange ? `Time: ${timeRange}` : '',
    occasion.finalLocation ? `Location: ${occasion.finalLocation}` : '',
    occasion.finalNotes ? `Notes: ${occasion.finalNotes}` : '',
  ].filter(Boolean).join('\n');

  return {
    Subject: { Data: `${occasion.title} has been finalized!` },
    Body: {
      Html: {
        Data: `<p>Hi ${r.name || 'there'},</p>
<p>${occasion.ownerName} has finalized the details for <strong>${occasion.title}</strong>!</p>
${detailsHtml ? `<table style="border-collapse:collapse;margin:16px 0;background:#f9f9f9;border-radius:8px;width:100%;max-width:400px;">${detailsHtml}</table>` : ''}
<p>
  <a href="${occasionUrl}" style="background:#3f51b5;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-right:8px;">View Occasion</a>
  <a href="${APP_URL}" style="background:#1E3A1E;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">View All Your Occasions</a>
</p>
<p>Please direct questions or concerns about the occasion to <a href="mailto:${occasion.ownerEmail}">${occasion.ownerName}</a>.</p>`,
      },
      Text: {
        Data: `Hi ${r.name || 'there'},\n\n${occasion.ownerName} has finalized the details for "${occasion.title}"!\n\n${detailsText}\n\n${occasionUrl}\n\nPlease direct questions or concerns to ${occasion.ownerName} at ${occasion.ownerEmail}`,
      },
    },
  };
}
