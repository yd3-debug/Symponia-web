// ── Shadow Agent ───────────────────────────────────────────────────────────────
// Generates the "invisible" work that makes content perform:
// alternative hooks, CTA variants, engagement bait, posting strategy, hashtag tiers.

import Anthropic from '@anthropic-ai/sdk';
import type { Campaign } from '@/lib/airtable';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ShadowWork {
  alternativeHooks:  string[];
  ctaVariants:       string[];
  engagementBait:    string[];
  patternInterrupts: string[];
  bestPostTime:      string;
  hashtagStrategy: {
    primary:  string[];
    niche:    string[];
    trending: string[];
  };
  abTestNotes: string;
}

export async function runShadowAgent(
  campaign: Campaign,
  platform: string,
  contentBody: string,
): Promise<ShadowWork> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: `You are a shadow work specialist for social media marketing.
Shadow work = the hidden optimization layer that makes content actually perform.
You generate: alternative hooks for A/B testing, CTA variants, engagement bait questions,
pattern interrupts that stop thumbs, and platform-native hashtag strategy.
Return ONLY valid JSON. Be specific, punchy, and never generic.`,
    messages: [{
      role: 'user',
      content: `Campaign: ${campaign.brandName} | ${campaign.productOrService}
Audience: ${campaign.targetAudience}
Platform: ${platform}
Tone: ${campaign.tone}
Content preview: ${contentBody.slice(0, 400)}

Generate shadow work for this content piece. Return JSON:
{
  "alternativeHooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "ctaVariants": ["cta1 (soft)", "cta2 (medium)", "cta3 (direct)"],
  "engagementBait": ["question1 that makes people reply", "question2", "question3"],
  "patternInterrupts": ["interrupt1 — stops thumbs cold", "interrupt2", "interrupt3"],
  "bestPostTime": "e.g. Tuesday 7–9pm — when this audience is off work and doom-scrolling",
  "hashtagStrategy": {
    "primary": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "niche": ["#niche1", "#niche2", "#niche3", "#niche4", "#niche5"],
    "trending": ["#trend1", "#trend2", "#trend3"]
  },
  "abTestNotes": "One sentence on what to split-test first and why."
}`,
    }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Shadow agent returned invalid JSON');
  return JSON.parse(match[0]) as ShadowWork;
}
