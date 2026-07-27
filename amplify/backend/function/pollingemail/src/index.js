const { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');

const dynamo = new DynamoDBClient({ region: process.env.REGION || 'us-east-1' });
const ses = new SESClient({ region: process.env.REGION || 'us-east-1' });
const sns = new SNSClient({ region: process.env.REGION || 'us-east-1' });

const TABLE_NAME    = process.env.OCCASION_TABLE;
const PROFILE_TABLE = process.env.PROFILE_TABLE;
const FROM_EMAIL    = process.env.FROM_EMAIL;
const APP_URL       = process.env.APP_URL || 'https://www.whatwhenwherewho.com';

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

// Normalizes to E.164 for SNS. Assumes US numbers when no country code is given.
const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  if (phone.trim().startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
};

async function getProfilesByEmail(emails) {
  const profiles = {};
  if (!emails || !emails.length) return profiles;

  const filterParts = emails.map((_, i) => `#email = :email${i}`);
  const attrValues = {};
  emails.forEach((e, i) => { attrValues[`:email${i}`] = { S: e.toLowerCase() }; });

  const result = await dynamo.send(new ScanCommand({
    TableName: PROFILE_TABLE,
    FilterExpression: filterParts.join(' OR '),
    ExpressionAttributeNames: { '#email': 'email' },
    ExpressionAttributeValues: attrValues,
  }));

  (result.Items || []).forEach(item => {
    const p = unmarshall(item);
    if (p.email) {
      profiles[p.email.toLowerCase()] = {
        useGooglePhoto: p.useGooglePhoto !== false,
        googlePhotoUrl: p.googlePhotoUrl || null,
        playerImageUrl: p.playerImageUrl || null,
        playerName:     p.playerName     || null,
        phone:          p.phone          || null,
        notifyBy:       p.notifyBy       || 'email',
      };
    }
  });

  return profiles;
}

exports.handler = async (event) => {
  console.log('Path:', event.path);
  console.log('TABLE_NAME:', TABLE_NAME);

  if (event.httpMethod === 'OPTIONS') {
    return respond(200, {});
  }

  const path = event.path || '';

  if (path.includes('get-profile')) {
    return handleGetProfile(event);
  }
  if (path.includes('save-profile')) {
    return handleSaveProfile(event);
  }
  if (path.includes('get-respondent-profiles')) {
    return handleGetRespondentProfiles(event);
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

  const occasionUrl = `${APP_URL}/occasion/${occasionId}`;
  const isFinalized = path.includes('share-finalized');

  let toEmail;
  if (isFinalized) {
    toEmail = respondents.filter(r => r.email);
  } else {
    // Only remind respondents who haven't voted on any when or where option
    let whenOptions = [];
    let whereOptions = [];
    try {
      whenOptions = Array.isArray(occasion.whenOptions)
        ? occasion.whenOptions
        : JSON.parse(occasion.whenOptions || '[]');
      whereOptions = Array.isArray(occasion.whereOptions)
        ? occasion.whereOptions
        : JSON.parse(occasion.whereOptions || '[]');
    } catch (e) {
      console.error('Failed to parse options:', e.message);
    }

    toEmail = respondents.filter(r => {
      if (!r.email) return false;
      const email = r.email.toLowerCase();
      const votedAllWhen = whenOptions.every(o =>
        (o.votes || []).some(v => (v.voterId || v.voter || '').toLowerCase() === email)
      );
      const votedAllWhere = whereOptions.length <= 1 || whereOptions.every(o =>
        (o.votes || []).some(v => (v.voterId || v.voter || '').toLowerCase() === email)
      );
      return !votedAllWhen || !votedAllWhere;
    });
    console.log(`Sending to ${toEmail.length} of ${respondents.length} respondents who haven't completed all votes`);
  }

  if (toEmail.length === 0) {
    return respond(200, { sent: 0, message: isFinalized ? 'No respondents with emails' : 'All respondents have already voted!' });
  }

  const profilesByEmail = await getProfilesByEmail(toEmail.map(r => r.email));

  let sent = 0;
  for (const r of toEmail) {
    const profile = profilesByEmail[r.email.toLowerCase()];
    const phone = profile?.notifyBy === 'sms' ? normalizePhone(profile.phone) : null;

    try {
      if (phone) {
        const text = isFinalized
          ? buildFinalizedSms(r, occasion, occasionUrl)
          : buildReminderSms(r, occasion, occasionUrl);

        await sns.send(new PublishCommand({
          PhoneNumber: phone,
          Message: text,
        }));
      } else {
        const message = isFinalized
          ? buildFinalizedEmail(r, occasion, occasionUrl)
          : buildReminderEmail(r, occasion, occasionUrl);

        await ses.send(new SendEmailCommand({
          Source: `What? When? Where? Who? <${FROM_EMAIL}>`,
          ReplyToAddresses: [occasion.ownerEmail],
          Destination: { ToAddresses: [r.email] },
          Message: message,
        }));
      }
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

function buildReminderSms(r, occasion, occasionUrl) {
  return `${occasion.ownerName} would like your input on "${occasion.title}". ${occasionUrl}`;
}

function buildFinalizedSms(r, occasion, occasionUrl) {
  const date = formatDate(occasion.finalDate);
  const startTime = formatTime(occasion.finalStartTime);
  const parts = [date, startTime, occasion.finalLocation].filter(Boolean).join(', ');
  return `"${occasion.title}" has been finalized!${parts ? ` ${parts}.` : ''} ${occasionUrl}`;
}

async function handleGetProfile(event) {
  const { userId } = JSON.parse(event.body || '{}');
  if (!userId) return respond(400, { error: 'userId required' });

  try {
    const result = await dynamo.send(new GetItemCommand({
      TableName: PROFILE_TABLE,
      Key: { id: { S: userId } },
    }));
    if (!result.Item) return respond(200, { profile: null });
    const profile = unmarshall(result.Item);
    return respond(200, { profile: {
      playerName:     profile.playerName     || null,
      playerTeam:     profile.playerTeam     || null,
      playerPosition: profile.playerPosition || null,
      playerImageUrl: profile.playerImageUrl || null,
      useGooglePhoto: profile.useGooglePhoto !== false,
      phone:          profile.phone          || null,
      notifyBy:       profile.notifyBy       || 'email',
    }});
  } catch (e) {
    console.error('get-profile error:', e.message);
    return respond(500, { error: e.message });
  }
}

async function handleSaveProfile(event) {
  const { userId, ownerSub, email, playerName, playerTeam, playerPosition, playerImageUrl, useGooglePhoto, googlePhotoUrl, phone, notifyBy } = JSON.parse(event.body || '{}');
  if (!userId) return respond(400, { error: 'userId required' });

  try {
    await dynamo.send(new PutItemCommand({
      TableName: PROFILE_TABLE,
      Item: marshall({
        id:             userId,
        ownerSub:       ownerSub || userId,
        email:          email          || null,
        googlePhotoUrl: googlePhotoUrl || null,
        playerName:     playerName     || null,
        playerTeam:     playerTeam     || null,
        playerPosition: playerPosition || null,
        playerImageUrl: playerImageUrl || null,
        useGooglePhoto: useGooglePhoto !== false,
        phone:          normalizePhone(phone) || null,
        notifyBy:       notifyBy === 'sms' ? 'sms' : 'email',
      }, { removeUndefinedValues: true }),
    }));
    return respond(200, { saved: true });
  } catch (e) {
    console.error('save-profile error:', e.message);
    return respond(500, { error: e.message });
  }
}

async function handleGetRespondentProfiles(event) {
  const { emails } = JSON.parse(event.body || '{}');
  if (!emails || !emails.length) return respond(400, { error: 'emails required' });

  try {
    const { ScanCommand } = require('@aws-sdk/client-dynamodb');
    const filterParts = emails.map((_, i) => `#email = :email${i}`);
    const attrValues = {};
    emails.forEach((e, i) => { attrValues[`:email${i}`] = { S: e.toLowerCase() }; });

    const result = await dynamo.send(new ScanCommand({
      TableName: PROFILE_TABLE,
      FilterExpression: filterParts.join(' OR '),
      ExpressionAttributeNames: { '#email': 'email' },
      ExpressionAttributeValues: attrValues,
    }));

    const profiles = {};
    (result.Items || []).forEach(item => {
      const p = unmarshall(item);
      if (p.email) {
        profiles[p.email.toLowerCase()] = {
          useGooglePhoto: p.useGooglePhoto !== false,
          googlePhotoUrl: p.googlePhotoUrl || null,
          playerImageUrl: p.playerImageUrl || null,
          playerName:     p.playerName     || null,
        };
      }
    });

    return respond(200, { profiles });
  } catch (e) {
    console.error('get-respondent-profiles error:', e.message);
    return respond(500, { error: e.message });
  }
}
