// ── Base Agent ────────────────────────────────────────────────────────────────
// Shared Claude API logic for all platform agents

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ContentOutput {
  platform: string;
  contentType: string;
  hook: string;
  caption: string;
  hashtags?: string;
  script?: string;
  slides?: string[];
  firstComment?: string;
  visualPrompt: string;
  soundSuggestion?: string;
  textOverlays?: string[];
  trendReference: string;
  seriesPotential?: boolean;
  viralScore: number;
  notes: string;
  post?: string;          // LinkedIn full post text
  postingNote?: string;   // LinkedIn posting strategy note
}

export function loadPrompt(filename: string): string {
  return fs.readFileSync(path.join(__dirname, '..', 'prompts', filename), 'utf8');
}

// Load Symponia brand knowledge
export function loadBrandContext(): string {
  const brandVoice   = fs.readFileSync(path.join(__dirname, '..', 'knowledge', 'brand-voice.md'), 'utf8');
  const appDesc      = fs.readFileSync(path.join(__dirname, '..', 'knowledge', 'app-store-description.md'), 'utf8');
  return `${brandVoice}\n\n---\n\n${appDesc}`;
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  model: string = 'claude-sonnet-4-6'
): Promise<string> {
  const msg = await claude.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  return (msg.content[0] as any).text;
}

export function parseJsonOutput(raw: string): ContentOutput {
  // Extract JSON from Claude's response (handles markdown code blocks)
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ?? raw.match(/(\{[\s\S]*\})/);
  const jsonStr = match ? match[1].trim() : raw.trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse agent JSON output.\n\nRaw output:\n${raw}`);
  }
}
