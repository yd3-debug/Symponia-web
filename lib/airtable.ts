// ── Airtable Client ────────────────────────────────────────────────────────────
// Single gateway for all Airtable reads and writes across the 7-table schema.
// No agent or component should call Airtable directly — use this file only.

import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID!,
);

// ── Table names ───────────────────────────────────────────────────────────────

const T = {
  CAMPAIGNS:       'Campaigns',
  BRAND_PROFILES:  'Brand Profiles',
  RESEARCH:        'Research Reports',
  IDEAS:           'Content Ideas',
  CONTENT_PIECES:  'Content Pieces',
  CALENDAR:        'Content Calendar',
  JOBS:            'Generation Jobs',
} as const;

// ── TypeScript interfaces ──────────────────────────────────────────────────────

export type CampaignStatus = 'Brief' | 'Research' | 'Ideas' | 'Content' | 'Visuals' | 'Scheduled' | 'Live';
export type Platform = 'Instagram' | 'LinkedIn' | 'Twitter/X' | 'TikTok' | 'Facebook' | 'YouTube' | 'Pinterest';
export type CampaignGoal = 'Awareness' | 'Leads' | 'Sales' | 'Followers' | 'Engagement';
export type Tone = 'Professional' | 'Casual' | 'Humorous' | 'Inspirational' | 'Educational';
export type PostingFrequency = 'Daily' | '3x/week' | 'Weekly';
export type ContentFormat = 'Carousel' | 'Reel' | 'Thread' | 'Article' | 'Story' | 'Video';
export type EngagementPotential = 'High' | 'Medium' | 'Low';
export type ContentType = 'Caption' | 'Thread' | 'Script' | 'Article' | 'Story Copy' | 'Ad Copy';
export type ContentStatus = 'Draft' | 'Review' | 'Approved' | 'Scheduled' | 'Published';
export type VisualGenerationStatus = 'Pending' | 'Generating' | 'Complete' | 'Failed';
export type JobType = 'Image' | 'Video';
export type JobStatus = 'Queued' | 'Processing' | 'Done' | 'Failed';
export type PublishStatus = 'Queued' | 'Published' | 'Failed';
export type AssetType = 'Image' | 'Video';

export interface Campaign {
  id?: string;
  campaignName: string;
  userId: string;
  brandName: string;
  productOrService: string;
  targetAudience: string;
  platforms: Platform[];
  goal: CampaignGoal;
  tone: Tone;
  competitors?: string;
  postingFrequency: PostingFrequency;
  status: CampaignStatus;
  createdAt?: string;
}

export interface BrandProfile {
  id?: string;
  userId: string;
  brandName: string;
  brandVoice: string;
  audienceDescription: string;
  competitors?: string;
  colorPalette?: string;
  visualStyle?: string;
  referenceImageUrls?: string; // JSON array
  savedAt?: string;
}

export interface ResearchReport {
  id?: string;
  campaignId: string;
  trendingTopics: string;  // JSON
  redditInsights: string;  // JSON
  seoKeywords: string;     // JSON
  competitorAnalysis: string; // JSON
  rawExaResults: string;   // JSON
  generatedAt?: string;
}

export interface ContentIdea {
  id?: string;
  campaignId: string;
  ideaTitle: string;
  angleAndHook: string;
  bestPlatform: Platform;
  contentFormat: ContentFormat;
  engagementPotential: EngagementPotential;
  trendingScore: number;
  selected?: boolean;
  notes?: string;
}

export interface ContentPiece {
  id?: string;
  campaignId: string;
  ideaId?: string;
  platform: Platform;
  contentType: ContentType;
  contentBody: string;
  hashtags?: string;
  seoScore?: number;
  seoNotes?: string;
  visualDirection?: string;  // JSON
  referenceImageUrls?: string; // JSON array
  generatedImageUrls?: string; // JSON array of {platform,url,ratio,width,height}
  generatedVideoUrls?: string; // JSON array of {platform,url,ratio,width,height,duration}
  visualGenerationStatus?: VisualGenerationStatus;
  status: ContentStatus;
  approvedAt?: string;
}

export interface CalendarEntry {
  id?: string;
  contentPieceId: string;
  campaignId: string;
  platform: Platform;
  scheduledDate: string;
  blobataPostId?: string;
  assetUrl?: string;
  assetType?: AssetType;
  publishStatus?: PublishStatus;
  publishedAt?: string;
  engagementData?: string; // JSON
}

export interface AirtableJob {
  id?: string;
  campaignId: string;
  contentPieceId: string;
  jobType: JobType;
  platformSpecKey: string;
  status: JobStatus;
  assetUrl?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
}

// ── Generic helpers ────────────────────────────────────────────────────────────

function stripUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

async function getAll<T>(table: string, formula?: string): Promise<T[]> {
  const records: T[] = [];
  const opts: any = { pageSize: 100 };
  if (formula) opts.filterByFormula = formula;

  await base(table).select(opts).eachPage((recs, next) => {
    recs.forEach(r => records.push({ id: r.id, ...r.fields } as T));
    next();
  });
  return records;
}

async function create<T>(table: string, fields: Record<string, any>): Promise<T> {
  const record = await base(table).create(stripUndefined(fields));
  return { id: record.id, ...record.fields } as T;
}

async function update<T>(id: string, table: string, fields: Record<string, any>): Promise<T> {
  const record = await base(table).update(id, stripUndefined(fields));
  return { id: record.id, ...record.fields } as T;
}

async function destroy(id: string, table: string): Promise<void> {
  await base(table).destroy(id);
}

// ── Campaigns ─────────────────────────────────────────────────────────────────

function campaignToFields(c: Partial<Campaign>): Record<string, any> {
  return {
    'Campaign Name':      c.campaignName,
    'User ID':            c.userId,
    'Brand Name':         c.brandName,
    'Product or Service': c.productOrService,
    'Target Audience':    c.targetAudience,
    'Platforms':          c.platforms,
    'Goal':               c.goal,
    'Tone':               c.tone,
    'Competitors':        c.competitors,
    'Posting Frequency':  c.postingFrequency,
    'Status':             c.status,
    'Created At':         c.createdAt ?? new Date().toISOString().split('T')[0],
  };
}

function campaignFromRecord(r: any): Campaign {
  const f = r.fields ?? r;
  return {
    id:               r.id ?? r.id,
    campaignName:     f['Campaign Name'],
    userId:           f['User ID'],
    brandName:        f['Brand Name'],
    productOrService: f['Product or Service'],
    targetAudience:   f['Target Audience'],
    platforms:        f['Platforms'] ?? [],
    goal:             f['Goal'],
    tone:             f['Tone'],
    competitors:      f['Competitors'],
    postingFrequency: f['Posting Frequency'],
    status:           f['Status'],
    createdAt:        f['Created At'],
  };
}

export async function createCampaign(data: Omit<Campaign, 'id'>): Promise<Campaign> {
  const record = await base(T.CAMPAIGNS).create(stripUndefined(campaignToFields(data)));
  return campaignFromRecord({ id: record.id, fields: record.fields });
}

export async function getCampaign(id: string): Promise<Campaign> {
  const record = await base(T.CAMPAIGNS).find(id);
  return campaignFromRecord({ id: record.id, fields: record.fields });
}

export async function getCampaignsByUser(userId: string): Promise<Campaign[]> {
  const records: Campaign[] = [];
  await base(T.CAMPAIGNS)
    .select({ filterByFormula: `{User ID} = "${userId}"`, sort: [{ field: 'Created At', direction: 'desc' }] })
    .eachPage((recs, next) => {
      recs.forEach(r => records.push(campaignFromRecord({ id: r.id, fields: r.fields })));
      next();
    });
  return records;
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
  const record = await base(T.CAMPAIGNS).update(id, stripUndefined(campaignToFields(data)));
  return campaignFromRecord({ id: record.id, fields: record.fields });
}

export async function updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
  return updateCampaign(id, { status });
}

// ── Brand Profiles ─────────────────────────────────────────────────────────────

export async function getBrandProfile(userId: string): Promise<BrandProfile | null> {
  const records: BrandProfile[] = [];
  await base(T.BRAND_PROFILES)
    .select({ filterByFormula: `{User ID} = "${userId}"`, maxRecords: 1 })
    .eachPage((recs, next) => {
      recs.forEach(r => records.push({ id: r.id, ...(r.fields as any) }));
      next();
    });
  return records[0] ?? null;
}

export async function upsertBrandProfile(data: Omit<BrandProfile, 'id'>): Promise<BrandProfile> {
  const existing = await getBrandProfile(data.userId);
  const fields = {
    'User ID':             data.userId,
    'Brand Name':          data.brandName,
    'Brand Voice':         data.brandVoice,
    'Audience Description': data.audienceDescription,
    'Competitors':         data.competitors,
    'Color Palette':       data.colorPalette,
    'Visual Style':        data.visualStyle,
    'Reference Image URLs': data.referenceImageUrls,
    'Saved At':            new Date().toISOString().split('T')[0],
  };
  if (existing?.id) {
    const r = await base(T.BRAND_PROFILES).update(existing.id, stripUndefined(fields));
    return { id: r.id, ...(r.fields as any) };
  }
  const r = await base(T.BRAND_PROFILES).create(stripUndefined(fields));
  return { id: r.id, ...(r.fields as any) };
}

