'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Check, ChevronRight, Upload, X } from 'lucide-react';

const C = {
  bg: '#08080F', surface: '#0F0F1A', elevated: '#141428',
  border: '#1A1A30', borderAccent: '#2D2D50',
  purple: '#7C3AED', purpleLight: '#9F67FF',
  cyan: '#06B6D4', fg: '#F1F0FF', sub: '#8B8BA8', dim: '#4A4A6A',
};

const PLATFORMS = ['Instagram', 'LinkedIn', 'Twitter/X', 'TikTok', 'Facebook', 'YouTube', 'Pinterest'];
const GOALS = ['Awareness', 'Leads', 'Sales', 'Followers', 'Engagement'];
const TONES = ['Professional', 'Casual', 'Humorous', 'Inspirational', 'Educational'];
const FREQUENCIES = ['Daily', '3x/week', 'Weekly'];

interface FormData {
  brandName: string;
  productOrService: string;
  targetAudience: string;
  platforms: string[];
  goal: string;
  tone: string;
  competitors: string;
  postingFrequency: string;
  referenceImages: File[];
  contentFormats: string[];
  imageModel: string;
}

const INITIAL: FormData = {
  brandName: '', productOrService: '', targetAudience: '',
  platforms: [], goal: '', tone: '', competitors: '',
  postingFrequency: '', referenceImages: [],
  contentFormats: [], imageModel: 'flux-kontext',
};

const CONTENT_FORMATS = [
  { id: 'carousel',  label: 'Carousels',        desc: 'Multi-slide educational posts', icon: '🎠' },
  { id: 'reel',      label: 'Reels & Shorts',   desc: 'Short videos 15–60 seconds',    icon: '🎬' },
  { id: 'static',    label: 'Static Posts',     desc: 'Single image + caption',         icon: '📸' },
  { id: 'story',     label: 'Stories',          desc: 'Ephemeral vertical format',      icon: '◎' },
  { id: 'longform',  label: 'Long-form',        desc: 'Articles, threads, documents',   icon: '📝' },
];

