'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// ── Theme ─────────────────────────────────────────────────────────────────────
const LIGHT = {
  bg:           '#f8f8fb',
  bgMid:        '#ffffff',
  bgCard:       '#ffffff',
  bgCardHover:  '#f4f3f9',
  bgActive:     '#ede9fb',
  fg:           '#1a1826',
  sub:          '#4a4460',
  dim:          '#8880a8',
  border:       'rgba(0,0,0,0.08)',
  borderMid:    'rgba(0,0,0,0.12)',
  borderStrong: 'rgba(0,0,0,0.18)',
  shadow:       '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
  cyan:         '#0ea5a0',
  violet:       '#7c3aed',
  pink:         '#db2777',
  green:        '#16a34a',
  orange:       '#ea580c',
  red:          '#dc2626',
  teal:         '#2563eb',
  yellow:       '#d97706',
  mono:         "'JetBrains Mono', 'Fira Code', monospace",
  body:         "'Inter', 'Helvetica Neue', system-ui, sans-serif",
};

const DARK = {
  bg:           '#07051a',
  bgMid:        '#0d0b22',
  bgCard:       'rgba(255,255,255,0.035)',
  bgCardHover:  'rgba(255,255,255,0.06)',
  bgActive:     'rgba(167,139,250,0.08)',
  fg:           '#eae6f8',
  sub:          '#b8b0d8',
  dim:          '#7c70a8',
  border:       'rgba(255,255,255,0.07)',
  borderMid:    'rgba(255,255,255,0.11)',
  borderStrong: 'rgba(255,255,255,0.18)',
  shadow:       '0 1px 3px rgba(0,0,0,0.4)',
  cyan:         '#5ce8d0',
  violet:       '#a78bfa',
  pink:         '#e879a0',
  green:        '#4ade80',
  orange:       '#fb923c',
  red:          '#f87171',
  teal:         '#5b8df0',
  yellow:       '#fbbf24',
  mono:         "'JetBrains Mono', 'Fira Code', monospace",
  body:         "'Inter', 'Helvetica Neue', system-ui, sans-serif",
};

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: 'orchestrator', name: 'Orchestrator', role: 'Marketing Director', icon: '◈',
    skills: ['Campaign Strategy', 'Agent Routing', 'Quality Control', 'Brief Writing', 'Brand Voice'],
    description: 'Reads your command, routes to the right agents, reviews all output before it reaches the queue. Nothing ships without sign-off.',
  },
  {
    id: 'instagram', name: 'Instagram', role: 'Platform Specialist', icon: '◎',
    skills: ['Carousel Narratives', 'Reels Hooks', 'Hashtag Research', 'Caption Formulas', 'Collab Strategy'],
    description: 'Carousel arcs, Reels scripts with 3-sec hooks, optimal hashtag sets (3–8 niche tags), and algorithm-first caption formulas.',
  },
  {
    id: 'tiktok', name: 'TikTok', role: 'Viral Specialist', icon: '▶',
    skills: ['3-sec Hook Formulas', 'Sound Strategy', 'Caption SEO', 'Duet/Stitch', 'Comment Bait'],
    description: 'Pattern-interrupt hooks, trending sound recommendations, TikTok search optimisation, and series formats built for completion rate.',
  },
  {
    id: 'linkedin', name: 'LinkedIn', role: 'Thought Leader', icon: '◻',
    skills: ['Thought Leadership', 'Hook Line Formula', 'Document Carousels', 'B2B Positioning', 'Dwell-time Copy'],
    description: '210-char hooks before "...more", no-link-in-body strategy, PDF carousels, and professional storytelling that builds authority.',
  },
  {
    id: 'video', name: 'Video Editor', role: 'Clip Architect', icon: '▣',
    skills: ['Scene Breakdown', 'FFmpeg Pipeline', 'B-roll Direction', 'Text Overlays', 'Kie.ai Prompts'],
    description: 'Breaks scripts into scenes, generates clips via Kie.ai, stitches them with FFmpeg. Outputs vertical 1080×1920 for Reels/TikTok.',
  },
  {
    id: 'copywriter', name: 'Copywriter', role: 'Word Strategist', icon: '✦',
    skills: ['Hook Writing', 'Power Words', 'CTA Optimisation', 'A/B Variants', 'Tone Adaptation'],
    description: "Multi-format copy across platforms. Adapts Symponia's philosophical tone — mystical but grounded — for each audience.",
  },
  {
    id: 'trends', name: 'Trend Researcher', role: 'Signal Hunter', icon: '◉',
    skills: ['Reddit Scraping', 'YouTube Trending', 'Google Trends', 'Virality Prediction', 'Timing Windows'],
    description: "No API keys needed. Scrapes Reddit, YouTube, and Google Trends to find what's gaining momentum in the niche right now.",
  },
  {
    id: 'visual', name: 'Visual Director', role: 'Aesthetic Lead', icon: '◆',
    skills: ['Brand Consistency', 'Kie.ai Prompting', 'Composition Rules', 'Platform Specs', 'Style Cohesion'],
    description: "Writes Kie.ai prompts that match Symponia's dark-mystical aesthetic. Reviews every visual for brand alignment before approval.",
  },
];

const STATUS_COLOR_LIGHT: Record<string, string> = {
  review: '#ea580c', approved: '#16a34a', scheduled: '#2563eb',
  posted: '#7c3aed', draft: '#8880a8', generating: '#0ea5a0', rejected: '#dc2626',
};
const STATUS_COLOR_DARK: Record<string, string> = {
  review: '#fb923c', approved: '#4ade80', scheduled: '#5b8df0',
  posted: '#a78bfa', draft: '#7c70a8', generating: '#5ce8d0', rejected: '#f87171',
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: '◎', tiktok: '▶', linkedin: '◻',
};

// ── Algorithm-optimal posting windows ────────────────────────────────────────
// Based on 2025/2026 platform algorithm signals baked into our agents
type TimeSlot = { label: string; day: number; hour: number; minute: number; reason: string };
const OPTIMAL_TIMES: Record<string, TimeSlot[]> = {
  instagram: [
    { label: 'Tue 9:00 AM',  day: 2, hour: 9,  minute: 0,  reason: 'Highest DM-share window — 3-5× engagement boost' },
    { label: 'Wed 11:00 AM', day: 3, hour: 11, minute: 0,  reason: 'Mid-week Explore push — max Reels reach' },
    { label: 'Fri 7:00 PM',  day: 5, hour: 19, minute: 0,  reason: 'Weekend wind-down — carousel saves spike 40%' },
    { label: 'Sun 9:00 AM',  day: 0, hour: 9,  minute: 0,  reason: 'Spiritual content peaks Sunday morning' },
  ],
  tiktok: [
    { label: 'Tue 9:00 AM',  day: 2, hour: 9,  minute: 0,  reason: 'Pre-work scroll — highest completion rate window' },
    { label: 'Thu 12:00 PM', day: 4, hour: 12, minute: 0,  reason: 'Lunch break FYP — peak distribution velocity' },
    { label: 'Fri 7:00 PM',  day: 5, hour: 19, minute: 0,  reason: 'Weekend start — viral momentum highest' },
    { label: 'Sat 11:00 AM', day: 6, hour: 11, minute: 0,  reason: 'Weekend browsing peak for niche content' },
  ],
  linkedin: [
    { label: 'Tue 8:00 AM',  day: 2, hour: 8,  minute: 0,  reason: 'Pre-meeting scroll — dwell time at peak' },
    { label: 'Wed 12:00 PM', day: 3, hour: 12, minute: 0,  reason: 'Lunch hour — B2B content engagement high' },
    { label: 'Thu 8:00 AM',  day: 4, hour: 8,  minute: 0,  reason: '360Brew AI rewards Thu consistency' },
    { label: 'Sun 7:00 PM',  day: 0, hour: 19, minute: 0,  reason: 'Sunday prep mindset — thought leadership peak' },
  ],
};