// ── Research Reports ──────────────────────────────────────────────────────────

export async function createResearchReport(data: Omit<ResearchReport, 'id'>): Promise<ResearchReport> {
  const r = await base(T.RESEARCH).create(stripUndefined({
    'Campaign':            [data.campaignId],
    'Trending Topics':     data.trendingTopics,
    'Reddit Insights':     data.redditInsights,
    'SEO Keywords':        data.seoKeywords,
    'Competitor Analysis': data.competitorAnalysis,
    'Raw Exa Results':     data.rawExaResults,
    'Generated At':        new Date().toISOString(),
  }));
  return { id: r.id, ...(r.fields as any) };
}

export async function getResearchReport(campaignId: string): Promise<ResearchReport | null> {
  const records: ResearchReport[] = [];
  await base(T.RESEARCH)
    .select({ filterByFormula: `FIND("${campaignId}", ARRAYJOIN({Campaign}))`, maxRecords: 1 })
    .eachPage((recs, next) => {
      recs.forEach(r => records.push({ id: r.id, ...(r.fields as any) }));
      next();
    });
  return records[0] ?? null;
}

// ── Content Ideas ──────────────────────────────────────────────────────────────

function ideaFromRecord(r: any): ContentIdea {
  const f = r.fields ?? r;
  return {
    id:                 r.id,
    campaignId:         Array.isArray(f['Campaign']) ? f['Campaign'][0] : f['Campaign'],
    ideaTitle:          f['Idea Title'],
    angleAndHook:       f['Angle and Hook'],
    bestPlatform:       f['Best Platform'],
    contentFormat:      f['Content Format'],
    engagementPotential: f['Engagement Potential'],
    trendingScore:      f['Trending Score'],
    selected:           f['Selected'] ?? false,
    notes:              f['Notes'],
  };
}

export async function createContentIdeas(campaignId: string, ideas: Omit<ContentIdea, 'id' | 'campaignId'>[]): Promise<ContentIdea[]> {
  const created: ContentIdea[] = [];
  for (const idea of ideas) {
    const r = await base(T.IDEAS).create(stripUndefined({
      'Campaign':            [campaignId],
      'Idea Title':          idea.ideaTitle,
      'Angle and Hook':      idea.angleAndHook,
      'Best Platform':       idea.bestPlatform,
      'Content Format':      idea.contentFormat,
      'Engagement Potential': idea.engagementPotential,
      'Trending Score':      idea.trendingScore,
      'Notes':               idea.notes,
    }));
    created.push(ideaFromRecord({ id: r.id, fields: r.fields }));
  }
  return created;
}

export async function getContentIdeas(campaignId: string): Promise<ContentIdea[]> {
  const records: ContentIdea[] = [];
  await base(T.IDEAS)
    .select({ filterByFormula: `FIND("${campaignId}", ARRAYJOIN({Campaign}))` })
    .eachPage((recs, next) => {
      recs.forEach(r => records.push(ideaFromRecord({ id: r.id, fields: r.fields })));
      next();
    });
  return records;
}

export async function selectIdea(id: string, selected: boolean): Promise<ContentIdea> {
  const r = await base(T.IDEAS).update(id, { Selected: selected });
  return ideaFromRecord({ id: r.id, fields: r.fields });
}

// ── Content Pieces ─────────────────────────────────────────────────────────────

function pieceFromRecord(r: any): ContentPiece {
  const f = r.fields ?? r;
  return {
    id:                       r.id,
    campaignId:               Array.isArray(f['Campaign']) ? f['Campaign'][0] : f['Campaign'],
    ideaId:                   Array.isArray(f['Idea']) ? f['Idea'][0] : f['Idea'],
    platform:                 f['Platform'],
    contentType:              f['Content Type'],
    contentBody:              f['Content Body'],
    hashtags:                 f['Hashtags'],
    seoScore:                 f['SEO Score'],
    seoNotes:                 f['SEO Notes'],
    visualDirection:          f['Visual Direction'],
    referenceImageUrls:       f['Reference Image URLs'],
    generatedImageUrls:       f['Generated Image URLs'],
    generatedVideoUrls:       f['Generated Video URLs'],
    visualGenerationStatus:   f['Visual Generation Status'] ?? 'Pending',
    status:                   f['Status'] ?? 'Draft',
    approvedAt:               f['Approved At'],
  };
}

