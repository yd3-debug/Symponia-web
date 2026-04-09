// ── Airtable Service ──────────────────────────────────────────────────────────
// Multi-platform content queue for the Symponia marketing team
// Table: "Marketing Queue" in your Airtable base

import dotenv from 'dotenv';
dotenv.config();

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_NAME       = process.env.AIRTABLE_TABLE || 'Marketing Queue';

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type Platform    = 'instagram' | 'tiktok' | 'linkedin';
export type ContentType = 'reel' | 'carousel' | 'static' | 'story' | 'video' | 'text-video' | 'post' | 'document';
export type ContentStatus =
  | 'draft'        // just generated, not yet reviewed
  | 'generating'   // Kie.ai job in progress
  | 'review'       // ready for human review
  | 'approved'     // approved, ready to schedule
  | 'scheduled'    // sent to Blotato, scheduled
  | 'posted'       // live on platform
  | 'rejected';    // rejected, back to draft pool

export interface ContentRecord {
  id?: string;                   // Airtable record ID
  platform: Platform;
  contentType: ContentType;
  agent: string;                 // "Instagram Agent" | "TikTok Agent" | "LinkedIn Agent"
  hook: string;
  caption: string;
  hashtags?: string;
  script?: string;               // TikTok/Reel full script
  slides?: string;               // JSON string of slide array
  visualPrompt: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  kieJobId?: string;
  status: ContentStatus;
  scheduledAt?: string;          // ISO datetime
  blotPostId?: string;
  trendReference?: string;
  viralScore?: number;
  notes?: string;
  generatedAt?: string;
  approvedAt?: string;
  postedAt?: string;
  firstComment?: string;         // LinkedIn pinned first comment (for link)
}

// ── Airtable field name map ───────────────────────────────────────────────────
// Must match your Airtable column names exactly

const FIELDS = {
  platform:      'Platform',
  contentType:   'Content Type',
  agent:         'Agent',
  hook:          'Hook',
  caption:       'Caption',
  hashtags:      'Hashtags',
  script:        'Script',
  slides:        'Slides (JSON)',
  visualPrompt:  'Visual Prompt',
  imageUrl:      'Image URL',
  videoUrl:      'Video URL',
  thumbnailUrl:  'Thumbnail URL',
  kieJobId:      'Kie Job ID',
  status:        'Status',
  scheduledAt:   'Scheduled At',
  blotPostId:    'Blotato Post ID',
  trendReference:'Trend Reference',
  viralScore:    'Viral Score',
  notes:         'Notes',
  generatedAt:   'Generated At',
  approvedAt:    'Approved At',
  postedAt:      'Posted At',
  firstComment:  'First Comment',
};

// ── Core API helper ───────────────────────────────────────────────────────────

