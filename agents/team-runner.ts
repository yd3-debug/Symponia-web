#!/usr/bin/env ts-node
// ── Marketing Team Runner ─────────────────────────────────────────────────────
// Orchestrates all 3 agents. Runs them together or individually.
//
// Usage:
//   npm run team                         → run all 3 agents (auto mode)
//   npm run team -- --platform=instagram → Instagram only
//   npm run team -- --platform=tiktok    → TikTok only
//   npm run team -- --platform=linkedin  → LinkedIn only
//   npm run team -- --topic="shadow wolf" → all agents focused on this topic
//   npm run team -- --platform=instagram --type=reel --topic="wolf shadow"

import { instagramPipeline } from './instagram-agent';
import { tiktokPipeline }    from './tiktok-agent';
import { linkedinPipeline }  from './linkedin-agent';

type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'all';

interface RunOptions {
  platform: Platform;
  type?:    string;
  topic?:   string;
}

function parseArgs(): RunOptions {
  const args = process.argv.slice(2);
  const get  = (flag: string) => args.find(a => a.startsWith(`--${flag}=`))?.split('=').slice(1).join('=');

  return {
    platform: (get('platform') as Platform) ?? 'all',
    type:     get('type'),
    topic:    get('topic'),
  };
}

async function runAgent(platform: Exclude<Platform, 'all'>, opts: RunOptions): Promise<void> {
  const label = platform.charAt(0).toUpperCase() + platform.slice(1);
  const separator = '─'.repeat(52);

  console.log(`\n${separator}`);
  console.log(`   ◈  ${label} Agent`);
  console.log(separator);

  try {
    let id: string;

    switch (platform) {
      case 'instagram':
        id = await instagramPipeline(opts.type as any, opts.topic);
        break;
      case 'tiktok':
        id = await tiktokPipeline(opts.type as any, opts.topic);
        break;
      case 'linkedin':
        id = await linkedinPipeline(opts.type as any, opts.topic);
        break;
    }

    console.log(`\n   ✓  ${label} done → Airtable: ${id!}`);
  } catch (err) {
    console.error(`\n   ✗  ${label} failed:`, (err as Error).message);
  }
}

async function main() {
  const opts = parseArgs();

  console.log('\n◈  Symponia Marketing Team');
  console.log('═'.repeat(52));
  if (opts.topic)    console.log(`   Topic:    ${opts.topic}`);
  if (opts.type)     console.log(`   Type:     ${opts.type}`);
  if (opts.platform) console.log(`   Platform: ${opts.platform}`);
  console.log('');

  const platforms: Exclude<Platform, 'all'>[] =
    opts.platform === 'all'
      ? ['instagram', 'tiktok', 'linkedin']
      : [opts.platform as Exclude<Platform, 'all'>];

  // Run sequentially to avoid API rate limits
  for (const platform of platforms) {
    await runAgent(platform, opts);
    // Small pause between agents when running all
    if (platforms.length > 1) await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n' + '═'.repeat(52));
  console.log('   ✓  All agents complete.');
  console.log('   → Open your dashboard to review and approve content.\n');
}

main().catch(console.error);