export async function createContentPiece(data: Omit<ContentPiece, 'id'>): Promise<ContentPiece> {
  const r = await base(T.CONTENT_PIECES).create(stripUndefined({
    'Campaign':                data.campaignId ? [data.campaignId] : undefined,
    'Idea':                    data.ideaId ? [data.ideaId] : undefined,
    'Platform':                data.platform,
    'Content Type':            data.contentType,
    'Content Body':            data.contentBody,
    'Hashtags':                data.hashtags,
    'SEO Score':               data.seoScore,
    'SEO Notes':               data.seoNotes,
    'Visual Direction':        data.visualDirection,
    'Reference Image URLs':    data.referenceImageUrls,
    'Visual Generation Status': data.visualGenerationStatus ?? 'Pending',
    'Status':                  data.status,
  }));
  return pieceFromRecord({ id: r.id, fields: r.fields });
}

export async function getContentPieces(campaignId: string): Promise<ContentPiece[]> {
  const records: ContentPiece[] = [];
  await base(T.CONTENT_PIECES)
    .select({ filterByFormula: `FIND("${campaignId}", ARRAYJOIN({Campaign}))` })
    .eachPage((recs, next) => {
      recs.forEach(r => records.push(pieceFromRecord({ id: r.id, fields: r.fields })));
      next();
    });
  return records;
}

export async function updateContentPiece(id: string, data: Partial<ContentPiece>): Promise<ContentPiece> {
  const r = await base(T.CONTENT_PIECES).update(id, stripUndefined({
    'Content Body':            data.contentBody,
    'Hashtags':                data.hashtags,
    'SEO Score':               data.seoScore,
    'SEO Notes':               data.seoNotes,
    'Generated Image URLs':    data.generatedImageUrls,
    'Generated Video URLs':    data.generatedVideoUrls,
    'Visual Generation Status': data.visualGenerationStatus,
    'Status':                  data.status,
    'Approved At':             data.approvedAt,
  }));
  return pieceFromRecord({ id: r.id, fields: r.fields });
}

export async function approveContentPiece(id: string): Promise<ContentPiece> {
  return updateContentPiece(id, {
    status: 'Approved',
    approvedAt: new Date().toISOString().split('T')[0],
  });
}

// ── Content Calendar ──────────────────────────────────────────────────────────

export async function createCalendarEntry(data: Omit<CalendarEntry, 'id'>): Promise<CalendarEntry> {
  const r = await base(T.CALENDAR).create(stripUndefined({
    'Content Piece':  data.contentPieceId ? [data.contentPieceId] : undefined,
    'Campaign':       data.campaignId ? [data.campaignId] : undefined,
    'Platform':       data.platform,
    'Scheduled Date': data.scheduledDate,
    'Asset URL':      data.assetUrl,
    'Asset Type':     data.assetType,
    'Publish Status': data.publishStatus ?? 'Queued',
  }));
  return { id: r.id, ...(r.fields as any) };
}

export async function getCalendarEntries(campaignId: string): Promise<CalendarEntry[]> {
  const records: CalendarEntry[] = [];
  await base(T.CALENDAR)
    .select({ filterByFormula: `FIND("${campaignId}", ARRAYJOIN({Campaign}))`, sort: [{ field: 'Scheduled Date', direction: 'asc' }] })
    .eachPage((recs, next) => {
      recs.forEach(r => records.push({ id: r.id, ...(r.fields as any) }));
      next();
    });
  return records;
}

export async function updateCalendarEntry(id: string, data: Partial<CalendarEntry>): Promise<CalendarEntry> {
  const r = await base(T.CALENDAR).update(id, stripUndefined({
    'Blotato Post ID': data.blobataPostId,
    'Publish Status':  data.publishStatus,
    'Published At':    data.publishedAt,
    'Engagement Data': data.engagementData,
  }));
  return { id: r.id, ...(r.fields as any) };
}

// ── Generation Jobs (Airtable mirror of Supabase) ─────────────────────────────

export async function createAirtableJob(data: Omit<AirtableJob, 'id'>): Promise<AirtableJob> {
  const r = await base(T.JOBS).create(stripUndefined({
    'Campaign':          [data.campaignId],
    'Content Piece':     [data.contentPieceId],
    'Job Type':          data.jobType,
    'Platform Spec Key': data.platformSpecKey,
    'Status':            data.status,
    'Started At':        new Date().toISOString(),
  }));
  return { id: r.id, ...(r.fields as any) };
}

export async function updateAirtableJob(id: string, data: Partial<AirtableJob>): Promise<AirtableJob> {
  const r = await base(T.JOBS).update(id, stripUndefined({
    'Status':       data.status,
    'Asset URL':    data.assetUrl,
    'Error Message': data.errorMessage,
    'Completed At': data.completedAt ?? (data.status === 'Done' || data.status === 'Failed' ? new Date().toISOString() : undefined),
  }));
  return { id: r.id, ...(r.fields as any) };
}