const IMAGE_MODELS = [
  { id: 'flux-kontext',   label: 'FLUX Pro',      desc: 'Photorealistic · lifestyle & product shots',  badge: 'Default' },
  { id: 'gpt-image',      label: 'GPT-Image-1',   desc: 'Versatile · follows complex instructions',   badge: 'OpenAI' },
  { id: 'ideogram',       label: 'Ideogram v3',   desc: 'Text-in-image · quotes, infographics',        badge: 'Text' },
  { id: 'seedream',       label: 'Seedream 3.0',  desc: '4K ultra-detail · high resolution',          badge: '4K' },
  { id: 'recraft',        label: 'Recraft v3',    desc: 'Design-oriented · brand assets, vectors',    badge: 'Design' },
  { id: 'dalle3',         label: 'DALL-E 3',      desc: 'Artistic · cinematic & painterly',           badge: 'Creative' },
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
      <motion.div
        style={{ height: 3, background: C.purple, transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: step / total }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function StepLabel({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 24, fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: C.dim, letterSpacing: '0.1em' }}>
      {step} / {total}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline = false }: {
  value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  const style: React.CSSProperties = {
    width: '100%', maxWidth: 560,
    background: C.elevated, border: `1px solid ${C.border}`,
    borderRadius: 10, color: C.fg,
    fontFamily: 'var(--font-inter)', fontSize: '1rem', fontWeight: 300,
    outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
    padding: '14px 18px', boxSizing: 'border-box',
  };

  return multiline ? (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      style={{ ...style, resize: 'vertical', lineHeight: 1.7 }}
      onFocus={e => { e.target.style.borderColor = C.purple; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
    />
  ) : (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={style}
      onFocus={e => { e.target.style.borderColor = C.purple; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function ChipSelect({ options, selected, onToggle, single = false }: {
  options: string[]; selected: string | string[]; onToggle: (v: string) => void; single?: boolean;
}) {
  const isSelected = (opt: string) =>
    single ? selected === opt : (selected as string[]).includes(opt);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, maxWidth: 600 }}>
      {options.map(opt => {
        const active = isSelected(opt);
        return (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(opt)}
            style={{
              padding: '9px 18px', borderRadius: 10,
              border: `1px solid ${active ? C.purple : C.border}`,
              background: active ? `${C.purple}20` : C.elevated,
              color: active ? C.purpleLight : C.sub,
              fontFamily: 'var(--font-inter)', fontSize: '0.85rem', fontWeight: active ? 500 : 300,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s',
              boxShadow: active ? `0 0 0 1px ${C.purple}60` : 'none',
            }}
          >
            {active && <Check size={12} color={C.purpleLight} />}
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

function ImageDropzone({ files, onAdd, onRemove }: {
  files: File[]; onAdd: (files: File[]) => void; onRemove: (i: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) && f.size <= 10 * 1024 * 1024,
    );
    onAdd(valid.slice(0, 5 - files.length));
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `1px dashed ${dragging ? C.purple : C.border}`,
          borderRadius: 16, padding: '32px',
          textAlign: 'center', cursor: 'pointer',
          background: dragging ? `${C.purple}08` : C.elevated,
          transition: 'all 0.15s',
        }}
      >
        <Upload size={24} color={C.dim} style={{ marginBottom: 12 }} />
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.88rem', color: C.sub }}>
          Drag &amp; drop images or <span style={{ color: C.purple }}>browse</span>
        </div>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.72rem', color: C.dim, marginTop: 6 }}>
          JPG, PNG, WebP — up to 10MB each, max 5 images
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          {files.map((f, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={URL.createObjectURL(f)} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', border: `1px solid ${C.border}` }} />
              <button
                onClick={() => onRemove(i)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#EF4444', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={10} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { field: 'brandName',        question: 'What is your brand or product name?',  subtitle: 'This will be used throughout all your AI-generated content.' },
  { field: 'productOrService', question: 'What are you promoting?',               subtitle: 'Product launch, service, content, event, or personal brand — be specific.' },
  { field: 'targetAudience',   question: 'Who is your target audience?',          subtitle: 'Describe their age range, interests, and pain points.' },
  { field: 'platforms',        question: 'Which platforms are you targeting?',    subtitle: 'Select all that apply. Your AI team generates format-native content for each.' },
  { field: 'contentFormats',   question: 'What content formats do you want?',     subtitle: 'Your AI will generate scripts and copy in these formats for every platform.' },
  { field: 'goal',             question: 'What is your main goal?',               subtitle: 'This shapes the entire campaign strategy.' },
  { field: 'tone',             question: 'What tone fits your brand?',            subtitle: 'Your content will be written in this voice across all platforms.' },
  { field: 'competitors',      question: 'Any competitors or accounts you admire?', subtitle: 'Optional — the research agent will analyse gaps and opportunities.' },
  { field: 'postingFrequency', question: 'How often do you want to post?',        subtitle: 'Your calendar will be pre-filled with suggested slots.' },
  { field: 'imageModel',       question: 'Which AI model for image generation?',  subtitle: 'Each model has different strengths. You can change this later per campaign.' },
  { field: 'referenceImages',  question: 'Upload your reference images',          subtitle: 'These guide the visual style of all generated images and videos. Up to 5.' },
] as const;

function stepIsValid(step: number, data: FormData): boolean {
  switch (step) {
    case 0:  return data.brandName.trim().length > 0;
    case 1:  return data.productOrService.trim().length > 0;
    case 2:  return data.targetAudience.trim().length > 0;
    case 3:  return data.platforms.length > 0;
    case 4:  return data.contentFormats.length > 0;
    case 5:  return data.goal.length > 0;
    case 6:  return data.tone.length > 0;
    case 7:  return true; // optional
    case 8:  return data.postingFrequency.length > 0;
    case 9:  return data.imageModel.length > 0;
    case 10: return true; // optional
    default: return false;
  }
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  const total = STEPS.length;
  const current = STEPS[step];
  const valid = stepIsValid(step, data);

  function set(field: keyof FormData, value: any) {
    setData(prev => ({ ...prev, [field]: value }));
  }

  function togglePlatform(p: string) {
    set('platforms', data.platforms.includes(p)
      ? data.platforms.filter(x => x !== p)
      : [...data.platforms, p]);
  }

  function next() {
    if (!valid) return;
    if (step < total - 1) { setDirection(1); setStep(s => s + 1); }
    else submit();
  }

  function back() {
    if (step > 0) { setDirection(-1); setStep(s => s - 1); }
  }

  async function submit() {
    setSubmitting(true);
    try {
      // Upload reference images
      const imageUrls: string[] = [];
      for (const file of data.referenceImages) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('bucket', 'reference-images');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (res.ok) {
          const { url } = await res.json();
          imageUrls.push(url);
        }
      }

      // Create campaign
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName:     `${data.brandName} — ${new Date().toLocaleDateString()}`,
          brandName:        data.brandName,
          productOrService: data.productOrService,
          targetAudience:   data.targetAudience,
          platforms:        data.platforms,
          goal:             data.goal,
          tone:             data.tone,
          competitors:      data.competitors || undefined,
          postingFrequency: data.postingFrequency,
          contentFormats:   data.contentFormats,
          imageModel:       data.imageModel,
        }),
      });

      const { campaign, error } = await res.json();
      if (error) throw new Error(error);

      // Trigger research immediately
      fetch('/api/agents/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      });

      router.push(`/dashboard/campaigns/${campaign.id}/research`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  if (submitting) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 40px rgba(124,58,237,0.3)', '0 0 80px rgba(124,58,237,0.5)', '0 0 40px rgba(124,58,237,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}
        >
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
        </motion.div>
        <h2 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: C.fg, marginBottom: 12 }}>
          Launching your AI team…
        </h2>
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.88rem', color: C.sub }}>
          Your research agent is scanning the web for insights.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px', position: 'relative' }}>
      <ProgressBar step={step + 1} total={total} />
      <StepLabel step={step + 1} total={total} />

      <div style={{ width: '100%', maxWidth: 640 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Question */}
            <h1 style={{ fontFamily: "var(--font-cal-sans), 'Inter', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 600, color: C.fg, marginBottom: 10, lineHeight: 1.2 }}>
              {current.question}
            </h1>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.88rem', color: C.sub, marginBottom: 32, lineHeight: 1.7 }}>
              {current.subtitle}
            </p>

            {/* Input */}
            <div style={{ marginBottom: 32 }}>
              {current.field === 'brandName' && (
                <TextInput value={data.brandName} onChange={v => set('brandName', v)} placeholder="e.g. Symponia, Acme Corp…" />
              )}
              {current.field === 'productOrService' && (
                <TextInput value={data.productOrService} onChange={v => set('productOrService', v)} placeholder="e.g. launching a new mindfulness app for Gen Z…" multiline />
              )}
              {current.field === 'targetAudience' && (
                <TextInput value={data.targetAudience} onChange={v => set('targetAudience', v)} placeholder="e.g. women 25-35, interested in wellness and psychology, struggling with burnout…" multiline />
              )}
              {current.field === 'platforms' && (
                <ChipSelect options={PLATFORMS} selected={data.platforms} onToggle={togglePlatform} />
              )}
              {current.field === 'contentFormats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
                  {CONTENT_FORMATS.map(f => {
                    const active = data.contentFormats.includes(f.id);
                    return (
                      <motion.button key={f.id} whileTap={{ scale: 0.98 }}
                        onClick={() => set('contentFormats', active ? data.contentFormats.filter(x => x !== f.id) : [...data.contentFormats, f.id])}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                          border: `1px solid ${active ? C.purple : C.border}`,
                          background: active ? `rgba(124,58,237,0.1)` : C.elevated,
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{f.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9rem', fontWeight: active ? 600 : 400, color: active ? C.purpleLight : C.fg }}>{f.label}</div>
                          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: C.sub, marginTop: 2 }}>{f.desc}</div>
                        </div>
                        {active && <Check size={16} color={C.purpleLight} />}
                      </motion.button>
                    );
                  })}
                </div>
              )}
              {current.field === 'goal' && (
                <ChipSelect options={GOALS} selected={data.goal} onToggle={v => set('goal', v)} single />
              )}
              {current.field === 'tone' && (
                <ChipSelect options={TONES} selected={data.tone} onToggle={v => set('tone', v)} single />
              )}
              {current.field === 'competitors' && (
                <TextInput value={data.competitors} onChange={v => set('competitors', v)} placeholder="e.g. Calm, Headspace, @tinybuddha — optional" multiline />
              )}
              {current.field === 'postingFrequency' && (
                <ChipSelect options={FREQUENCIES} selected={data.postingFrequency} onToggle={v => set('postingFrequency', v)} single />
              )}
              {current.field === 'imageModel' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
                  {IMAGE_MODELS.map(m => {
                    const active = data.imageModel === m.id;
                    return (
                      <motion.button key={m.id} whileTap={{ scale: 0.98 }}
                        onClick={() => set('imageModel', m.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 18px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                          border: `1px solid ${active ? C.purple : C.border}`,
                          background: active ? `rgba(124,58,237,0.1)` : C.elevated,
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9rem', fontWeight: active ? 600 : 500, color: active ? C.purpleLight : C.fg }}>{m.label}</span>
                            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.58rem', padding: '1px 6px', borderRadius: 4, background: C.elevated, color: C.dim, border: `1px solid ${C.border}` }}>{m.badge}</span>
                          </div>
                          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: C.sub }}>{m.desc}</div>
                        </div>
                        {active && <Check size={16} color={C.purpleLight} />}
                      </motion.button>
                    );
                  })}
                </div>
              )}
              {current.field === 'referenceImages' && (
                <ImageDropzone
                  files={data.referenceImages}
                  onAdd={files => set('referenceImages', [...data.referenceImages, ...files].slice(0, 5))}
                  onRemove={i => set('referenceImages', data.referenceImages.filter((_, idx) => idx !== i))}
                />
              )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {step > 0 && (
                <button onClick={back} style={{
                  padding: '12px 20px', borderRadius: 10,
                  background: 'transparent', border: `1px solid ${C.border}`,
                  color: C.sub, fontFamily: 'var(--font-inter)', fontSize: '0.85rem',
                  cursor: 'pointer',
                }}>
                  Back
                </button>
              )}
              <motion.button
                whileHover={valid ? { scale: 1.02 } : {}}
                whileTap={valid ? { scale: 0.97 } : {}}
                onClick={next}
                disabled={!valid}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 10,
                  background: valid ? C.purple : `${C.purple}40`,
                  border: 'none', cursor: valid ? 'pointer' : 'not-allowed',
                  color: valid ? '#fff' : `#fff60`,
                  fontFamily: 'var(--font-inter)', fontSize: '0.88rem', fontWeight: 500,
                  boxShadow: valid ? '0 0 24px rgba(124,58,237,0.3)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {step === total - 1 ? 'Launch campaign' : 'Continue'}
                <ChevronRight size={15} />
              </motion.button>

              <span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', color: C.dim }}>
                or press Enter ↵
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard handler */}
      <input
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        onKeyDown={e => e.key === 'Enter' && next()}
        autoFocus
        readOnly
      />
    </div>
  );
}
