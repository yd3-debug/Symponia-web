// Symponia Marketing — Content Generator
// Reads animal archetypes directly from the app source
// Generates social media content using Claude
//
// Usage:
//   npx ts-node scripts/generate-content.ts --type daily
//   npx ts-node scripts/generate-content.ts --type animal --animal wolf
//   npx ts-node scripts/generate-content.ts --type shadow --animal snake

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// ── Read animal archetypes directly from the app ──────────────────────────────
// This is the single source of truth — no duplication
const APP_SYSTEM_PROMPT_PATH = path.join(
  __dirname, '../../Symponia/supabase/functions/oracle/systemPrompt.ts'
);

function extractArchetypes(): Record<string, { gift: string; shadow: string; path: string }> {
  const source = fs.readFileSync(APP_SYSTEM_PROMPT_PATH, 'utf-8');
  // Parse the ANIMAL_ARCHETYPES object from the TypeScript source
  const match = source.match(/export const ANIMAL_ARCHETYPES[^=]+=\s*(\{[\s\S]*?\n\}\s*;)/);
  if (!match) throw new Error('Could not parse ANIMAL_ARCHETYPES from app source');
  // Safe eval in Node context — this is our own source file
  const cleaned = match[1]
    .replace(/\/\/[^\n]*/g, '') // remove comments
    .replace(/(\w+):/g, '"$1":') // quote keys
    .replace(/'/g, '"'); // single to double quotes
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Could not parse archetypes — check systemPrompt.ts format');
  }
}

// ── Read brand voice ──────────────────────────────────────────────────────────
const brandVoice = fs.readFileSync(
  path.join(__dirname, '../knowledge/brand-voice.md'), 'utf-8'
);

// ── Claude client ─────────────────────────────────────────────────────────────
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateDailyQuote() {
  const prompt = fs.readFileSync(
    path.join(__dirname, '../prompts/daily-quote.md'), 'utf-8'
  );

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: `${prompt.split('## System')[1].split('## User')[0].trim()}\n\nBrand voice:\n${brandVoice}`,
    messages: [{ role: 'user', content: 'Generate today\'s daily quote.' }],
  });

  return (response.content[0] as any).text;
}

async function generateAnimalPost(animalName: string, type: 'archetype' | 'shadow') {
  const archetypes = extractArchetypes();
  const key = animalName.toLowerCase();
  const data = archetypes[key];

  if (!data) {
    throw new Error(`Animal "${animalName}" not found. Available: ${Object.keys(archetypes).join(', ')}`);
  }

  const promptFile = type === 'shadow' ? 'shadow-animal-hook.md' : 'animal-archetype-post.md';
  const promptTemplate = fs.readFileSync(
    path.join(__dirname, '../prompts', promptFile), 'utf-8'
  );

  const systemPrompt = promptTemplate.split('## System')[1].split('## User')[0].trim();
  const userPrompt = promptTemplate.split('## User Prompt')[1].trim()
    .replace('{{ANIMAL_NAME}}', animalName)
    .replace('{{GIFT}}', data.gift)
    .replace('{{SHADOW}}', data.shadow)
    .replace('{{SHADOW_DESCRIPTION}}', data.shadow)
    .replace('{{PATH}}', data.path);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: `${systemPrompt}\n\nBrand voice:\n${brandVoice}`,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return (response.content[0] as any).text;
}

// ── Output ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const typeIdx = args.indexOf('--type');
  const animalIdx = args.indexOf('--animal');

  const type = typeIdx !== -1 ? args[typeIdx + 1] : 'daily';
  const animal = animalIdx !== -1 ? args[animalIdx + 1] : null;

  console.log(`\n── Symponia Marketing · Generating ${type} content ──\n`);

  let result = '';

  if (type === 'daily') {
    result = await generateDailyQuote();
  } else if (type === 'animal' && animal) {
    result = await generateAnimalPost(animal, 'archetype');
  } else if (type === 'shadow' && animal) {
    result = await generateAnimalPost(animal, 'shadow');
  } else {
    console.log('Usage:');
    console.log('  npx ts-node scripts/generate-content.ts --type daily');
    console.log('  npx ts-node scripts/generate-content.ts --type animal --animal wolf');
    console.log('  npx ts-node scripts/generate-content.ts --type shadow --animal snake');
    process.exit(1);
  }

  console.log(result);

  // Save to output file
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const filename = `${type}-${animal ?? 'quote'}-${Date.now()}.txt`;
  fs.writeFileSync(path.join(outputDir, filename), result);
  console.log(`\n── Saved to output/${filename} ──`);
}

main().catch(console.error);