// ── Visual AI model library — 28 models ──────────────────────────────────────
const MODEL_LIBRARY = [
  // ── IMAGE MODELS ──
  { id: 'flux-pro',        type: 'image' as const, name: 'FLUX.1 Pro',           provider: 'Black Forest Labs', tagline: 'Hyper-realistic · Studio-grade detail',         description: 'The gold standard for photorealistic AI imagery. Exceptional at human faces, textures, and dramatic lighting. Industry default for editorial-quality visuals.', bestFor: ['Portraits','Cinematic stills','Dark aesthetic','Reels covers'], speed: 'medium' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&q=85&fit=crop' },
  { id: 'flux-dev',        type: 'image' as const, name: 'FLUX.1 Dev',            provider: 'Black Forest Labs', tagline: 'Fast · Open-weight · Creative freedom',          description: 'Open-weight sibling of FLUX Pro — 2× faster, slightly softer. Great for high-volume drafting and iterating quickly on creative concepts.', bestFor: ['Quick iterations','Concept drafts','High volume','Abstract'], speed: 'fast' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=480&q=85&fit=crop' },
  { id: 'flux-schnell',    type: 'image' as const, name: 'FLUX.1 Schnell',        provider: 'Black Forest Labs', tagline: 'Ultra-fast · Instant preview · 4-step gen',       description: 'Distilled 4-step model — generates in under 2 seconds. Perfect for real-time previews and rapid A/B testing before committing to full quality.', bestFor: ['Instant preview','A/B testing','Bulk drafts','Mockups'], speed: 'fast' as const, quality: 3, sample: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=480&q=85&fit=crop' },
  { id: 'seedream-2',      type: 'image' as const, name: 'SeaDream 2',            provider: 'ByteDance',         tagline: 'Dreamlike · Painterly · Cinematic depth',        description: 'ByteDance flagship. Exceptional dreamlike compositions with rich colour depth and painterly quality. Perfect fit for Symponia\'s mystical dark aesthetic.', bestFor: ['Mystical scenes','Painterly art','Surreal','Carousels'], speed: 'medium' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=480&q=85&fit=crop' },
  { id: 'ideogram-v3',     type: 'image' as const, name: 'Ideogram v3',           provider: 'Ideogram',          tagline: 'Text in images · Typography-aware · Design',     description: 'Best-in-class for generating images with legible text overlays and graphic design elements. Use when visuals need words or typographic elements baked in.', bestFor: ['Quote cards','Text overlays','Slide graphics','Branded'], speed: 'fast' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=480&q=85&fit=crop' },
  { id: 'recraft-v3',      type: 'image' as const, name: 'Recraft v3',            provider: 'Recraft',           tagline: 'Vector-clean · Brand-consistent · Illustration', description: 'Purpose-built for brand assets. Clean, scalable visuals with consistent style — ideal for carousel slide art and infographic-style content.', bestFor: ['Illustration','Brand assets','Consistent style','Carousels'], speed: 'fast' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&q=85&fit=crop' },
  { id: 'midjourney-style',type: 'image' as const, name: 'Midjourney Aesthetic',  provider: 'MJ-style finetune', tagline: 'Artistic · Rich textures · MJ aesthetic',        description: 'Fine-tuned to reproduce Midjourney\'s signature aesthetic — rich textures, dramatic composition, elevated painterly realism. Great for premium editorial looks.', bestFor: ['Artistic editorial','Rich textures','Premium look','Dark themes'], speed: 'medium' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=480&q=85&fit=crop' },
  { id: 'dalle3',          type: 'image' as const, name: 'DALL-E 3',              provider: 'OpenAI',            tagline: 'Prompt-adherent · Clean · Versatile',            description: 'Follows complex prompts with exceptional accuracy. Best-in-class for conceptual scenes that need to precisely match the brief. Very consistent output quality.', bestFor: ['Conceptual scenes','Precise prompts','Concept art','Clean visuals'], speed: 'fast' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=480&q=85&fit=crop' },
  { id: 'imagen3',         type: 'image' as const, name: 'Imagen 3',              provider: 'Google DeepMind',   tagline: 'Photorealistic · Detail-rich · Google-quality',  description: 'Google DeepMind\'s flagship image model. Outstanding photorealism with exceptional fine detail in textures, lighting, and depth. Strong for product and nature shots.', bestFor: ['Photorealism','Fine detail','Nature','Landscape'], speed: 'medium' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=480&q=85&fit=crop' },
  { id: 'aurora',          type: 'image' as const, name: 'Aurora',                provider: 'xAI',               tagline: 'Grok-native · Cinematic · High contrast',        description: 'xAI\'s image model — dramatic high-contrast aesthetic with a distinctly cinematic feel. Strong at mysterious, dark, and powerful imagery.', bestFor: ['High contrast','Dramatic','Dark themes','Cinematic'], speed: 'fast' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&q=85&fit=crop' },
  { id: 'playground-v3',   type: 'image' as const, name: 'Playground v3',         provider: 'Playground AI',     tagline: 'Design-focused · Aesthetic · UI-grade visuals',  description: 'Designed for design professionals. Exceptional colour harmony, composition awareness, and aesthetic sensitivity. Great for marketing visuals and social content.', bestFor: ['Marketing visuals','Aesthetic','Colour harmony','Social media'], speed: 'fast' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&q=85&fit=crop' },
  { id: 'leonardo-phoenix',type: 'image' as const, name: 'Leonardo Phoenix',       provider: 'Leonardo AI',       tagline: 'Creative · Character-strong · Concept art',      description: 'Leonardo\'s most advanced model. Strong character design, concept art aesthetics, and dynamic compositions. Great for spiritual and mythological themed imagery.', bestFor: ['Character design','Concept art','Mythological','Fantasy'], speed: 'medium' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=480&q=85&fit=crop' },
  { id: 'adobe-firefly3',  type: 'image' as const, name: 'Adobe Firefly 3',       provider: 'Adobe',             tagline: 'Commercially safe · Brand-clean · Stock-grade',  description: 'Trained entirely on licensed content — 100% commercially safe output. Adobe\'s best model for clean, professional brand visuals without IP concerns.', bestFor: ['Brand-safe','Commercial use','Clean aesthetic','Professional'], speed: 'fast' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&q=85&fit=crop' },
  { id: 'sd35',            type: 'image' as const, name: 'Stable Diffusion 3.5',  provider: 'Stability AI',      tagline: 'Versatile · Open · Community fine-tunes',        description: 'Latest Stability AI foundation model. Good all-rounder for artistic and abstract work, especially powerful when using community fine-tunes for specific aesthetics.', bestFor: ['Artistic','Abstract','Fine-tuned','Experimental'], speed: 'fast' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=480&q=85&fit=crop' },
  { id: 'juggernaut-xl',   type: 'image' as const, name: 'Juggernaut XL',         provider: 'RunDiffusion',      tagline: 'Photorealistic people · Skin detail · Portrait',  description: 'Fine-tuned SDXL model with exceptional human likeness and skin texture rendering. Go-to when the content features real-looking people or faces.', bestFor: ['Human portraits','Skin texture','Realistic people','Lifestyle'], speed: 'medium' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=480&q=85&fit=crop' },
  // ── VIDEO MODELS ──
  { id: 'kling-2-master',  type: 'video' as const, name: 'Kling 2.0 Master',      provider: 'Kuaishou',          tagline: 'Best-in-class motion · Cinematic physics',       description: 'Kling\'s most advanced model. Smooth cinematic camera movement, realistic physics simulation, and exceptional subject consistency across 10-second clips.', bestFor: ['Cinematic hero','Camera moves','Physics sim','Brand hero'], speed: 'slow' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=480&q=85&fit=crop' },
  { id: 'kling-pro',       type: 'video' as const, name: 'Kling 1.6 Pro',         provider: 'Kuaishou',          tagline: 'Cinematic motion · 10s clips · Reliable',        description: 'Proven, reliable video generation with smooth camera moves and strong quality. The go-to for Reels and TikTok hero clips with a cinematic look.', bestFor: ['Reels','TikTok hero','Cinematic scenes','Abstract'], speed: 'slow' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=480&q=85&fit=crop' },
  { id: 'wan-pro',         type: 'video' as const, name: 'Wan 2.1 Pro',           provider: 'Alibaba',           tagline: 'Fast video · Strong motion · Open-source',       description: 'Alibaba\'s flagship open-source video model. Excellent motion quality at faster speeds. Strong for abstract and concept animations.', bestFor: ['Abstract motion','Fast turnaround','Concept clips','B-roll'], speed: 'medium' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=480&q=85&fit=crop' },
  { id: 'hailuo',          type: 'video' as const, name: 'Hailuo v2',             provider: 'MiniMax',           tagline: 'Character-consistent · Stylised · Smooth',       description: 'Strong character consistency across frames with a distinctive stylised aesthetic. Well-suited for narrative-driven clips and Symponia\'s mystical visual language.', bestFor: ['Characters','Mystical','Storytelling','TikTok'], speed: 'medium' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=480&q=85&fit=crop' },
  { id: 'veo3',            type: 'video' as const, name: 'Veo 3',                 provider: 'Google DeepMind',   tagline: 'Photorealistic · Audio-native · 4K quality',     description: 'Google\'s state-of-the-art video model with native audio generation. Produces photorealistic clips with natural sound — ideal for premium ad-quality content.', bestFor: ['Photorealism','Native audio','Premium ads','Full realism'], speed: 'slow' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=480&q=85&fit=crop' },
  { id: 'sora',            type: 'video' as const, name: 'Sora',                  provider: 'OpenAI',            tagline: 'Long-form · Scene coherent · Cinematic',         description: 'OpenAI\'s video model — exceptional scene coherence for longer clips. Strong physical simulation, diverse environments, and cinematic quality storytelling.', bestFor: ['Long-form','Scene coherence','Physical sim','Storytelling'], speed: 'slow' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&q=85&fit=crop' },
  { id: 'dream-machine',   type: 'video' as const, name: 'Dream Machine',         provider: 'Luma AI',           tagline: 'Smooth motion · Dreamlike · Creative',           description: 'Luma AI\'s model known for silky smooth motion and dreamlike transitions. Excellent for abstract, ambient, and mood-driven visuals with an otherworldly feel.', bestFor: ['Smooth motion','Abstract','Ambient','Mood visuals'], speed: 'medium' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=480&q=85&fit=crop' },
  { id: 'runway-gen4',     type: 'video' as const, name: 'Runway Gen-4',          provider: 'Runway',            tagline: 'Consistent subjects · Director-quality · Pro',   description: 'Runway\'s flagship model. Industry-leading subject consistency across scenes, director-quality camera language, and professional editing capabilities baked in.', bestFor: ['Subject consistency','Director quality','VFX','Professional'], speed: 'slow' as const, quality: 5, sample: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=480&q=85&fit=crop' },
  { id: 'pika-22',         type: 'video' as const, name: 'Pika 2.2',              provider: 'Pika Labs',         tagline: 'Dynamic effects · Explode/grow FX · Creative',   description: 'Pika\'s latest model with signature generative effects — explode, grow, squish. Great for eye-catching social content with dramatic visual moments.', bestFor: ['Visual FX','Dynamic effects','Social hook','Viral potential'], speed: 'fast' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=480&q=85&fit=crop' },
  { id: 'cogvideox',       type: 'video' as const, name: 'CogVideoX-5B',          provider: 'Zhipu AI',          tagline: 'Open-source · Text-to-video · Research-grade',   description: 'Open-source video model with strong text-to-video capability. Good for experimental content and when you want full control over generation parameters.', bestFor: ['Experimental','Open-source','Custom params','B-roll'], speed: 'medium' as const, quality: 3, sample: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=480&q=85&fit=crop' },
  { id: 'mochi',           type: 'video' as const, name: 'Mochi 1',               provider: 'Genmo',             tagline: 'Fluid motion · Open-source · Smooth transitions', description: 'Open-source model specialised in extremely fluid motion and natural-looking transitions. Particularly strong at smooth camera pans and organic movement.', bestFor: ['Fluid motion','Camera pans','Organic movement','Ambient'], speed: 'medium' as const, quality: 4, sample: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&q=85&fit=crop' },
  { id: 'ltx-video',       type: 'video' as const, name: 'LTX Video',             provider: 'Lightricks',        tagline: 'Real-time · Fastest video gen · Interactive',    description: 'World\'s first real-time video generation model. Generates at video frame rate — ideal for rapid previewing and interactive content creation workflows.', bestFor: ['Real-time preview','Rapid iteration','Interactive','Bulk gen'], speed: 'fast' as const, quality: 3, sample: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=480&q=85&fit=crop' },
  { id: 'stable-video',    type: 'video' as const, name: 'Stable Video Diffusion',provider: 'Stability AI',      tagline: 'Image-to-video · Animate stills · Open',         description: 'Animates existing images into short video clips. Use to bring Symponia\'s generated stills to life — turn a striking image into a looping Reels or TikTok asset.', bestFor: ['Animate stills','Image-to-video','Looping','Reels'], speed: 'medium' as const, quality: 3, sample: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=480&q=85&fit=crop' },
] as const;

type ModelId = typeof MODEL_LIBRARY[number]['id'];
type ModelType = 'image' | 'video';

// ── Visual style options ──────────────────────────────────────────────────────
const VISUAL_STYLES = [
  { id: 'dark-mystical',  label: 'Dark Mystical',  desc: 'Deep shadows, violet glow, sacred geometry — Symponia signature',    emoji: '🌑' },
  { id: 'cinematic-real', label: 'Cinematic Real',  desc: 'Photorealistic, dramatic lighting, editorial quality',                emoji: '📷' },
  { id: 'illustrated',    label: 'Illustrated',     desc: 'Digital art, painterly strokes, hand-crafted feel',                   emoji: '🎨' },
  { id: 'minimal-clean',  label: 'Minimal Clean',   desc: 'White space, bold typography, no-noise aesthetic',                    emoji: '◻' },
  { id: 'cosmic-surreal', label: 'Cosmic Surreal',  desc: 'Dreamlike, otherworldly, celestial and cosmic elements',              emoji: '✦' },
  { id: 'none',           label: 'Let AI decide',   desc: 'Visual Director chooses the best style for the content',              emoji: '◈' },
] as const;
type VisualStyleId = typeof VISUAL_STYLES[number]['id'];

function nextOccurrence(dayOfWeek: number, hour: number, minute: number): string {
  const now = new Date();
  const result = new Date(now);
  const diff = (dayOfWeek - now.getDay() + 7) % 7 || 7; // next occurrence (not today unless it's still upcoming)
  result.setDate(now.getDate() + diff);
  result.setHours(hour, minute, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${result.getFullYear()}-${pad(result.getMonth() + 1)}-${pad(result.getDate())}T${pad(hour)}:${pad(minute)}`;
}

const F = {
  platform:     'Platform',
  contentType:  'Content Type',
  hook:         'Hook',
  caption:      'Caption',
  hashtags:     'Hashtags',
  script:       'Script',
  slides:       'Slides',
  visualPrompt: 'Visual Prompt',
  visualUrl:    'Visual URL',
  status:       'Status',
  scheduledAt:  'Scheduled At',
  viralScore:   'Viral Score',
  managerScore: 'Manager Score',
  notes:        'Manager Notes',
  topic:        'Topic',
};

type Tab      = 'queue' | 'brief' | 'research' | 'models' | 'agents' | 'calendar';

interface ResearchIdea {
  title: string;
  hook: string;
  format: string;
  pillar: string;
  emotionalTrigger?: string;
  whyItWorks: string;
}
interface ResearchResult {
  ok: boolean;
  cached?: boolean;
  platform: string;
  topic: string;
  command?: string;
  trendingAngle: string;
  timingWindow: string;
  hashtags: string;
  topRedditTitles: string[];
  topPerplexityTitles?: string[];
  topNewsTitles?: string[];
  topHNTitles?: string[];
  topSubreddits: string[];
  avgVelocity: number;
  rankedPostCount: number;
  totalSources?: number;
  searchQuery?: string;
  summary?: string;
  bestFormat?: string;
  trendStatus?: string;
  hookPatterns?: string[];
  emotionalTrigger?: string;
  contentGap?: string;
  competitorBlindSpot?: string;
  viralMechanism?: string;
  winningFormat?: string;
  topAngles?: string[];
  ideas?: ResearchIdea[];
  algoTopSignals: string;
  algoFormatWinner: string;
  algoHashtagRule: string;
  algoHookTiming: string;
  algoPeakTimes: string;
  algoAvoid: string;
  algoSeoNote?: string;
}
type Status   = 'review' | 'approved' | 'scheduled' | 'posted' | 'draft' | 'generating' | 'rejected' | 'all';
type Platform = 'all' | 'instagram' | 'tiktok' | 'linkedin';
interface AirtableRecord { id: string; fields: Record<string, any>; }
interface ChatMessage { role: 'user' | 'assistant'; content: string; agents?: string[]; imageUrl?: string; visualStyle?: string; ts: number; }

const TOKEN_KEY    = 'sym_dashboard_token';
const DARKMODE_KEY = 'sym_dashboard_dark';
function getToken()           { return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) ?? '' : ''; }
function saveToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken()         { localStorage.removeItem(TOKEN_KEY); }

async function apiGet(path: string, token: string)                 { const r = await fetch(path, { headers: { 'x-dashboard-token': token } }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiPatch(path: string, body: object, token: string) { const r = await fetch(path, { method: 'PATCH',  headers: { 'Content-Type': 'application/json', 'x-dashboard-token': token }, body: JSON.stringify(body) }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiPost(path: string,  body: object, token: string) { const r = await fetch(path, { method: 'POST',   headers: { 'Content-Type': 'application/json', 'x-dashboard-token': token }, body: JSON.stringify(body) }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiDelete(path: string, body: object, token: string) { const r = await fetch(path, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-dashboard-token': token }, body: JSON.stringify(body) }); if (r.status === 401) throw new Error('UNAUTHORIZED'); if (!r.ok) throw new Error(await r.text()); return r.json(); }

export default function Dashboard() {
  const [authed,   setAuthed]   = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [token,    setTokenState] = useState('');

  const [dark,     setDark]     = useState(true);
  const C = dark ? DARK : LIGHT;
  const STATUS_COLOR = dark ? STATUS_COLOR_DARK : STATUS_COLOR_LIGHT;
  const PLATFORM_COLOR: Record<string, string> = {
    instagram: C.pink, tiktok: C.cyan, linkedin: C.teal,
  };

  const [tab,      setTab]      = useState<Tab>('queue');
  const [status,   setStatus]   = useState<Status>('review');
  const [platform, setPlatform] = useState<Platform>('all');

  const [records,  setRecords]  = useState<AirtableRecord[]>([]);
  const [counts,   setCounts]   = useState<Record<string, number>>({});
  const [loading,  setLoading]  = useState(false);

  const [detail,   setDetail]   = useState<AirtableRecord | null>(null);
  const [schedModal, setSchedModal] = useState<{ record: AirtableRecord } | null>(null);
  const [schedDate,  setSchedDate]  = useState('');

  // Chat
  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [chatInput,   setChatInput]   = useState('');
  const [chatPlatform,setChatPlatform] = useState<Platform>('all');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef   = useRef<HTMLDivElement>(null);

  // Image attachment
  const [attachedImage,    setAttachedImage]    = useState<{ url: string; preview: string } | null>(null);
  const [imageUploading,   setImageUploading]   = useState(false);
  const [isDraggingOver,   setIsDraggingOver]   = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Visual style
  const [visualStyle, setVisualStyle] = useState<VisualStyleId>('none');

  // Visual AI model
  const [selectedModel,    setSelectedModel]    = useState<ModelId>('flux-pro');
  const [modelLibraryOpen, setModelLibraryOpen] = useState(false);
  const [modelTypeFilter,  setModelTypeFilter]  = useState<'all' | ModelType>('all');

  // Research tab
  const [researchTopic,    setResearchTopic]    = useState('');
  const [researchPlatform, setResearchPlatform] = useState<Platform>('all');
  const [researchLoading,  setResearchLoading]  = useState(false);
  const [researchResult,   setResearchResult]   = useState<ResearchResult | null>(null);
  const [researchError,    setResearchError]    = useState('');

  const [confirmDelete, setConfirmDelete] = useState<AirtableRecord | null>(null);
  const [toast, setToast] = useState<{ msg: string; type?: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((msg: string, type = '') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const handleImageAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAttachedImage({ url: preview, preview });  // optimistic local preview
    setImageUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('/api/dashboard/upload', { method: 'POST', headers: { 'x-dashboard-token': token }, body: form });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed');
      setAttachedImage({ url: data.url, preview });
    } catch (err: any) {
      showToast(err.message ?? 'Image upload failed', 'error');
      setAttachedImage(null);
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    // Reuse the same upload logic
    const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    await handleImageAttach(fakeEvent);
  };

  useEffect(() => {
    const t = getToken();
    if (t) { setTokenState(t); setAuthed(true); }
    const savedDark = localStorage.getItem(DARKMODE_KEY);
    // Default: dark mode ON (or honour saved preference)
    if (savedDark === null) { setDark(true); }
    else { setDark(savedDark === 'true'); }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem(DARKMODE_KEY, String(next));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    try {
      const res  = await fetch('/api/dashboard/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (data.ok && data.token) { saveToken(data.token); setTokenState(data.token); setAuthed(true); }
      else setLoginErr('Invalid username or password');
    } catch { setLoginErr('Login failed — please try again'); }
  };

  const loadRecords = useCallback(async (silent = false) => {
    if (!authed) return;
    if (!silent) setLoading(true);
    try {
      const p = new URLSearchParams();
      if (status !== 'all') p.set('status', status);
      if (platform !== 'all') p.set('platform', platform);
      const data = await apiGet(`/api/dashboard/records?${p}`, token);
      setRecords(data.records ?? []);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') setAuthed(false);
      else if (!silent) showToast('Failed to load records', 'error');
    } finally { if (!silent) setLoading(false); }
  }, [authed, status, platform, showToast, token]);

  const loadCounts = useCallback(async () => {
    if (!authed) return;
    try {
      const statuses = ['generating', 'review', 'approved', 'scheduled', 'posted'];
      const results  = await Promise.allSettled(statuses.map(s => apiGet(`/api/dashboard/records?status=${s}`, token)));
      const c: Record<string, number> = {};
      results.forEach((r, i) => { c[statuses[i]] = r.status === 'fulfilled' ? (r.value.records ?? []).length : 0; });
      setCounts(c);
    } catch {}
  }, [authed, token]);

  useEffect(() => { if (authed) { loadRecords(); loadCounts(); } }, [authed, status, platform, loadRecords, loadCounts]);
  useEffect(() => { if (!authed) return; const t = setInterval(() => { loadRecords(true); loadCounts(); }, 60000); return () => clearInterval(t); }, [authed, loadRecords, loadCounts]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiPatch('/api/dashboard/records', { id, fields: { [F.status]: newStatus } }, token);
      setRecords(rs => rs.filter(r => r.id !== id));
      setDetail(null);
      showToast(`Marked as ${newStatus}`, 'success');
      loadCounts();
    } catch { showToast('Update failed', 'error'); }
  };

  const deleteRecord = async (id: string) => {
    try {
      await apiDelete('/api/dashboard/records', { id }, token);
      setRecords(rs => rs.filter(r => r.id !== id));
      setDetail(null);
      setConfirmDelete(null);
      showToast('Deleted', 'success');
      loadCounts();
    } catch { showToast('Delete failed', 'error'); }
  };

  const schedulePost = async () => {
    if (!schedModal || !schedDate) return;
    try {
      await apiPost('/api/dashboard/generate', { recordId: schedModal.record.id, scheduledAt: schedDate }, token);
      await apiPatch('/api/dashboard/records', { id: schedModal.record.id, fields: { [F.status]: 'scheduled', [F.scheduledAt]: schedDate } }, token);
      setSchedModal(null);
      setRecords(rs => rs.filter(r => r.id !== schedModal.record.id));
      showToast('Scheduled via Blotato', 'success');
      loadCounts();
    } catch { showToast('Scheduling failed', 'error'); }
  };

  const sendChat = async () => {
    if ((!chatInput.trim() && !attachedImage) || chatLoading) return;
    const imageUrl = attachedImage?.url ?? undefined;
    const style    = visualStyle !== 'none' ? visualStyle : undefined;
    const userMsg: ChatMessage = { role: 'user', content: chatInput || '(image brief)', imageUrl, visualStyle: style, ts: Date.now() };
    setMessages(m => [...m, userMsg]);
    setChatInput('');
    setAttachedImage(null);
    setVisualStyle('none');
    setChatLoading(true);
    try {
      const payload: Record<string, string> = { command: chatInput, platform: chatPlatform, visualModel: selectedModel };
      if (imageUrl) payload.imageUrl = imageUrl;
      if (style)    payload.visualStyle = style;
      const res = await apiPost('/api/dashboard/generate', payload, token);
      const reply = res.message ?? 'Team briefed — content will appear in queue shortly.';
      const agentsRouted: string[] = res.agents ?? [];
      setMessages(m => [...m, { role: 'assistant', content: reply, agents: agentsRouted, ts: Date.now() }]);
      setPipelineStarted(Date.now());
      // Poll for new content silently — n8n pipeline takes 30-90s; 15s × 12 polls = 3 min
      let polls = 0;
      const poll = setInterval(() => {
        polls++;
        loadRecords(true); loadCounts();
        if (polls >= 12) { clearInterval(poll); setPipelineStarted(null); }
      }, 15000);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Failed to reach the agent team. Please try again.', ts: Date.now() }]);
    } finally { setChatLoading(false); }
  };

  const runResearch = async () => {
    if (!researchTopic.trim() || researchLoading) return;
    setResearchLoading(true);
    setResearchError('');
    setResearchResult(null);
    try {
      const res = await apiPost('/api/dashboard/research', { topic: researchTopic, platform: researchPlatform }, token);
      if (res.error) setResearchError(res.error);
      else setResearchResult(res as ResearchResult);
    } catch (e: any) {
      setResearchError(e.message ?? 'Research failed');
    } finally { setResearchLoading(false); }
  };

  const f = (r: AirtableRecord, field: string) => r.fields[field] ?? '';
  const score = (r: AirtableRecord) => Number(f(r, F.viralScore)) || 0;
  const scoreColor = (n: number) => n >= 8 ? C.green : n >= 6 ? C.orange : C.dim;
  const calendarRecords = records.filter(r => f(r, F.scheduledAt));

  // Track when pipeline was last triggered (for progress bar timing)
  const [pipelineStarted, setPipelineStarted] = useState<number | null>(null);
  const isGenerating = (counts['generating'] ?? 0) > 0 || pipelineStarted !== null;

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: dark ? DARK.bg : '#f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LIGHT.body }}>
        <div style={{ width: 400, padding: '48px 40px', background: dark ? DARK.bgMid : '#ffffff', border: `1px solid ${dark ? DARK.borderMid : 'rgba(0,0,0,0.1)'}`, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 600, color: dark ? DARK.fg : '#1a1826', marginBottom: 4 }}>Symponia</div>
          <div style={{ fontSize: '0.72rem', color: dark ? DARK.dim : '#8880a8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 36 }}>Marketing OS</div>
          <form onSubmit={handleLogin}>
            {(['Username', 'Password'] as const).map((label, i) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 500, color: dark ? DARK.sub : '#4a4460', marginBottom: 6 }}>{label}</div>
                <input
                  type={i === 1 ? 'password' : 'text'}
                  value={i === 0 ? username : password}
                  onChange={e => i === 0 ? setUsername(e.target.value) : setPassword(e.target.value)}
                  autoComplete={i === 0 ? 'username' : 'current-password'}
                  placeholder={label}
                  style={{ width: '100%', padding: '10px 14px', background: dark ? 'rgba(255,255,255,0.04)' : '#f8f8fb', border: `1px solid ${dark ? DARK.border : 'rgba(0,0,0,0.12)'}`, borderRadius: 8, color: dark ? DARK.fg : '#1a1826', fontFamily: LIGHT.body, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            {loginErr && <div style={{ fontSize: '0.8rem', color: '#dc2626', marginBottom: 14, textAlign: 'center' }}>{loginErr}</div>}
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontFamily: LIGHT.body, fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', marginTop: 4 }}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Sidebar always-dark colors (marketing SaaS standard) ─────────────────
  const S = {
    bg:     '#0a0818',
    bgHov:  'rgba(255,255,255,0.04)',
    bgAct:  'rgba(167,139,250,0.12)',
    fg:     '#eae6f8',
    sub:    '#b8b0d8',
    dim:    '#6b6090',
    border: 'rgba(255,255,255,0.07)',
  };

  const NAV_ITEMS: { key: Tab; label: string; icon: string }[] = [
    { key: 'queue',    label: 'Content Queue',  icon: '▦' },
    { key: 'brief',    label: 'Brief Team',     icon: '◈' },
    { key: 'research', label: 'Research',        icon: '◉' },
    { key: 'models',   label: 'Visual Models',   icon: '◆' },
    { key: 'agents',   label: 'Agent Team',      icon: '◻' },
    { key: 'calendar', label: 'Calendar',        icon: '▣' },
  ];

  const currentNavItem = NAV_ITEMS.find(n => n.key === tab);

  // ── MAIN ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', fontFamily: C.body, color: C.fg }}>

      <style>{`
        @keyframes slide    { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes shimmer  { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes genpulse { 0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0.4)} 50%{box-shadow:0 0 0 6px rgba(167,139,250,0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      {/* ── Global generating shimmer bar (top) ── */}
      {isGenerating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 9999, overflow: 'hidden', background: 'rgba(124,58,237,0.15)' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, transparent, ${C.violet}, ${C.pink}, ${C.cyan}, transparent)`, backgroundSize: '200% 100%', animation: 'slide 1.8s ease-in-out infinite' }} />
        </div>
      )}

      {/* ── LEFT SIDEBAR (always visible, always dark) ─────────────────────── */}
      <aside style={{
        width: 240, flexShrink: 0, background: S.bg,
        borderRight: `1px solid ${S.border}`,
        position: 'fixed', top: 0, left: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        zIndex: 200, overflowY: 'auto',
      }}>
        {/* Accent line top */}
        <div style={{ height: 2, background: `linear-gradient(90deg, #7c3aed, #db2777, #0ea5a0)`, flexShrink: 0 }} />

        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', flexShrink: 0 }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #7c3aed, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(124,58,237,0.4)', flexShrink: 0 }}>
              <span style={{ fontSize: '1rem', color: '#fff', lineHeight: 1 }}>◈</span>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: S.fg, lineHeight: 1.1 }}>Symponia</div>
              <div style={{ fontSize: '0.58rem', color: S.dim, letterSpacing: '0.18em', textTransform: 'uppercase', lineHeight: 1.2 }}>Marketing OS</div>
            </div>
          </a>
        </div>

        {/* ── Navigation ── */}
        <div style={{ padding: '4px 0 8px', flexShrink: 0 }}>
          <div style={{ padding: '0 18px 6px', fontSize: '0.58rem', fontWeight: 700, color: S.dim, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Workspace</div>
          {NAV_ITEMS.map(item => {
            const isActive = tab === item.key;
            const badge = item.key === 'queue' ? ((counts['review'] ?? 0) + (counts['approved'] ?? 0)) : 0;
            return (
              <button key={item.key} onClick={() => setTab(item.key)}
                style={{ width: '100%', padding: '9px 18px', background: isActive ? S.bgAct : 'none', border: 'none', borderLeft: `2px solid ${isActive ? '#a78bfa' : 'transparent'}`, color: isActive ? '#a78bfa' : S.sub, fontFamily: C.body, fontSize: '0.82rem', fontWeight: isActive ? 600 : 400, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s' }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = S.bgHov; (e.currentTarget as HTMLElement).style.color = S.fg; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = S.sub; } }}>
                <span style={{ fontSize: '0.8rem', width: 16, textAlign: 'center', flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {badge > 0 && (
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#7c3aed', color: '#fff', borderRadius: 10, padding: '1px 7px', flexShrink: 0 }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Pipeline filters (shown always, clicking goes to queue) ── */}
        <div style={{ padding: '4px 0 8px', borderTop: `1px solid ${S.border}`, flexShrink: 0 }}>
          <div style={{ padding: '10px 18px 6px', fontSize: '0.58rem', fontWeight: 700, color: S.dim, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Pipeline</div>
          {([
            { key: 'generating' as Status, label: 'Generating', dotColor: '#5ce8d0' },
            { key: 'review'     as Status, label: 'For Review',  dotColor: '#fb923c' },
            { key: 'approved'   as Status, label: 'Approved',    dotColor: '#4ade80' },
            { key: 'scheduled'  as Status, label: 'Scheduled',   dotColor: '#5b8df0' },
            { key: 'posted'     as Status, label: 'Posted',      dotColor: '#a78bfa' },
            { key: 'rejected'   as Status, label: 'Rejected',    dotColor: '#f87171' },
          ]).map(({ key, label, dotColor }) => {
            const count = counts[key] ?? 0;
            const isActive = tab === 'queue' && status === key;
            if (count === 0 && key !== 'review' && key !== 'approved') return null;
            return (
              <button key={key} onClick={() => { setTab('queue'); setStatus(key); }}
                style={{ width: '100%', padding: '7px 18px', background: isActive ? S.bgAct : 'none', border: 'none', borderLeft: `2px solid ${isActive ? '#a78bfa' : 'transparent'}`, color: isActive ? '#a78bfa' : S.sub, fontFamily: C.body, fontSize: '0.78rem', fontWeight: isActive ? 600 : 400, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s' }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = S.bgHov; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'none'; } }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0, boxShadow: key === 'generating' && count > 0 ? `0 0 5px ${dotColor}` : 'none', animation: key === 'generating' && count > 0 ? 'pulse 1.2s ease infinite' : 'none' }} />
                <span style={{ flex: 1 }}>{label}</span>
                {count > 0 && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: dotColor, background: `${dotColor}18`, borderRadius: 10, padding: '1px 6px', flexShrink: 0 }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Platform filter (shown always, clicking sets platform + goes to queue) ── */}
        <div style={{ padding: '4px 0 8px', borderTop: `1px solid ${S.border}`, flexShrink: 0 }}>
          <div style={{ padding: '10px 18px 6px', fontSize: '0.58rem', fontWeight: 700, color: S.dim, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Platform</div>
          {(['all','instagram','tiktok','linkedin'] as Platform[]).map(p => {
            const pColor = p === 'instagram' ? '#e879a0' : p === 'tiktok' ? '#5ce8d0' : p === 'linkedin' ? '#5b8df0' : S.dim;
            const isActive = tab === 'queue' && platform === p;
            return (
              <button key={p} onClick={() => { setTab('queue'); setPlatform(p); }}
                style={{ width: '100%', padding: '7px 18px', background: isActive ? S.bgAct : 'none', border: 'none', borderLeft: `2px solid ${isActive ? '#a78bfa' : 'transparent'}`, color: isActive ? '#a78bfa' : S.sub, fontFamily: C.body, fontSize: '0.78rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s' }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = S.bgHov; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'none'; } }}>
                {p !== 'all' && <span style={{ color: pColor, fontSize: '0.75rem', flexShrink: 0, width: 14, textAlign: 'center' }}>{PLATFORM_ICON[p]}</span>}
                {p === 'all' && <span style={{ fontSize: '0.75rem', flexShrink: 0, width: 14, textAlign: 'center', color: S.dim }}>◈</span>}
                {p === 'all' ? 'All Platforms' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>

        {/* ── Generating status in sidebar ── */}
        {isGenerating && (
          <div style={{ margin: '8px 12px', padding: '10px 12px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', animation: 'genpulse 1.5s ease infinite', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa' }}>Agents working…</span>
            </div>
            {pipelineStarted && (() => {
              const elapsed = Math.floor((Date.now() - pipelineStarted) / 1000);
              const steps = [
                { label: 'Trend Research',  done: elapsed > 8 },
                { label: 'Platform Briefs', done: elapsed > 20 },
                { label: 'Copy + Visuals',  done: elapsed > 45 },
                { label: 'Manager Review',  done: elapsed > 65 },
                { label: 'Saving to queue', done: elapsed > 80 },
              ];
              const activeIdx = steps.filter(x=>x.done).length;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {steps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, background: s.done ? '#4ade80' : (i === activeIdx ? '#a78bfa' : 'transparent'), border: s.done ? 'none' : `1.5px solid ${i === activeIdx ? '#a78bfa' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {s.done && <span style={{ fontSize: '0.45rem', color: '#fff' }}>✓</span>}
                      </div>
                      <span style={{ fontSize: '0.66rem', color: s.done ? '#6b6090' : i === activeIdx ? '#a78bfa' : '#6b6090', fontWeight: i === activeIdx ? 600 : 400, textDecoration: s.done ? 'line-through' : 'none', textDecorationColor: '#6b6090' }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <button onClick={() => { setTab('queue'); setStatus('all'); }}
              style={{ marginTop: 8, width: '100%', padding: '5px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 6, color: '#a78bfa', fontFamily: C.body, fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}>
              Watch queue →
            </button>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* ── Sidebar bottom ── */}
        <div style={{ borderTop: `1px solid ${S.border}`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={toggleDark} title={dark ? 'Light mode' : 'Dark mode'}
            style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer', fontSize: '0.72rem', color: S.sub, fontFamily: C.body, transition: 'all .15s' }}>
            {dark ? '☀' : '☾'}
          </button>
          <button onClick={() => { loadRecords(); loadCounts(); }}
            style={{ padding: '6px 10px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, cursor: 'pointer', fontSize: '0.72rem', color: S.dim, fontFamily: C.body, transition: 'all .15s' }}>
            ↺
          </button>
          <button onClick={() => { clearToken(); setAuthed(false); }}
            style={{ flex: 1, fontSize: '0.72rem', color: S.dim, background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, cursor: 'pointer', padding: '6px 10px', fontFamily: C.body, textAlign: 'center', transition: 'all .15s' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── RIGHT SIDE: top bar + main content ─────────────────────────────── */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0 }}>

        {/* ── Slim top bar ── */}
        <header style={{ height: 52, background: C.bgMid, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 0, flexShrink: 0, position: 'sticky', top: 0, zIndex: 100 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', color: C.dim }}>Symponia</span>
            <span style={{ fontSize: '0.68rem', color: C.dim, opacity: 0.5 }}>›</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: C.fg }}>{currentNavItem?.label ?? ''}</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Quick KPI pills */}
          {([
            { key: 'generating' as Status, label: 'Generating', color: '#5ce8d0' },
            { key: 'review'     as Status, label: 'Review',     color: '#fb923c' },
            { key: 'approved'   as Status, label: 'Approved',   color: '#4ade80' },
            { key: 'scheduled'  as Status, label: 'Scheduled',  color: '#5b8df0' },
          ]).filter(s => (counts[s.key] ?? 0) > 0 || s.key === 'review').map(s => (
            <div key={s.key} onClick={() => { setTab('queue'); setStatus(s.key); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', cursor: 'pointer', borderRadius: 20, background: status === s.key && tab === 'queue' ? `${s.color}14` : 'transparent', marginRight: 2, transition: 'all .15s' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, boxShadow: s.key === 'generating' && (counts[s.key] ?? 0) > 0 ? `0 0 5px ${s.color}` : 'none', animation: s.key === 'generating' && (counts[s.key] ?? 0) > 0 ? 'pulse 1.2s ease infinite' : 'none' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color, fontFamily: C.mono }}>{counts[s.key] ?? 0}</span>
              <span style={{ fontSize: '0.62rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
          ))}
        </header>

        {/* ── Main content ── */}
        <main style={{ flex: 1, minHeight: 0, overflow: tab === 'brief' ? 'hidden' : 'auto', padding: tab === 'brief' ? 0 : tab === 'research' || tab === 'models' ? '28px 36px' : '24px' }}>

          {/* ── QUEUE TAB ── */}
          {tab === 'queue' && (
            <>
              {/* KPI stats bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {([
                  { key: 'review'    as Status, label: 'For Review',  icon: '◎', color: '#fb923c', desc: 'Needs decision' },
                  { key: 'approved'  as Status, label: 'Approved',    icon: '✓', color: '#4ade80', desc: 'Ready to schedule' },
                  { key: 'scheduled' as Status, label: 'Scheduled',   icon: '▣', color: '#5b8df0', desc: 'Going out soon' },
                  { key: 'posted'    as Status, label: 'Published',   icon: '◉', color: '#a78bfa', desc: 'Live content' },
                ]).map(stat => (
                  <div key={stat.key} onClick={() => setStatus(stat.key)}
                    style={{ padding: '16px 18px', background: status === stat.key ? `${stat.color}10` : C.bgCard, border: `1px solid ${status === stat.key ? stat.color+'33' : C.border}`, borderRadius: 12, cursor: 'pointer', transition: 'all .15s', position: 'relative', overflow: 'hidden' }}
                    onMouseEnter={e => { if (status !== stat.key) { (e.currentTarget as HTMLElement).style.borderColor = stat.color+'33'; (e.currentTarget as HTMLElement).style.background = `${stat.color}08`; } }}
                    onMouseLeave={e => { if (status !== stat.key) { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.background = C.bgCard; } }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${stat.color}, transparent)`, opacity: status === stat.key ? 1 : 0.4 }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, fontFamily: C.mono, lineHeight: 1 }}>{counts[stat.key] ?? 0}</span>
                      <span style={{ fontSize: '0.85rem', color: stat.color, opacity: 0.7 }}>{stat.icon}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: C.fg, marginBottom: 2 }}>{stat.label}</div>
                    <div style={{ fontSize: '0.65rem', color: C.dim }}>{stat.desc}</div>
                  </div>
                ))}
              </div>

              {/* Filter label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: C.fg }}>
                  {status === 'all' ? 'All Content' : status === 'review' ? 'For Review' : status.charAt(0).toUpperCase() + status.slice(1)}
                  {platform !== 'all' && <span style={{ color: C.dim, fontWeight: 400 }}> · {platform.charAt(0).toUpperCase() + platform.slice(1)}</span>}
                </div>
                {records.length > 0 && <span style={{ fontSize: '0.65rem', color: C.dim, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: 10 }}>{records.length} items</span>}
                <div style={{ flex: 1 }} />
                <button onClick={() => { setTab('brief'); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: C.violet, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}>
                  + Brief Team
                </button>
              </div>

              {loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 14 }} />
                      {[60, 100, 80, 40].map((w, j) => (
                        <div key={j} style={{ height: j === 0 ? 10 : 8, width: `${w}%`, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', borderRadius: 4, marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)'}, transparent)`, animation: `shimmer ${1.2 + i * 0.2}s ease infinite` }} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {!loading && records.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
                  <div style={{ fontSize: '2.5rem', opacity: 0.15 }}>
                    {status === 'review' ? '◎' : status === 'approved' ? '✓' : status === 'scheduled' ? '▣' : '◈'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: C.sub }}>
                    {status === 'review' ? 'Nothing to review' : status === 'approved' ? 'Nothing approved yet' : status === 'scheduled' ? 'Nothing scheduled' : status === 'posted' ? 'Nothing posted yet' : 'No content yet'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: C.dim, textAlign: 'center', maxWidth: 320, lineHeight: 1.8 }}>
                    {status === 'review'
                      ? isGenerating ? 'Agents are working — content will appear here shortly.' : 'Brief the team to generate content for review.'
                      : status === 'approved'
                      ? 'Approve content from the Review queue first.'
                      : status === 'scheduled'
                      ? 'Schedule approved content using the calendar.'
                      : <><strong style={{ cursor: 'pointer', color: C.violet }} onClick={() => setTab('brief')}>Brief the team</strong> to start generating content.</>
                    }
                  </div>
                  {status === 'review' && !isGenerating && (
                    <button onClick={() => setTab('brief')} style={{ marginTop: 8, padding: '9px 20px', background: C.violet, border: 'none', borderRadius: 9, color: '#fff', fontFamily: C.body, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Brief the team →</button>
                  )}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {records.map(r => (
                  <ContentCard key={r.id} r={r} f={f} score={score} scoreColor={scoreColor}
                    C={C} STATUS_COLOR={STATUS_COLOR} PLATFORM_COLOR={PLATFORM_COLOR}
                    onClick={() => setDetail(r)}
                    onApprove={() => updateStatus(r.id, 'approved')}
                    onReject={() => updateStatus(r.id, 'rejected')}
                    onSchedule={() => { setSchedModal({ record: r }); setSchedDate(''); }}
                    onDelete={() => setConfirmDelete(r)}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── BRIEF TAB (Chat) ── */}
          {tab === 'brief' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Chat header */}
              <div style={{ padding: '14px 24px', borderBottom: `1px solid ${C.border}`, background: C.bgMid, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${C.violet}33, ${C.pink}22)`, border: `1px solid ${C.violet}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.violet, fontSize: '1.1rem', fontWeight: 700, flexShrink: 0 }}>◈</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.fg, letterSpacing: '-0.01em' }}>Orchestrator</div>
                  <div style={{ fontSize: '0.7rem', color: C.green, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block', boxShadow: `0 0 4px ${C.green}` }} />
                    Online · Marketing Director · 8 agents ready
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isGenerating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${C.violet}18`, border: `1px solid ${C.violet}44` }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.violet, boxShadow: `0 0 6px ${C.violet}`, animation: 'pulse 1.2s ease infinite' }} />
                      <span style={{ fontSize: '0.68rem', color: C.violet, fontWeight: 600 }}>Generating…</span>
                      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
                    </div>
                  )}
                  {([
                    { key: 'review' as Status, color: C.orange },
                    { key: 'approved' as Status, color: C.green },
                  ]).map(s => counts[s.key] > 0 ? (
                    <div key={s.key} onClick={() => { setTab('queue'); setStatus(s.key); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: `${s.color}12`, border: `1px solid ${s.color}33`, cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: s.color }}>{counts[s.key]}</span>
                      <span style={{ fontSize: '0.62rem', color: C.dim, textTransform: 'capitalize' }}>{s.key}</span>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.length === 0 && (
                  <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 520 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${C.violet}22, ${C.pink}11)`, border: `1px solid ${C.violet}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem' }}>◈</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: C.fg, marginBottom: 8, letterSpacing: '-0.01em' }}>Brief the Marketing Team</div>
                    <div style={{ fontSize: '0.82rem', color: C.dim, lineHeight: 1.8, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
                      Describe what you need. The Orchestrator reads your brief, routes to the right agents, and content appears in your queue — fully scored and ready to review.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                      {[
                        { text: 'Create a TikTok video about the wolf archetype and leadership',     icon: '▶', platform: 'TikTok' },
                        { text: 'Write a LinkedIn post on animal archetype psychology', icon: '◻', platform: 'LinkedIn' },
                        { text: 'Generate an Instagram carousel on the 7 spirit animals', icon: '◎', platform: 'Instagram' },
                        { text: 'Create content on biodynamic living and daily oracle practices',    icon: '◈', platform: 'All' },
                      ].map(s => (
                        <button key={s.text} onClick={() => setChatInput(s.text)}
                          style={{ padding: '12px 14px', background: dark ? 'rgba(255,255,255,0.03)' : '#fff', border: `1px solid ${C.border}`, borderRadius: 10, color: C.sub, fontFamily: C.body, fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', lineHeight: 1.5, transition: 'all .15s', display: 'flex', flexDirection: 'column', gap: 6 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.violet; (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(124,58,237,0.06)' : '#f5f3ff'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.background = dark ? 'rgba(255,255,255,0.03)' : '#fff'; }}>
                          <span style={{ fontSize: '0.62rem', color: C.violet, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.icon} {s.platform}</span>
                          {s.text}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: C.dim }}>Or attach a reference image below to generate content around it</div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.role === 'user' ? C.violet : (dark ? 'rgba(124,58,237,0.15)' : '#ede9fb'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: msg.role === 'user' ? '#fff' : C.violet, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                      {msg.role === 'user' ? 'Y' : '◈'}
                    </div>
                    <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 6, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="attached" style={{ maxWidth: 220, maxHeight: 160, borderRadius: 10, objectFit: 'cover', border: `1px solid ${C.border}` }} />
                      )}
                      <div style={{ padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', background: msg.role === 'user' ? C.violet : (dark ? 'rgba(255,255,255,0.05)' : '#ffffff'), color: msg.role === 'user' ? '#fff' : C.fg, fontSize: '0.85rem', lineHeight: 1.7, boxShadow: dark ? 'none' : C.shadow, border: msg.role === 'user' ? 'none' : `1px solid ${C.border}` }}>
                        {msg.content}
                      </div>
                      {msg.agents && msg.agents.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          <span style={{ fontSize: '0.68rem', color: C.dim }}>Routed to:</span>
                          {msg.agents.map(a => (
                            <span key={a} style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 10, background: dark ? 'rgba(124,58,237,0.12)' : '#ede9fb', color: C.violet, fontWeight: 500 }}>{a}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: '0.65rem', color: C.dim }}>
                        {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: dark ? 'rgba(124,58,237,0.15)' : '#ede9fb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.violet, fontSize: '0.75rem', fontWeight: 700 }}>◈</div>
                    <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: dark ? 'rgba(255,255,255,0.05)' : '#ffffff', border: `1px solid ${C.border}`, fontSize: '0.85rem', color: C.dim, boxShadow: dark ? 'none' : C.shadow }}>
                      Thinking…
                    </div>
                  </div>
                )}
                {/* Generating status banner */}
                {isGenerating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: dark ? `${C.violet}10` : '#faf7ff', border: `1px solid ${C.violet}33`, borderRadius: 12, margin: '0 0 8px' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${C.violet}22`, border: `1px solid ${C.violet}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${C.violet}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: C.violet, marginBottom: 2 }}>Agents are generating your content</div>
                      <div style={{ fontSize: '0.68rem', color: C.dim }}>This takes 60–90 seconds. Content will appear in your queue automatically.</div>
                    </div>
                    <button onClick={() => { setTab('queue'); setStatus('all'); }} style={{ padding: '6px 14px', background: C.violet, border: 'none', borderRadius: 7, color: '#fff', fontFamily: C.body, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>Watch queue →</button>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* ── Input area ─────────────────────────────────────────────── */}
              <div style={{ borderTop: `1px solid ${C.border}`, background: C.bgMid }}>

                {/* ── Row 1: Platform selector + Visual style + Model picker ── */}
                <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <select value={chatPlatform} onChange={e => setChatPlatform(e.target.value as Platform)}
                    style={{ padding: '6px 10px', background: dark ? 'rgba(255,255,255,0.05)' : '#f4f3f9', border: `1px solid ${C.border}`, borderRadius: 7, color: C.sub, fontFamily: C.body, fontSize: '0.75rem', outline: 'none', cursor: 'pointer', marginRight: 4 }}>
                    <option value="all">◈ All platforms</option>
                    <option value="instagram">◎ Instagram</option>
                    <option value="tiktok">▶ TikTok</option>
                    <option value="linkedin">◻ LinkedIn</option>
                  </select>

                  <div style={{ fontSize: '0.62rem', color: C.dim, marginRight: 2, whiteSpace: 'nowrap' }}>Style:</div>
                  {VISUAL_STYLES.map(s => (
                    <button key={s.id} onClick={() => setVisualStyle(s.id as VisualStyleId)} title={s.desc}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: visualStyle === s.id ? (dark ? 'rgba(124,58,237,0.18)' : '#ede9fb') : (dark ? 'rgba(255,255,255,0.04)' : '#f4f3f9'), border: `1px solid ${visualStyle === s.id ? C.violet : C.border}`, borderRadius: 20, color: visualStyle === s.id ? C.violet : C.dim, fontFamily: C.body, fontSize: '0.7rem', fontWeight: visualStyle === s.id ? 600 : 400, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.75rem' }}>{s.emoji}</span>
                      {s.label}
                    </button>
                  ))}

                  <div style={{ width: 1, height: 16, background: C.border, margin: '0 4px', flexShrink: 0 }} />

                  {/* Model picker button — shows selected model, opens library */}
                  <button onClick={() => setTab('models')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', background: dark ? 'rgba(255,255,255,0.05)' : '#f4f3f9', border: `1px solid ${C.borderMid}`, borderRadius: 20, color: C.sub, fontFamily: C.body, fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.violet; (e.currentTarget as HTMLElement).style.color = C.violet; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.borderMid; (e.currentTarget as HTMLElement).style.color = C.sub; }}>
                    {(() => {
                      const m = MODEL_LIBRARY.find(x => x.id === selectedModel);
                      return <>
                        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{m?.type === 'video' ? '▶' : '◆'}</span>
                        <span>{m?.name ?? selectedModel}</span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.55 }}>▾</span>
                      </>;
                    })()}
                  </button>
                </div>

                {/* ── Row 2: Image upload zone (shown collapsed, expands on hover/when attached) ── */}
                <div style={{ padding: '10px 24px 0' }}>
                  <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageAttach} />

                  {!attachedImage ? (
                    /* Drop zone */
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setIsDraggingOver(true); }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={handleDrop}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: isDraggingOver ? (dark ? 'rgba(124,58,237,0.12)' : '#ede9fb') : (dark ? 'rgba(255,255,255,0.025)' : '#f8f7ff'), border: `1.5px dashed ${isDraggingOver ? C.violet : C.border}`, borderRadius: 10, cursor: 'pointer', transition: 'all .15s' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDraggingOver ? C.violet : C.dim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 500, color: isDraggingOver ? C.violet : C.sub }}>
                          {isDraggingOver ? 'Drop image here' : 'Attach a reference image'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: C.dim, marginLeft: 6 }}>
                          {isDraggingOver ? '' : '— drag & drop or click to browse · max 8 MB'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: C.dim, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '2px 7px', borderRadius: 5 }}>Browse</span>
                    </div>
                  ) : (
                    /* Attached image preview */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', background: dark ? 'rgba(124,58,237,0.08)' : '#ede9fb', borderRadius: 10, border: `1px solid ${C.violet}44` }}>
                      <img src={attachedImage.preview} alt="preview" style={{ width: 44, height: 44, borderRadius: 7, objectFit: 'cover', flexShrink: 0, border: `1px solid ${C.violet}44` }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.violet }}>
                          {imageUploading ? 'Uploading…' : '✓ Reference image attached'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: C.dim, marginTop: 1 }}>
                          Visual Director + all platform agents will analyse this
                        </div>
                      </div>
                      {!imageUploading && (
                        <button onClick={() => setAttachedImage(null)}
                          style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, color: C.dim, cursor: 'pointer', fontSize: '0.68rem', padding: '4px 9px', fontFamily: C.body }}>✕ Remove</button>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Row 3: Textarea + brief button ── */}
                <div style={{ padding: '10px 24px 16px', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                    placeholder={attachedImage ? 'Describe how to use this image, or leave blank to let agents decide the angle…' : 'Brief the team — what to create, the angle, any specific details…'}
                    rows={2}
                    style={{ flex: 1, padding: '10px 14px', background: dark ? 'rgba(255,255,255,0.04)' : '#f8f8fb', border: `1px solid ${C.border}`, borderRadius: 10, color: C.fg, fontFamily: C.body, fontSize: '0.88rem', outline: 'none', resize: 'none', lineHeight: 1.6 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                    <button onClick={sendChat} disabled={chatLoading || (!chatInput.trim() && !attachedImage) || imageUploading}
                      style={{ padding: '10px 22px', background: (chatInput.trim() || attachedImage) && !imageUploading ? C.violet : (dark ? 'rgba(255,255,255,0.04)' : '#f0f0f5'), border: 'none', borderRadius: 9, color: (chatInput.trim() || attachedImage) && !imageUploading ? '#fff' : C.dim, fontFamily: C.body, fontSize: '0.84rem', fontWeight: 600, cursor: (chatInput.trim() || attachedImage) && !imageUploading ? 'pointer' : 'default', transition: 'all .15s' }}>
                      {chatLoading ? '…' : 'Brief →'}
                    </button>
                    <span style={{ fontSize: '0.6rem', color: C.dim }}>⏎ to send</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESEARCH TAB ── */}
          {tab === 'research' && (
            <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 48 }}>

              {/* Header */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: C.fg, marginBottom: 6, letterSpacing: '-0.01em' }}>Trend Research</div>
                <div style={{ fontSize: '0.82rem', color: C.dim, lineHeight: 1.7, maxWidth: 560 }}>
                  Enter a topic. The Trend Researcher and algorithm agents will scan Reddit, Google Trends, and platform signals — then surface the best angle, hashtags, and timing before you commit to generating content.
                </div>
              </div>

              {/* Search bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                  value={researchTopic}
                  onChange={e => setResearchTopic(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runResearch(); }}
                  placeholder="e.g. wolf archetype and leadership, daily presence practices, shadow animal reveal…"
                  style={{ flex: 1, minWidth: 260, padding: '11px 16px', background: dark ? 'rgba(255,255,255,0.05)' : '#ffffff', border: `1px solid ${researchLoading ? C.violet : C.borderMid}`, borderRadius: 10, color: C.fg, fontFamily: C.body, fontSize: '0.9rem', outline: 'none', transition: 'border-color .15s' }}
                />
                <select value={researchPlatform} onChange={e => setResearchPlatform(e.target.value as Platform)}
                  style={{ padding: '11px 12px', background: dark ? 'rgba(255,255,255,0.05)' : '#fff', border: `1px solid ${C.borderMid}`, borderRadius: 10, color: C.sub, fontFamily: C.body, fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
                  <option value="all">All platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
                <button onClick={runResearch} disabled={!researchTopic.trim() || researchLoading}
                  style={{ padding: '11px 24px', background: researchTopic.trim() && !researchLoading ? C.violet : (dark ? 'rgba(255,255,255,0.04)' : '#f0f0f5'), border: 'none', borderRadius: 10, color: researchTopic.trim() && !researchLoading ? '#fff' : C.dim, fontFamily: C.body, fontSize: '0.86rem', fontWeight: 600, cursor: researchTopic.trim() && !researchLoading ? 'pointer' : 'default', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                  {researchLoading ? 'Agents researching…' : '◉ Get Ideas'}
                </button>
              </div>

              {/* Loading state */}
              {researchLoading && (
                <div style={{ padding: '48px 24px', textAlign: 'center', background: dark ? 'rgba(255,255,255,0.025)' : '#fff', border: `1px solid ${C.border}`, borderRadius: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${C.violet}33`, borderTop: `3px solid ${C.violet}`, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.fg, marginBottom: 6 }}>Agents are scanning the web…</div>
                  <div style={{ fontSize: '0.78rem', color: C.dim, lineHeight: 1.7 }}>
                    Exa deep search · Perplexity real-time · Reddit community signals<br />
                    First scan takes up to 45s — repeat topics return instantly from cache.
                  </div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Error */}
              {researchError && !researchLoading && (
                <div style={{ padding: '16px 20px', background: `${C.red}12`, border: `1px solid ${C.red}44`, borderRadius: 12, color: C.red, fontSize: '0.84rem', marginBottom: 20 }}>
                  <strong>Research failed:</strong> {researchError}
                </div>
              )}

              {/* Results */}
              {researchResult && !researchLoading && (() => {
                const r = researchResult;
                const platColor = r.platform === 'instagram' ? C.pink : r.platform === 'tiktok' ? C.cyan : r.platform === 'linkedin' ? C.teal : C.violet;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Trending angle — hero card */}
                    <div style={{ padding: '20px 22px', background: dark ? `${C.violet}12` : '#faf7ff', border: `1px solid ${C.violet}44`, borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.violet}, ${C.pink})` }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.violet }}>◉ Trending Angle</span>
                        <span style={{ fontSize: '0.6rem', color: C.dim, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: 10 }}>
                          {r.platform === 'all' ? 'All Platforms' : r.platform}
                        </span>
                        {r.cached && (
                          <span style={{ fontSize: '0.6rem', fontWeight: 600, color: C.teal, background: `${C.teal}18`, padding: '2px 8px', borderRadius: 10 }}>
                            ⚡ cached
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: C.fg, lineHeight: 1.5, marginBottom: 10 }}>
                        {r.trendingAngle || `${r.topic}`}
                      </div>
                      {r.timingWindow && (
                        <div style={{ fontSize: '0.78rem', color: C.dim }}>
                          <span style={{ color: C.yellow, fontWeight: 600 }}>Best window:</span> {r.timingWindow}
                        </div>
                      )}

                      {/* Brief from research CTA */}
                      <button
                        onClick={() => {
                          setChatInput(`Create content about: ${r.trendingAngle || r.topic}. Best angle: ${r.trendingAngle}. Use hashtags: ${r.hashtags}. Optimal timing: ${r.algoPeakTimes || r.timingWindow}`);
                          setChatPlatform((['instagram','tiktok','linkedin'].includes(r.platform) ? r.platform : 'all') as Platform);
                          setTab('brief');
                        }}
                        style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: C.violet, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                        Brief this topic → Generate content
                      </button>
                    </div>

                    {/* Viral Intelligence panel */}
                    {(r.hookPatterns?.length || r.contentGap || r.competitorBlindSpot || r.viralMechanism) && (
                      <div style={{ padding: '20px 22px', background: dark ? 'rgba(92,232,208,0.05)' : '#f0fdf9', border: `1px solid ${C.cyan}44`, borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.cyan}, ${C.violet})` }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.cyan }}>◉ Viral Intelligence</span>
                          {r.trendStatus && (
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: r.trendStatus === 'rising' ? `${C.green}22` : r.trendStatus === 'peaked' ? `${C.orange}22` : r.trendStatus === 'saturated' ? `${C.red}22` : `${C.violet}22`, color: r.trendStatus === 'rising' ? C.green : r.trendStatus === 'peaked' ? C.orange : r.trendStatus === 'saturated' ? C.red : C.violet }}>
                              {r.trendStatus === 'rising' ? '↑ Rising' : r.trendStatus === 'peaked' ? '⚡ Peaked' : r.trendStatus === 'saturated' ? '↓ Saturated' : '◎ Evergreen'}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          {r.hookPatterns && r.hookPatterns.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Hook Patterns Working Now</div>
                              {r.hookPatterns.map((h, i) => (
                                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                                  <span style={{ fontSize: '0.65rem', color: C.cyan, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                                  <span style={{ fontSize: '0.78rem', color: C.sub, lineHeight: 1.45 }}>{h}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {r.contentGap && (
                              <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Content Gap</div>
                                <div style={{ fontSize: '0.78rem', color: C.sub, lineHeight: 1.5 }}>{r.contentGap}</div>
                              </div>
                            )}
                            {r.competitorBlindSpot && (
                              <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Competitor Blind Spot</div>
                                <div style={{ fontSize: '0.78rem', color: C.sub, lineHeight: 1.5 }}>{r.competitorBlindSpot}</div>
                              </div>
                            )}
                            {r.viralMechanism && (
                              <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Why It Spreads</div>
                                <div style={{ fontSize: '0.78rem', color: C.sub, lineHeight: 1.5 }}>{r.viralMechanism}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        {r.topAngles && r.topAngles.length > 0 && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.cyan}22` }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Top Angles</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {r.topAngles.map((a, i) => (
                                <button key={i} onClick={() => { setChatInput(`Create content using this angle: ${a}. Topic: ${r.topic}. Use hashtags: ${r.hashtags}.`); setChatPlatform((['instagram','tiktok','linkedin'].includes(r.platform) ? r.platform : 'all') as Platform); setTab('brief'); }}
                                  style={{ fontSize: '0.72rem', padding: '5px 11px', borderRadius: 8, background: dark ? `${C.cyan}12` : '#f0fdf9', color: C.cyan, border: `1px solid ${C.cyan}33`, cursor: 'pointer', fontFamily: C.body }}>
                                  {a} →
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2-col grid: algo signals + reddit titles */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                      {/* Algorithm signals */}
                      <div style={{ padding: '18px 20px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: platColor, marginBottom: 12 }}>Algorithm Signals</div>
                        {[
                          { label: 'Top Signals',  val: r.algoTopSignals },
                          { label: 'Best Format',  val: r.algoFormatWinner },
                          { label: 'Hashtag Rule', val: r.algoHashtagRule },
                          { label: 'Hook Timing',  val: r.algoHookTiming },
                          { label: 'Avoid',        val: r.algoAvoid },
                          { label: 'SEO Note',     val: r.algoSeoNote },
                        ].filter(x => x.val).map(({ label, val }) => (
                          <div key={label} style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: '0.62rem', fontWeight: 600, color: C.dim, marginBottom: 2 }}>{label}</div>
                            <div style={{ fontSize: '0.8rem', color: C.sub, lineHeight: 1.5 }}>{val}</div>
                          </div>
                        ))}
                      </div>

                      {/* Multi-source intelligence */}
                      <div style={{ padding: '18px 20px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.orange }}>Live Research</div>
                          {r.totalSources != null && (
                            <span style={{ fontSize: '0.62rem', color: C.dim, background: dark ? 'rgba(255,255,255,0.06)' : '#f0f0f5', padding: '2px 8px', borderRadius: 8 }}>
                              {r.totalSources} results scraped
                            </span>
                          )}
                        </div>

                        {/* Perplexity */}
                        {r.topPerplexityTitles && r.topPerplexityTitles.length > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.cyan, background: dark ? 'rgba(92,232,208,0.12)' : '#e6fdf9', padding: '2px 7px', borderRadius: 6 }}>Perplexity Web</span>
                            </div>
                            {r.topPerplexityTitles?.slice(0, 4).map((title, i) => (
                              <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.65rem', color: C.cyan, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                                <span style={{ fontSize: '0.77rem', color: C.sub, lineHeight: 1.45 }}>{title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reddit */}
                        {(r.topRedditTitles?.length ?? 0) > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.orange, background: dark ? 'rgba(251,146,60,0.12)' : '#fff3e0', padding: '2px 7px', borderRadius: 6 }}>Reddit</span>
                              {r.topSubreddits?.slice(0,3).map(sub => (
                                <span key={sub} style={{ fontSize: '0.6rem', color: C.dim }}>r/{sub}</span>
                              ))}
                            </div>
                            {r.topRedditTitles?.slice(0, 4).map((title, i) => (
                              <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.65rem', color: C.orange, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                                <span style={{ fontSize: '0.77rem', color: C.sub, lineHeight: 1.45 }}>{title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Internet / News */}
                        {(r.topNewsTitles?.length ?? 0) > 0 && (
                          <div style={{ marginBottom: 14 }}>
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.teal, background: dark ? 'rgba(45,212,191,0.1)' : '#e6faf8', padding: '2px 7px', borderRadius: 6 }}>Internet / News</span>
                            </div>
                            {r.topNewsTitles?.slice(0, 4).map((title, i) => (
                              <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.65rem', color: C.teal, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                                <span style={{ fontSize: '0.77rem', color: C.sub, lineHeight: 1.45 }}>{title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Hacker News */}
                        {(r.topHNTitles?.length ?? 0) > 0 && (
                          <div>
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.dim, background: dark ? 'rgba(255,255,255,0.06)' : '#f0f0f5', padding: '2px 7px', borderRadius: 6 }}>Hacker News</span>
                            </div>
                            {r.topHNTitles?.map((title, i) => (
                              <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.65rem', color: C.dim, flexShrink: 0, marginTop: 2 }}>·</span>
                                <span style={{ fontSize: '0.77rem', color: C.sub, lineHeight: 1.45 }}>{title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {!r.topRedditTitles?.length && !r.topNewsTitles?.length && (
                          <div style={{ fontSize: '0.78rem', color: C.dim, fontStyle: 'italic' }}>No live results found — agents will use evergreen angle.</div>
                        )}
                        {r.avgVelocity > 0 && (
                          <div style={{ marginTop: 8, fontSize: '0.7rem', color: C.dim, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                            Reddit velocity: <strong style={{ color: C.fg }}>{r.avgVelocity}</strong> upvotes/hr avg
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Content Ideas — main output */}
                    {r.ideas && r.ideas.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.violet, marginBottom: 12 }}>
                          ✦ Content Ideas Based on Your Research
                        </div>
                        {r.summary && (
                          <div style={{ padding: '14px 18px', background: dark ? 'rgba(255,255,255,0.04)' : '#f7f5ff', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: '0.83rem', color: C.sub, lineHeight: 1.6, marginBottom: 12 }}>
                            {r.summary}
                            {r.bestFormat && <span style={{ display: 'block', marginTop: 6, color: C.violet, fontWeight: 500 }}>Best format: {r.bestFormat}</span>}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {r.ideas.map((idea, i) => (
                            <div key={i} style={{ padding: '18px 20px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, position: 'relative' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: dark ? `${C.violet}20` : '#ede9fb', color: C.violet }}>
                                      {idea.format || 'post'}
                                    </span>
                                    {idea.pillar && (
                                      <span style={{ fontSize: '0.62rem', color: C.dim, background: dark ? 'rgba(255,255,255,0.05)' : '#f4f3f9', padding: '2px 7px', borderRadius: 6 }}>{idea.pillar}</span>
                                    )}
                                    {idea.emotionalTrigger && (
                                      <span style={{ fontSize: '0.6rem', color: C.cyan, background: dark ? `${C.cyan}12` : '#f0fdf9', padding: '2px 7px', borderRadius: 6 }}>↯ {idea.emotionalTrigger}</span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.fg, marginBottom: 6 }}>{idea.title}</div>
                                  <div style={{ fontSize: '0.83rem', color: C.sub, fontStyle: 'italic', lineHeight: 1.5, marginBottom: 8 }}>"{idea.hook}"</div>
                                  {idea.whyItWorks && (
                                    <div style={{ fontSize: '0.75rem', color: C.dim, lineHeight: 1.5 }}>↗ {idea.whyItWorks}</div>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setChatInput(`Create a ${idea.format || 'post'} about: ${idea.title}. Hook: "${idea.hook}". Use hashtags: ${r.hashtags}.`);
                                    setChatPlatform((['instagram','tiktok','linkedin'].includes(r.platform) ? r.platform : 'all') as Platform);
                                    setTab('brief');
                                  }}
                                  style={{ flexShrink: 0, padding: '7px 14px', background: C.violet, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                  Use this →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hashtags + peak times row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                      {/* Hashtags */}
                      {r.hashtags && (
                        <div style={{ padding: '18px 20px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.violet, marginBottom: 10 }}>Suggested Hashtags</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {r.hashtags.split(/[\s,]+/).filter(Boolean).map(tag => (
                              <span key={tag} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 10, background: dark ? 'rgba(167,139,250,0.1)' : '#ede9fb', color: C.violet, fontWeight: 500, fontFamily: C.mono }}>{tag.startsWith('#') ? tag : `#${tag}`}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Peak times */}
                      {r.algoPeakTimes && (
                        <div style={{ padding: '18px 20px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.green, marginBottom: 10 }}>Peak Post Times</div>
                          <div style={{ fontSize: '0.82rem', color: C.sub, lineHeight: 1.7 }}>{r.algoPeakTimes}</div>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })()}

              {/* Empty state */}
              {!researchResult && !researchLoading && !researchError && (
                <div style={{ padding: '60px 24px', textAlign: 'center', background: dark ? 'rgba(255,255,255,0.02)' : '#fafaf8', border: `1px dashed ${C.border}`, borderRadius: 14 }}>
                  <div style={{ fontSize: '2rem', opacity: 0.18, marginBottom: 14 }}>◉</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: C.sub, marginBottom: 8 }}>Enter a topic to begin research</div>
                  <div style={{ fontSize: '0.76rem', color: C.dim, lineHeight: 1.8 }}>
                    The Trend Researcher will surface Reddit discussions, algorithm signals,<br />hashtag strategy, and optimal timing — all before you generate anything.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MODELS TAB ── */}
          {tab === 'models' && (
            <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 48 }}>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: C.fg, marginBottom: 6, letterSpacing: '-0.01em' }}>Visual AI Library</div>
                <div style={{ fontSize: '0.82rem', color: C.dim, lineHeight: 1.7, maxWidth: 620 }}>
                  {MODEL_LIBRARY.filter(m=>m.type==='image').length} image models · {MODEL_LIBRARY.filter(m=>m.type==='video').length} video models. Click a card to read full specs. Select a model to use it when briefing your team.
                </div>
              </div>

              {/* Filter bar */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
                {(['all','image','video'] as const).map(t => {
                  const count = t === 'all' ? MODEL_LIBRARY.length : MODEL_LIBRARY.filter(m=>m.type===t).length;
                  const active = modelTypeFilter === t;
                  return (
                    <button key={t} onClick={() => setModelTypeFilter(t)}
                      style={{ padding: '7px 18px', background: active ? C.violet : (dark ? 'rgba(255,255,255,0.05)' : '#f4f3f9'), border: `1px solid ${active ? C.violet : C.border}`, borderRadius: 20, color: active ? '#fff' : C.sub, fontFamily: C.body, fontSize: '0.78rem', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all .15s' }}>
                      {t === 'all' ? `All (${count})` : t === 'image' ? `◆ Images (${count})` : `▶ Video (${count})`}
                    </button>
                  );
                })}
              </div>

              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {(modelTypeFilter === 'all' ? MODEL_LIBRARY : MODEL_LIBRARY.filter(m => m.type === modelTypeFilter)).map(model => {
                  const isSelected = model.id === selectedModel;
                  return (
                    <div key={model.id} style={{ background: isSelected ? (dark ? `${C.violet}12` : '#f5f0ff') : C.bgCard, border: `1.5px solid ${isSelected ? C.violet : C.border}`, borderRadius: 14, overflow: 'hidden', transition: 'all .18s', boxShadow: isSelected ? `0 4px 20px ${C.violet}22` : C.shadow }}>

                      {/* Sample image */}
                      <div style={{ position: 'relative', height: 170, overflow: 'hidden', background: '#000' }}>
                        <img src={model.sample} alt={model.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
                        <div style={{ position: 'absolute', top: 8, left: 8, fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: model.type === 'video' ? `${C.cyan}dd` : `${C.violet}dd`, color: '#fff', padding: '3px 8px', borderRadius: 5 }}>
                          {model.type === 'video' ? '▶ Video' : '◆ Image'}
                        </div>
                        {isSelected && (
                          <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', fontWeight: 700 }}>✓</div>
                        )}
                        <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{model.name}</div>
                          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.65)' }}>{model.provider}</div>
                        </div>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '14px 16px 16px' }}>
                        <div style={{ fontSize: '0.72rem', color: C.dim, marginBottom: 10, lineHeight: 1.4 }}>{model.tagline}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 600, color: model.speed === 'fast' ? C.green : model.speed === 'medium' ? C.yellow : C.orange, background: `${model.speed === 'fast' ? C.green : model.speed === 'medium' ? C.yellow : C.orange}18`, padding: '2px 7px', borderRadius: 10, textTransform: 'capitalize' }}>{model.speed}</span>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[1,2,3,4,5].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i <= model.quality ? C.violet : (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }} />)}
                          </div>
                          <span style={{ fontSize: '0.58rem', color: C.dim }}>quality</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: C.sub, lineHeight: 1.6, marginBottom: 12 }}>{model.description}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                          {model.bestFor.map(tag => <span key={tag} style={{ fontSize: '0.62rem', padding: '3px 8px', borderRadius: 8, background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: C.dim }}>{tag}</span>)}
                        </div>
                        <button onClick={() => { setSelectedModel(model.id as ModelId); showToast(`${model.name} selected — your next brief will use this model`, 'success'); }}
                          style={{ width: '100%', padding: '9px', background: isSelected ? C.violet : (dark ? 'rgba(255,255,255,0.05)' : '#f4f3f9'), border: `1px solid ${isSelected ? C.violet : C.border}`, borderRadius: 8, color: isSelected ? '#fff' : C.sub, fontFamily: C.body, fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
                          {isSelected ? '✓ Active model' : 'Use this model'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── AGENTS TAB ── */}
          {tab === 'agents' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: C.fg, marginBottom: 4 }}>Agent Team</div>
                <div style={{ fontSize: '0.82rem', color: C.dim, lineHeight: 1.7, maxWidth: 600 }}>
                  8 specialist agents managed by the Orchestrator. Use Brief Orchestrator to activate them. Each agent has deep platform expertise and reports back before content reaches your queue.
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                {AGENTS.map(a => <AgentCard key={a.id} agent={a} C={C} dark={dark} />)}
              </div>
            </div>
          )}

          {/* ── CALENDAR TAB ── */}
          {tab === 'calendar' && (
            <CalendarView records={records} f={f} onLoad={loadRecords} platform={platform} C={C} dark={dark}
              onScheduleRecord={r => { setSchedModal({ record: r }); setSchedDate(''); }} />
          )}
        </main>
      </div>

      {/* Detail panel */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={() => setDetail(null)}>
          <div style={{ width: 520, background: C.bgMid, height: '100%', overflowY: 'auto', padding: 28, boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', borderLeft: `1px solid ${C.borderMid}` }} onClick={e => e.stopPropagation()}>
            <DetailPanel r={detail} f={f} score={score} scoreColor={scoreColor} C={C} STATUS_COLOR={STATUS_COLOR} PLATFORM_COLOR={PLATFORM_COLOR}
              onApprove={() => updateStatus(detail.id, 'approved')}
              onReject={() => updateStatus(detail.id, 'rejected')}
              onSchedule={() => { setSchedModal({ record: detail }); setSchedDate(''); }}
              onClose={() => setDetail(null)}
              onDelete={() => setConfirmDelete(detail)}
            />
          </div>
        </div>
      )}

      {/* Schedule modal — smart with algorithm-recommended times */}
      {schedModal && (() => {
        const recPlat = (schedModal.record.fields['Platform'] as string ?? 'instagram').toLowerCase() as 'instagram' | 'tiktok' | 'linkedin';
        const recHook = (schedModal.record.fields['Hook'] as string ?? schedModal.record.fields['Caption'] as string ?? '').slice(0, 90);
        const slots = OPTIMAL_TIMES[recPlat] ?? OPTIMAL_TIMES.instagram;
        const platColor = recPlat === 'instagram' ? C.pink : recPlat === 'tiktok' ? C.cyan : C.teal;
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={() => setSchedModal(null)}>
            <div style={{ width: 520, background: C.bgMid, border: `1px solid ${C.borderMid}`, borderRadius: 18, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: platColor, background: `${platColor}18`, padding: '3px 9px', borderRadius: 20 }}>
                      {PLATFORM_ICON[recPlat]} {recPlat}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: C.fg, letterSpacing: '-0.01em' }}>Schedule Post</div>
                </div>
                <button onClick={() => setSchedModal(null)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: 'pointer', padding: '6px 10px', fontFamily: C.body, fontSize: '0.78rem' }}>✕ Close</button>
              </div>

              {/* Content preview */}
              {recHook && (
                <div style={{ padding: '12px 14px', background: dark ? 'rgba(255,255,255,0.03)' : '#f8f7ff', border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 20 }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 600, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Hook</div>
                  <div style={{ fontSize: '0.85rem', color: C.sub, lineHeight: 1.5, fontStyle: 'italic' }}>"{recHook}{recHook.length >= 90 ? '…' : ''}"</div>
                </div>
              )}

              {/* AI-Recommended Times */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.violet }}>◉ Pick a time</span>
                  <span style={{ fontSize: '0.65rem', color: C.dim }}>
                    {recPlat === 'instagram' ? 'DM-share windows · Explore algorithm' : recPlat === 'tiktok' ? 'FYP peak times' : 'LinkedIn dwell signals'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: C.violet, marginBottom: 10, opacity: 0.7 }}>
                  Tap a slot below to select it
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {slots.map((slot, i) => {
                    const val = nextOccurrence(slot.day, slot.hour, slot.minute);
                    const selected = schedDate === val;
                    return (
                      <button key={i} onClick={() => setSchedDate(selected ? '' : val)}
                        style={{
                          padding: '14px 16px',
                          background: selected
                            ? `linear-gradient(135deg, ${C.violet}22, ${C.pink}11)`
                            : dark ? 'rgba(255,255,255,0.03)' : '#f8f8fb',
                          border: `2px solid ${selected ? C.violet : C.border}`,
                          borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                          transition: 'all .15s', fontFamily: C.body,
                          boxShadow: selected ? `0 0 0 3px ${C.violet}22` : 'none',
                          position: 'relative', overflow: 'hidden',
                        }}>
                        {selected && (
                          <div style={{ position: 'absolute', top: 8, right: 10, width: 18, height: 18, borderRadius: '50%', background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 700 }}>✓</span>
                          </div>
                        )}
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: selected ? C.violet : C.fg, marginBottom: 4 }}>{slot.label}</div>
                        <div style={{ fontSize: '0.67rem', color: selected ? C.sub : C.dim, lineHeight: 1.4 }}>{slot.reason}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected time confirmation */}
              {schedDate && (
                <div style={{ padding: '10px 14px', background: `${C.violet}10`, border: `1px solid ${C.violet}33`, borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.75rem', color: C.violet, fontWeight: 700 }}>✓ Selected:</span>
                  <span style={{ fontSize: '0.78rem', color: C.sub, flex: 1 }}>
                    {new Date(schedDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button onClick={() => setSchedDate('')} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '0.72rem', padding: '2px 6px', fontFamily: C.body }}>✕ Clear</button>
                </div>
              )}

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: '0.62rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>or pick a custom time</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* Custom datetime */}
              <input type="datetime-local" value={schedDate} onChange={e => setSchedDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: dark ? 'rgba(255,255,255,0.04)' : '#f8f8fb', border: `1px solid ${C.border}`, borderRadius: 8, color: C.fg, fontFamily: C.body, fontSize: '0.85rem', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setSchedModal(null)} style={{ flex: 1, padding: '11px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 9, color: C.dim, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button onClick={schedulePost} disabled={!schedDate}
                  style={{ flex: 2, padding: '11px', background: schedDate ? C.teal : (dark ? 'rgba(255,255,255,0.04)' : '#f0f0f5'), border: 'none', borderRadius: 9, color: schedDate ? '#fff' : C.dim, fontFamily: C.body, fontSize: '0.83rem', fontWeight: 600, cursor: schedDate ? 'pointer' : 'default', transition: 'all .15s' }}>
                  {schedDate ? 'Schedule via Blotato →' : 'Select a time above ↑'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, backdropFilter: 'blur(4px)' }}
          onClick={() => setConfirmDelete(null)}>
          <div style={{ width: 400, background: C.bgMid, border: `1px solid ${C.borderMid}`, borderRadius: 16, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: C.fg, marginBottom: 8 }}>Delete this content?</div>
            <div style={{ fontSize: '0.82rem', color: C.dim, lineHeight: 1.7, marginBottom: 6 }}>
              <strong style={{ color: C.sub }}>"{(confirmDelete.fields['Hook'] || confirmDelete.fields['Caption'] || 'This record') as string}"</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: C.dim, marginBottom: 24 }}>This will permanently delete it from Airtable. This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '10px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => deleteRecord(confirmDelete.id)} style={{ flex: 1, padding: '10px', background: C.red, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Delete permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* Model Library Modal */}
      {modelLibraryOpen && (
        <ModelLibraryModal
          selectedModel={selectedModel}
          onSelect={(id) => { setSelectedModel(id as ModelId); setModelLibraryOpen(false); }}
          onClose={() => setModelLibraryOpen(false)}
          C={C} dark={dark}
          typeFilter={modelTypeFilter}
          onTypeFilter={setModelTypeFilter}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: C.bgMid, border: `1px solid ${toast.type === 'error' ? C.red : C.borderMid}`, borderRadius: 10, padding: '10px 20px', fontSize: '0.82rem', color: toast.type === 'error' ? C.red : C.fg, zIndex: 300, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: C.body }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODEL LIBRARY MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ModelLibraryModal({ selectedModel, onSelect, onClose, C, dark, typeFilter, onTypeFilter }: {
  selectedModel: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  C: typeof LIGHT; dark: boolean;
  typeFilter: 'all' | ModelType;
  onTypeFilter: (t: 'all' | ModelType) => void;
}) {
  const [hovered,  setHovered]  = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const filtered = typeFilter === 'all' ? MODEL_LIBRARY : MODEL_LIBRARY.filter(m => m.type === typeFilter);

  const QualityDots = ({ n }: { n: number }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i <= n ? C.violet : (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }} />
      ))}
    </div>
  );

  const speedColor = (s: string) => s === 'fast' ? C.green : s === 'medium' ? C.yellow : C.orange;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(6px)', padding: 20 }}
      onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 980, maxHeight: '92vh', background: C.bgMid, border: `1px solid ${C.borderMid}`, borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '22px 28px 0', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: C.fg, letterSpacing: '-0.01em', marginBottom: 4 }}>Visual AI Library</div>
              <div style={{ fontSize: '0.78rem', color: C.dim }}>Choose the model that generates your visuals. Click any card to read full specs.</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, color: C.dim, cursor: 'pointer', padding: '6px 12px', fontFamily: C.body, fontSize: '0.78rem', flexShrink: 0, marginTop: 2 }}>✕ Close</button>
          </div>

          {/* Type filter tabs */}
          <div style={{ display: 'flex', gap: 4, paddingBottom: 0 }}>
            {(['all', 'image', 'video'] as const).map(t => (
              <button key={t} onClick={() => onTypeFilter(t)}
                style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${typeFilter === t ? C.violet : 'transparent'}`, color: typeFilter === t ? C.violet : C.dim, fontFamily: C.body, fontSize: '0.78rem', fontWeight: typeFilter === t ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize', transition: 'all .15s' }}>
                {t === 'all' ? `All (${MODEL_LIBRARY.length})` : t === 'image' ? `Images (${MODEL_LIBRARY.filter(m=>m.type==='image').length})` : `Video (${MODEL_LIBRARY.filter(m=>m.type==='video').length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ overflowY: 'auto', padding: '20px 28px 28px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {filtered.map(model => {
              const isSelected = model.id === selectedModel;
              const isHovered  = hovered === model.id;
              const isExpanded = expanded === model.id;

              return (
                <div key={model.id}
                  onMouseEnter={() => setHovered(model.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isSelected ? (dark ? `${C.violet}14` : '#f5f0ff') : C.bgCard,
                    border: `1.5px solid ${isSelected ? C.violet : isHovered ? C.borderStrong : C.border}`,
                    borderRadius: 14, overflow: 'hidden', transition: 'all .18s',
                    boxShadow: isHovered || isSelected ? '0 6px 24px rgba(0,0,0,0.12)' : 'none',
                    cursor: 'pointer',
                    transform: isHovered && !isSelected ? 'translateY(-2px)' : 'none',
                  }}>

                  {/* Sample image */}
                  <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#000' }}
                    onClick={() => onSelect(model.id)}>
                    <img
                      src={model.sample}
                      alt={model.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s', transform: isHovered ? 'scale(1.04)' : 'scale(1)', filter: isSelected ? 'none' : 'brightness(0.88)' }}
                    />
                    {/* Overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: isHovered ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)', transition: 'background .2s' }} />

                    {/* Type badge */}
                    <div style={{ position: 'absolute', top: 8, left: 8, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: model.type === 'video' ? `${C.cyan}cc` : `${C.violet}cc`, color: '#fff', padding: '3px 8px', borderRadius: 5, backdropFilter: 'blur(4px)' }}>
                      {model.type === 'video' ? '▶ Video' : '◆ Image'}
                    </div>

                    {/* Selected tick */}
                    {isSelected && (
                      <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff', fontWeight: 700 }}>✓</div>
                    )}

                    {/* Provider chip at bottom */}
                    <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: '0.6rem', color: 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.5)', padding: '2px 7px', borderRadius: 5, backdropFilter: 'blur(4px)' }}>
                      {model.provider}
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: C.fg, marginBottom: 2 }}>{model.name}</div>
                        <div style={{ fontSize: '0.7rem', color: C.dim, lineHeight: 1.4 }}>{model.tagline}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: speedColor(model.speed), background: `${speedColor(model.speed)}18`, padding: '2px 7px', borderRadius: 10, textTransform: 'capitalize' }}>{model.speed}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: '0.6rem', color: C.dim }}>Quality</span>
                      <QualityDots n={model.quality} />
                    </div>

                    {/* Expand/collapse details */}
                    <button onClick={e => { e.stopPropagation(); setExpanded(expanded === model.id ? null : model.id); }}
                      style={{ background: 'none', border: 'none', padding: 0, color: C.dim, fontFamily: C.body, fontSize: '0.68rem', cursor: 'pointer', marginBottom: isExpanded ? 10 : 0 }}>
                      {isExpanded ? '▴ Less' : '▾ Details & best for'}
                    </button>

                    {isExpanded && (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: C.sub, lineHeight: 1.65, marginBottom: 10 }}>{model.description}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {model.bestFor.map(tag => (
                            <span key={tag} style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: 8, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: C.sub }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Select button */}
                    <button onClick={() => onSelect(model.id)}
                      style={{ marginTop: 12, width: '100%', padding: '8px', background: isSelected ? C.violet : (dark ? 'rgba(255,255,255,0.05)' : '#f4f3f9'), border: `1px solid ${isSelected ? C.violet : C.border}`, borderRadius: 8, color: isSelected ? '#fff' : C.sub, fontFamily: C.body, fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
                      {isSelected ? '✓ Selected' : 'Use this model'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ContentCard({ r, f, score, scoreColor, C, STATUS_COLOR, PLATFORM_COLOR, onClick, onApprove, onReject, onSchedule, onDelete }: {
  r: AirtableRecord; f: any; score: any; scoreColor: any; C: typeof LIGHT;
  STATUS_COLOR: Record<string, string>; PLATFORM_COLOR: Record<string, string>;
  onClick: () => void; onApprove: () => void; onReject: () => void; onSchedule: () => void; onDelete: () => void;
}) {
  const plat      = (f(r, 'Platform') as string)?.toLowerCase() ?? '';
  const status    = (f(r, 'Status')   as string)?.toLowerCase() ?? '';
  const sc        = score(r);
  const preview   = f(r, 'Hook') || f(r, 'Caption') || f(r, 'Script') || '';
  const visualUrl = f(r, 'Visual URL') as string;

  return (
    <div onClick={onClick} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px', cursor: 'pointer', transition: 'all .15s', boxShadow: C.shadow }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadow; }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${PLATFORM_COLOR[plat] ?? C.violet}, transparent)`, borderRadius: 2, marginBottom: 14 }} />

      {/* Visual preview — shown if Kie.ai has generated an image/video */}
      {visualUrl && (
        <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', background: '#000', position: 'relative' }}>
          {visualUrl.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={visualUrl} muted playsInline style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
          ) : (
            <img src={visualUrl} alt="Visual" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
          )}
          <div style={{ position: 'absolute', bottom: 6, right: 6, fontSize: '0.6rem', fontWeight: 600, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 7px', borderRadius: 5 }}>
            {visualUrl.match(/\.(mp4|webm|mov)$/i) ? '▶ Video' : '◆ Visual'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: PLATFORM_COLOR[plat] ?? C.dim, background: `${PLATFORM_COLOR[plat] ?? C.dim}18`, padding: '3px 8px', borderRadius: 5 }}>
            {PLATFORM_ICON[plat]} {plat}
          </span>
          {f(r, 'Content Type') && <span style={{ fontSize: '0.65rem', color: C.dim }}>{f(r, 'Content Type')}</span>}
        </div>
        {sc > 0 && <span style={{ fontSize: '0.88rem', fontWeight: 700, color: scoreColor(sc), fontFamily: C.mono }}>{sc.toFixed(1)}</span>}
      </div>
      <div style={{ fontSize: '0.85rem', color: C.sub, lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {preview || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>No preview</span>}
      </div>
      {f(r, 'Hashtags') && <div style={{ fontSize: '0.72rem', color: C.violet, marginBottom: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f(r, 'Hashtags')}</div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[status] ?? C.dim }} />
          <span style={{ fontSize: '0.68rem', color: C.dim, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{status}</span>
        </div>
        {status === 'review' && (
          <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
            <ActionBtn label="✓ Approve" color={C.green}  onClick={onApprove} />
            <ActionBtn label="✗ Reject"  color={C.red}    onClick={onReject} />
            <ActionBtn label="Schedule"  color={C.teal}   onClick={onSchedule} />
            <ActionBtn label="🗑" color={C.dim} onClick={onDelete} />
          </div>
        )}
        {status === 'approved' && (
          <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
            <ActionBtn label="Schedule →" color={C.teal} onClick={onSchedule} />
            <ActionBtn label="🗑" color={C.dim} onClick={onDelete} />
          </div>
        )}
        {(status === 'rejected' || status === 'draft') && (
          <div onClick={e => e.stopPropagation()}>
            <ActionBtn label="🗑 Delete" color={C.dim} onClick={onDelete} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '4px 10px', background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 6, color, fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer' }}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT CARD
// ─────────────────────────────────────────────────────────────────────────────
function AgentCard({ agent, C, dark }: { agent: typeof AGENTS[number]; C: typeof LIGHT; dark: boolean }) {
  const agentColors = [C.violet, C.pink, C.cyan, C.teal, C.orange, C.yellow, C.green, '#c084fc'];
  const color = agentColors[AGENTS.findIndex(a => a.id === agent.id) % agentColors.length];
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px', boxShadow: C.shadow }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 2, marginBottom: 16 }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ color, fontSize: '1rem' }}>{agent.icon}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: C.fg }}>{agent.name}</span>
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: 500, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{agent.role}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
          <span style={{ fontSize: '0.65rem', color: C.dim }}>Idle</span>
        </div>
      </div>
      <div style={{ fontSize: '0.82rem', color: C.sub, lineHeight: 1.65, marginBottom: 14 }}>{agent.description}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {agent.skills.map(s => (
          <span key={s} style={{ fontSize: '0.65rem', color, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 5, padding: '3px 8px' }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────
function DetailPanel({ r, f, score, scoreColor, C, STATUS_COLOR, PLATFORM_COLOR, onApprove, onReject, onSchedule, onClose, onDelete }: {
  r: AirtableRecord; f: any; score: any; scoreColor: any; C: typeof LIGHT;
  STATUS_COLOR: Record<string, string>; PLATFORM_COLOR: Record<string, string>;
  onApprove: () => void; onReject: () => void; onSchedule: () => void; onClose: () => void; onDelete: () => void;
}) {
  const plat      = (f(r, 'Platform') as string)?.toLowerCase() ?? '';
  const status    = (f(r, 'Status')   as string)?.toLowerCase() ?? '';
  const sc        = score(r);
  const visualUrl = f(r, 'Visual URL') as string;
  const isVideo   = visualUrl?.match(/\.(mp4|webm|mov)$/i);

  const Row = ({ label, value }: { label: string; value: string }) => value ? (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: '0.85rem', color: C.sub, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  ) : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: PLATFORM_COLOR[plat] ?? C.dim, background: `${PLATFORM_COLOR[plat] ?? C.dim}18`, padding: '3px 8px', borderRadius: 5 }}>
            {PLATFORM_ICON[plat]} {plat}
          </span>
          {sc > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 700, color: scoreColor(sc), fontFamily: C.mono }}>{sc.toFixed(1)}</span>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: '1.1rem', fontFamily: C.body }}>✕</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[status] ?? C.dim }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: STATUS_COLOR[status] ?? C.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{status}</span>
      </div>

      {/* ── Visual preview ── */}
      {visualUrl ? (
        <div style={{ marginBottom: 22, borderRadius: 12, overflow: 'hidden', background: '#000', position: 'relative' }}>
          {isVideo ? (
            <video src={visualUrl} controls playsInline style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }} />
          ) : (
            <img src={visualUrl} alt="Generated visual" style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block' }} />
          )}
          <a href={visualUrl} target="_blank" rel="noopener noreferrer"
            style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(0,0,0,0.65)', color: '#fff', padding: '4px 9px', borderRadius: 6, textDecoration: 'none', backdropFilter: 'blur(4px)' }}>
            Open full size ↗
          </a>
        </div>
      ) : (
        <div style={{ marginBottom: 22, padding: '20px', background: 'rgba(124,58,237,0.05)', border: `1px dashed ${C.border}`, borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: C.dim }}>Visual not generated yet</div>
          <div style={{ fontSize: '0.68rem', color: C.dim, marginTop: 4, opacity: 0.7 }}>Kie.ai may still be processing — refresh in a moment</div>
        </div>
      )}

      {/* ── Decision buttons pinned at top for review items ── */}
      {status === 'review' && (
        <div style={{ marginBottom: 24, padding: '16px', background: 'rgba(124,58,237,0.05)', border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={onApprove} style={{ flex: 1, padding: '11px', background: C.green, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>✓ Approve</button>
            <button onClick={onReject}  style={{ flex: 1, padding: '11px', background: 'none', border: `1px solid ${C.red}`, borderRadius: 8, color: C.red, fontFamily: C.body, fontSize: '0.82rem', cursor: 'pointer' }}>✗ Reject</button>
            <button onClick={onSchedule} style={{ flex: 1, padding: '11px', background: C.teal, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Schedule →</button>
          </div>
          <button onClick={onDelete} style={{ width: '100%', padding: '8px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: C.dim, fontFamily: C.body, fontSize: '0.74rem', cursor: 'pointer' }}>🗑 Delete this content</button>
        </div>
      )}
      {status === 'approved' && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onSchedule} style={{ width: '100%', padding: '11px', background: C.teal, border: 'none', borderRadius: 8, color: '#fff', fontFamily: C.body, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Schedule via Blotato →</button>
          <button onClick={onDelete} style={{ width: '100%', padding: '8px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: C.dim, fontFamily: C.body, fontSize: '0.74rem', cursor: 'pointer' }}>🗑 Delete this content</button>
        </div>
      )}

      <Row label="Hook"          value={f(r, 'Hook')} />
      <Row label="Caption"       value={f(r, 'Caption')} />
      <Row label="Script"        value={f(r, 'Script')} />
      <Row label="Slides"        value={f(r, 'Slides')} />
      <Row label="Hashtags"      value={f(r, 'Hashtags')} />
      <Row label="Visual Prompt" value={f(r, 'Visual Prompt')} />
      <Row label="Manager Notes" value={f(r, 'Manager Notes')} />
      <Row label="Scheduled"     value={f(r, 'Scheduled At')} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR VIEW
// ─────────────────────────────────────────────────────────────────────────────
function CalendarView({ records, f, onLoad, platform, C, dark, onScheduleRecord }: {
  records: AirtableRecord[]; f: any; onLoad: () => void; platform: Platform; C: typeof LIGHT; dark: boolean;
  onScheduleRecord: (r: AirtableRecord) => void;
}) {
  const [offset, setOffset] = React.useState(0);
  const now   = new Date();
  const base  = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year  = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monthName = base.toLocaleString('default', { month: 'long', year: 'numeric' });
  const pad = (n: number) => String(n).padStart(2, '0');

  // Build map: date string → records scheduled that day
  const dayMap: Record<string, AirtableRecord[]> = {};
  records.filter(r => f(r, 'Scheduled At')).forEach(r => {
    const d = (f(r, 'Scheduled At') as string).slice(0, 10);
    if (!dayMap[d]) dayMap[d] = [];
    dayMap[d].push(r);
  });

  const PLAT_COLOR: Record<string, string> = { instagram: C.pink, tiktok: C.cyan, linkedin: C.teal };

  // Optimal times to show on calendar as "suggested" markers
  const suggestedDays = [2, 4, 5]; // Tue, Thu, Fri — strong for all platforms

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setOffset(o => o - 1)} style={{ padding: '6px 10px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: C.sub, fontFamily: C.body, cursor: 'pointer', fontSize: '0.82rem' }}>‹</button>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: C.fg, minWidth: 180, textAlign: 'center' }}>{monthName}</div>
          <button onClick={() => setOffset(o => o + 1)} style={{ padding: '6px 10px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: C.sub, fontFamily: C.body, cursor: 'pointer', fontSize: '0.82rem' }}>›</button>
          {offset !== 0 && <button onClick={() => setOffset(0)} style={{ padding: '5px 10px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: C.violet, fontFamily: C.body, cursor: 'pointer', fontSize: '0.72rem' }}>Today</button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Legend */}
          {Object.entries(PLAT_COLOR).map(([p, col]) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: col }} />
              <span style={{ fontSize: '0.62rem', color: C.dim, textTransform: 'capitalize' }}>{p}</span>
            </div>
          ))}
          <div style={{ width: 1, height: 12, background: C.border }} />
          <button onClick={onLoad} style={{ padding: '6px 12px', background: 'none', border: `1px solid ${C.border}`, borderRadius: 7, color: C.sub, fontFamily: C.body, fontSize: '0.72rem', cursor: 'pointer' }}>↺ Refresh</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {names.map(n => (
          <div key={n} style={{ padding: '6px 8px', textAlign: 'center', fontSize: '0.62rem', fontWeight: 600, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{n}</div>
        ))}
        {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1;
          const key = `${year}-${pad(month + 1)}-${pad(d)}`;
          const dayRecords = dayMap[key] ?? [];
          const isToday = d === now.getDate() && offset === 0;
          const dayOfWeek = new Date(year, month, d).getDay();
          const isSuggestedDay = suggestedDays.includes(dayOfWeek);
          const isPast = new Date(year, month, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return (
            <div key={d} style={{ padding: '8px', minHeight: 72, background: isToday ? (dark ? `${C.violet}18` : '#f5f3ff') : C.bgCard, border: `1px solid ${isToday ? C.violet+'44' : C.border}`, borderRadius: 8, position: 'relative', opacity: isPast ? 0.55 : 1, transition: 'all .15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: isToday ? 700 : 400, color: isToday ? C.violet : C.sub, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isToday ? `${C.violet}22` : 'transparent' }}>{d}</div>
                {isSuggestedDay && !isPast && dayRecords.length === 0 && (
                  <div title="AI-recommended posting day" style={{ fontSize: '0.55rem', color: C.violet, opacity: 0.5 }}>◉</div>
                )}
              </div>
              {/* Scheduled content dots */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayRecords.slice(0, 3).map(r => {
                  const p = (f(r, 'Platform') as string ?? '').toLowerCase();
                  const col = PLAT_COLOR[p] ?? C.violet;
                  return (
                    <div key={r.id} onClick={() => onScheduleRecord(r)}
                      style={{ fontSize: '0.58rem', padding: '2px 5px', borderRadius: 3, background: `${col}22`, color: col, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', border: `1px solid ${col}33` }}>
                      {PLATFORM_ICON[p]} {f(r, 'Hook') ? (f(r, 'Hook') as string).slice(0, 18) + '…' : p}
                    </div>
                  );
                })}
                {dayRecords.length > 3 && <div style={{ fontSize: '0.58rem', color: C.dim }}>+{dayRecords.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Algorithm posting cadence tip */}
      <div style={{ marginTop: 16, padding: '12px 16px', background: dark ? 'rgba(124,58,237,0.06)' : '#f5f3ff', border: `1px solid ${C.violet}22`, borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ color: C.violet, fontSize: '0.8rem', flexShrink: 0, marginTop: 1 }}>◉</span>
        <div style={{ fontSize: '0.72rem', color: C.dim, lineHeight: 1.6 }}>
          <span style={{ color: C.sub, fontWeight: 600 }}>Optimal cadence: </span>
          Instagram 3-5×/week (Tue/Wed/Fri) · TikTok 1-4×/day (Tue 9am, Thu 12pm) · LinkedIn 3-5×/week (Tue/Wed/Thu 8am). Days marked with <span style={{ color: C.violet }}>◉</span> are high-engagement windows.
        </div>
      </div>
    </div>
  );
}
