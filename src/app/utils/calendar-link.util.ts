import { Occasion } from '../models/occasion.model';

interface OccasionTimes {
  start: Date;
  end: Date;
  allDay: boolean;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

// Final date/time fields have no timezone info, so they're treated as floating
// wall-clock time — i.e. whatever local timezone the browser is in. Fine for
// same-area meetups; would need a stored timezone to be fully correct for
// occasions whose respondents span multiple timezones.
function getOccasionTimes(occasion: Occasion): OccasionTimes | null {
  if (!occasion.finalDate) return null;

  if (!occasion.finalStartTime) {
    const start = new Date(`${occasion.finalDate}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end, allDay: true };
  }

  const start = new Date(`${occasion.finalDate}T${occasion.finalStartTime}:00`);
  let end: Date;
  if (occasion.finalEndTime) {
    const endDateStr = occasion.finalEndDate || occasion.finalDate;
    end = new Date(`${endDateStr}T${occasion.finalEndTime}:00`);
  } else {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }
  return { start, end, allDay: false };
}

function toGoogleDate(d: Date, allDay: boolean): string {
  if (allDay) {
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  }
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function buildGoogleCalendarUrl(occasion: Occasion): string | null {
  const times = getOccasionTimes(occasion);
  if (!times) return null;
  const { start, end, allDay } = times;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: occasion.title,
    dates: `${toGoogleDate(start, allDay)}/${toGoogleDate(end, allDay)}`,
    details: occasion.finalNotes || occasion.description || '',
    location: occasion.finalLocation || '',
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
}

function toIcsLocalDate(d: Date, allDay: boolean): string {
  if (allDay) {
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  }
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function toIcsUtcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// RFC 5545 line folding: continuation lines start with a single space.
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let idx = 0;
  while (idx < line.length) {
    const chunkLen = idx === 0 ? 75 : 74;
    parts.push(line.slice(idx, idx + chunkLen));
    idx += chunkLen;
  }
  return parts.join('\r\n ');
}

export function buildIcsContent(occasion: Occasion): string | null {
  const times = getOccasionTimes(occasion);
  if (!times) return null;
  const { start, end, allDay } = times;

  const dtStartLine = allDay
    ? `DTSTART;VALUE=DATE:${toIcsLocalDate(start, true)}`
    : `DTSTART:${toIcsLocalDate(start, false)}`;
  const dtEndLine = allDay
    ? `DTEND;VALUE=DATE:${toIcsLocalDate(end, true)}`
    : `DTEND:${toIcsLocalDate(end, false)}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WhatWhenWhere//Occasion//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${occasion.id}@whatwhenwherewho.com`,
    `DTSTAMP:${toIcsUtcStamp(new Date())}`,
    dtStartLine,
    dtEndLine,
    `SUMMARY:${escapeIcsText(occasion.title)}`,
  ];
  const description = occasion.finalNotes || occasion.description;
  if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  if (occasion.finalLocation) lines.push(`LOCATION:${escapeIcsText(occasion.finalLocation)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.map(foldLine).join('\r\n');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-+|-+$/g, '') || 'event';
}

export function downloadIcsFile(occasion: Occasion): void {
  const content = buildIcsContent(occasion);
  if (!content) return;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(occasion.title)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