async function airRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: object
): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable error ${res.status}: ${err}`);
  }

  return method === 'DELETE' ? null : res.json();
}

// ── Map record to Airtable fields ─────────────────────────────────────────────

function toFields(record: Partial<ContentRecord>): Record<string, any> {
  const f: Record<string, any> = {};
  if (record.platform      !== undefined) f[FIELDS.platform]       = record.platform;
  if (record.contentType   !== undefined) f[FIELDS.contentType]    = record.contentType;
  if (record.agent         !== undefined) f[FIELDS.agent]          = record.agent;
  if (record.hook          !== undefined) f[FIELDS.hook]           = record.hook;
  if (record.caption       !== undefined) f[FIELDS.caption]        = record.caption;
  if (record.hashtags      !== undefined) f[FIELDS.hashtags]       = record.hashtags;
  if (record.script        !== undefined) f[FIELDS.script]         = record.script;
  if (record.slides        !== undefined) f[FIELDS.slides]         = typeof record.slides === 'object' ? JSON.stringify(record.slides) : record.slides;
  if (record.visualPrompt  !== undefined) f[FIELDS.visualPrompt]   = record.visualPrompt;
  if (record.imageUrl      !== undefined) f[FIELDS.imageUrl]       = record.imageUrl;
  if (record.videoUrl      !== undefined) f[FIELDS.videoUrl]       = record.videoUrl;
  if (record.thumbnailUrl  !== undefined) f[FIELDS.thumbnailUrl]   = record.thumbnailUrl;
  if (record.kieJobId      !== undefined) f[FIELDS.kieJobId]       = record.kieJobId;
  if (record.status        !== undefined) f[FIELDS.status]         = record.status;
  if (record.scheduledAt   !== undefined) f[FIELDS.scheduledAt]    = record.scheduledAt;
  if (record.blotPostId    !== undefined) f[FIELDS.blotPostId]     = record.blotPostId;
  if (record.trendReference !== undefined) f[FIELDS.trendReference] = record.trendReference;
  if (record.viralScore    !== undefined) f[FIELDS.viralScore]     = record.viralScore;
  if (record.notes         !== undefined) f[FIELDS.notes]          = record.notes;
  if (record.generatedAt   !== undefined) f[FIELDS.generatedAt]    = record.generatedAt;
  if (record.approvedAt    !== undefined) f[FIELDS.approvedAt]     = record.approvedAt;
  if (record.postedAt      !== undefined) f[FIELDS.postedAt]       = record.postedAt;
  if (record.firstComment  !== undefined) f[FIELDS.firstComment]   = record.firstComment;
  return f;
}

// ── Map Airtable fields back to ContentRecord ─────────────────────────────────

function fromFields(raw: any): ContentRecord {
  const f = raw.fields;
  return {
    id:             raw.id,
    platform:       f[FIELDS.platform],
    contentType:    f[FIELDS.contentType],
    agent:          f[FIELDS.agent],
    hook:           f[FIELDS.hook],
    caption:        f[FIELDS.caption],
    hashtags:       f[FIELDS.hashtags],
    script:         f[FIELDS.script],
    slides:         f[FIELDS.slides],
    visualPrompt:   f[FIELDS.visualPrompt],
    imageUrl:       f[FIELDS.imageUrl],
    videoUrl:       f[FIELDS.videoUrl],
    thumbnailUrl:   f[FIELDS.thumbnailUrl],
    kieJobId:       f[FIELDS.kieJobId],
    status:         f[FIELDS.status],
    scheduledAt:    f[FIELDS.scheduledAt],
    blotPostId:     f[FIELDS.blotPostId],
    trendReference: f[FIELDS.trendReference],
    viralScore:     f[FIELDS.viralScore],
    notes:          f[FIELDS.notes],
    generatedAt:    f[FIELDS.generatedAt],
    approvedAt:     f[FIELDS.approvedAt],
    postedAt:       f[FIELDS.postedAt],
    firstComment:   f[FIELDS.firstComment],
    status: f[FIELDS.status] ?? 'draft',
  };
}

// ── CRUD operations ───────────────────────────────────────────────────────────

export async function createRecord(record: ContentRecord): Promise<ContentRecord> {
  const data = await airRequest('POST', '', {
    fields: toFields({ ...record, generatedAt: new Date().toISOString() }),
  });
  return fromFields(data);
}

export async function updateRecord(id: string, updates: Partial<ContentRecord>): Promise<ContentRecord> {
  const data = await airRequest('PATCH', `/${id}`, { fields: toFields(updates) });
  return fromFields(data);
}

export async function getRecord(id: string): Promise<ContentRecord> {
  const data = await airRequest('GET', `/${id}`);
  return fromFields(data);
}

export async function deleteRecord(id: string): Promise<void> {
  await airRequest('DELETE', `/${id}`);
}

// ── Filtered list queries ─────────────────────────────────────────────────────

export async function listByStatus(
  status: ContentStatus,
  platform?: Platform
): Promise<ContentRecord[]> {
  let formula = `{${FIELDS.status}} = "${status}"`;
  if (platform) formula = `AND(${formula}, {${FIELDS.platform}} = "${platform}")`;

  const data = await airRequest('GET', `?filterByFormula=${encodeURIComponent(formula)}&sort[0][field]=${encodeURIComponent(FIELDS.generatedAt)}&sort[0][direction]=desc`);
  return (data.records ?? []).map(fromFields);
}

export async function listForReview(platform?: Platform): Promise<ContentRecord[]> {
  return listByStatus('review', platform);
}

export async function listApproved(platform?: Platform): Promise<ContentRecord[]> {
  return listByStatus('approved', platform);
}

export async function listAll(platform?: Platform): Promise<ContentRecord[]> {
  const query = platform
    ? `?filterByFormula=${encodeURIComponent(`{${FIELDS.platform}} = "${platform}"`)}&sort[0][field]=${encodeURIComponent(FIELDS.generatedAt)}&sort[0][direction]=desc`
    : `?sort[0][field]=${encodeURIComponent(FIELDS.generatedAt)}&sort[0][direction]=desc&maxRecords=100`;

  const data = await airRequest('GET', query);
  return (data.records ?? []).map(fromFields);
}

// ── Status transition helpers ─────────────────────────────────────────────────

export async function markGenerating(id: string, kieJobId: string): Promise<ContentRecord> {
  return updateRecord(id, { status: 'generating', kieJobId });
}

export async function markReadyForReview(id: string, imageUrl?: string, videoUrl?: string): Promise<ContentRecord> {
  return updateRecord(id, { status: 'review', imageUrl, videoUrl });
}

export async function markApproved(id: string): Promise<ContentRecord> {
  return updateRecord(id, { status: 'approved', approvedAt: new Date().toISOString() });
}

export async function markScheduled(id: string, blotPostId: string, scheduledAt: string): Promise<ContentRecord> {
  return updateRecord(id, { status: 'scheduled', blotPostId, scheduledAt });
}

export async function markPosted(id: string): Promise<ContentRecord> {
  return updateRecord(id, { status: 'posted', postedAt: new Date().toISOString() });
}

export async function markRejected(id: string): Promise<ContentRecord> {
  return updateRecord(id, { status: 'rejected' });
}
