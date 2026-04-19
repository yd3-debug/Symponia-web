// ── Supabase Client ────────────────────────────────────────────────────────────
// Browser client for components, server client for API routes.
// Realtime enabled on generation_jobs table.

import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  clerk_id: string;
  email: string;
  created_at: string;
}

export interface GenerationJob {
  id: string;
  user_id: string;
  campaign_id: string;
  content_piece_id: string;
  job_type: 'image' | 'video';
  platform_spec_key: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  asset_url: string | null;
  kie_task_id: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: { Row: DbUser; Insert: Omit<DbUser, 'id' | 'created_at'>; Update: Partial<DbUser> };
      generation_jobs: { Row: GenerationJob; Insert: Omit<GenerationJob, 'id' | 'created_at' | 'updated_at'>; Update: Partial<GenerationJob> };
    };
  };
};

// ── Browser client (used in Client Components) ─────────────────────────────────

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ── Server client (used in API routes / Server Components) ────────────────────

export function createSupabaseServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// ── Generation job helpers ─────────────────────────────────────────────────────

export async function createGenerationJob(
  job: Omit<GenerationJob, 'id' | 'created_at' | 'updated_at' | 'asset_url' | 'kie_task_id' | 'error'>,
): Promise<GenerationJob> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('generation_jobs')
    .insert({ ...job, status: 'queued', asset_url: null, kie_task_id: null, error: null })
    .select()
    .single();
  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
  return data as GenerationJob;
}

export async function updateJobStatus(
  id: string,
  updates: { status: GenerationJob['status']; asset_url?: string; error?: string },
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('generation_jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Supabase update failed: ${error.message}`);
}

export async function getJobsByContentPiece(contentPieceId: string): Promise<GenerationJob[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('content_piece_id', contentPieceId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`Supabase query failed: ${error.message}`);
  return (data ?? []) as GenerationJob[];
}

// ── Storage helpers ────────────────────────────────────────────────────────────

export async function uploadToStorage(
  bucket: 'reference-images' | 'generated-images' | 'generated-videos',
  path: string,
  file: Buffer | Blob,
  contentType: string,
): Promise<string> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
