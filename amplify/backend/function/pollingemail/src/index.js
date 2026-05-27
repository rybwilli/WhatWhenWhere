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

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));
  console.log('TABLE_NAME:', TABLE_NAME);
  console.log('FROM_EMAIL:', FROM_EMAIL);

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
    console.log('respondents raw value:', JSON.stringify(occasion.respondents));
    console.log('respondents type:', typeof occasion.respondents);
    if (Array.isArray(occasion.respondents)) {
      respondents = occasion.respondents;
    } else {
      respondents = JSON.parse(occasion.respondents || '[]');
    }
  } catch (e) {
    return respond(500, { error: 'Failed to parse respondents: ' + e.message + ' raw: ' + String(occasion.respondents) });
  }

  const toEmail = respondents.filter(r => r.email);
  if (toEmail.length === 0) {
    return respond(200, { sent: 0, message: 'No respondents with emails' });
  }

  const occasionUrl = `${APP_URL}/occasion/${occasionId}`;
  let sent = 0;

  for (const r of toEmail) {
    try {
      await ses.send(new SendEmailCommand({
        Source: FROM_EMAIL,
        ReplyToAddresses: [occasion.ownerEmail],
        Destination: { ToAddresses: [r.email] },
        Message: {
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
              Data: `Hi ${r.name || 'there'},\n\n${occasion.ownerName} would like to know your availability and location preference for "${occasion.title}".\n\n${occasionUrl}\n\nPlease direct questions or concerns about the occasion to ${occasion.ownerName} at ${occasion.ownerEmail}`,
            },
          },
        },
      }));
      sent++;
    } catch (e) {
      console.error(`Failed to send to ${r.email}:`, e.message);
    }
  }

  return respond(200, { sent });
};
