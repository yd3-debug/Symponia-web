import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Symponia collects, uses, and protects your personal data. We are committed to your privacy and GDPR compliance.',
  alternates: { canonical: 'https://symponia.io/privacy' },
  robots: { index: true, follow: true },
};

const C = {
  fg: '#eae6f8', sub: '#cac4e0', dim: '#a89ec8', cyan: '#5ce8d0',
  border: 'rgba(255,255,255,0.07)',
  heading: "var(--font-cormorant), 'Georgia', serif",
  body: "var(--font-inter), 'Helvetica Neue', sans-serif",
};

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ marginBottom: 48 }}>
      <h2 style={{ fontFamily: C.heading, fontSize: '1.6rem', fontWeight: 400, color: C.cyan, marginBottom: 16 }}>{title}</h2>
      <div style={{ fontFamily: C.body, fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.9, color: C.sub }}>
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <PageShell>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 28px 120px' }}>
        <p style={{ fontFamily: C.body, fontSize: '0.7rem', letterSpacing: '0.22em', color: C.cyan, textTransform: 'uppercase', marginBottom: 16 }}>Legal</p>
        <h1 style={{ fontFamily: C.heading, fontWeight: 300, fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', color: C.fg, marginBottom: 12, lineHeight: 1.1 }}>Privacy Policy</h1>
        <p style={{ fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, color: C.dim, marginBottom: 56 }}>Last updated: April 2026</p>

        <Section title="Who we are">
          <p>Symponia is an AI-powered self-reflection application developed and operated by Symponia Ltd ("we", "us", "our"). We are committed to protecting your personal information and your right to privacy.</p>
          <p style={{ marginTop: 12 }}>If you have any questions about this policy or our privacy practices, please contact us at <a href="mailto:privacy@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>privacy@symponia.io</a>.</p>
        </Section>

        <Section title="What data we collect">
          <p><strong style={{ color: C.fg, fontWeight: 400 }}>Data stored locally on your device:</strong></p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li>Your seven spirit animals (chosen during onboarding)</li>
            <li>Your name and gender (if provided during onboarding)</li>
            <li>Your resonance frequency preference</li>
            <li>Conversation history per session mode</li>
            <li>Token balance</li>
            <li>Notification preferences</li>
            <li>Birth date (if entered for numerology or birth chart features)</li>
          </ul>
          <p style={{ marginTop: 16 }}><strong style={{ color: C.fg, fontWeight: 400 }}>Data transmitted during a session:</strong></p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li>Your message text</li>
            <li>Your animal archetype profile (to personalise AI responses)</li>
            <li>Your name, gender, and frequency preference (to personalise AI responses)</li>
            <li>Session context (prior messages in the active conversation)</li>
          </ul>
          <p style={{ marginTop: 16 }}>This data is sent to our secure backend (Supabase Edge Functions) and then to Anthropic's Claude API to generate AI responses. We do not store the content of your conversations on our servers after the session ends.</p>
          <p style={{ marginTop: 16 }}><strong style={{ color: C.fg, fontWeight: 400 }}>Usage metadata stored on our servers:</strong></p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li>Per-exchange API usage counts (number of input and output tokens processed)</li>
            <li>Which AI model was used for each request</li>
            <li>Timestamp of each AI request</li>
          </ul>
          <p style={{ marginTop: 12 }}>This metadata does not include the content of your messages or responses. It is stored to monitor service costs, detect abuse, and verify that AI optimisations (such as prompt caching) are functioning correctly.</p>
        </Section>

        <Section title="How we use your data">
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            <li>To generate personalised AI responses via Claude (Anthropic)</li>
            <li>To deliver your daily AI reflection</li>
            <li>To maintain your session during a conversation</li>
            <li>To process token and subscription purchases (via Apple In-App Purchase)</li>
            <li>To send optional push notifications (if you have enabled them)</li>
          </ul>
          <p style={{ marginTop: 12 }}>We do not use your data for advertising, profiling, or any purpose beyond the operation of Symponia.</p>
        </Section>

        <Section title="Third-party AI service — Anthropic (Claude)" id="ai-disclosure">
          <p style={{ marginBottom: 16 }}>
            <strong style={{ color: C.fg, fontWeight: 500 }}>Symponia uses Claude, an AI system made by Anthropic, to generate responses.</strong>
          </p>
          <p><strong style={{ color: C.fg, fontWeight: 400 }}>What data is sent to Anthropic:</strong></p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li>Your message text (every message you send in a session)</li>
            <li>Your animal archetype profile (your chosen animals and their roles)</li>
            <li>Your first name, gender, and resonance frequency preference</li>
            <li>The conversation context for the active session</li>
          </ul>
          <p style={{ marginTop: 16 }}><strong style={{ color: C.fg, fontWeight: 400 }}>Who it is sent to:</strong> Anthropic, PBC — the company that builds and operates Claude. Anthropic is based in San Francisco, CA, USA.</p>
          <p style={{ marginTop: 12 }}><strong style={{ color: C.fg, fontWeight: 400 }}>Why:</strong> This data is necessary to generate personalised AI responses. Without it, Symponia cannot function.</p>
          <p style={{ marginTop: 12 }}><strong style={{ color: C.fg, fontWeight: 400 }}>User consent:</strong> You are asked to consent to this data sharing explicitly during onboarding, before any session begins. You may not use Symponia's AI features without providing this consent.</p>
          <p style={{ marginTop: 12 }}><strong style={{ color: C.fg, fontWeight: 400 }}>Anthropic's data protection:</strong> Anthropic maintains data security and privacy standards equivalent to or exceeding those required under GDPR. Their API usage policy does not allow training on API data by default. For full details, see <a href="https://www.anthropic.com/privacy" style={{ color: C.cyan, textDecoration: 'none' }}>Anthropic's Privacy Policy</a> and <a href="https://www.anthropic.com/legal/privacy" style={{ color: C.cyan, textDecoration: 'none' }}>API data usage policy</a>.</p>
          <p style={{ marginTop: 12 }}>We do not send payment details, authentication credentials, or device identifiers to Anthropic.</p>
        </Section>

        <Section title="Other third parties">
          <p>We also work with the following services:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li><strong style={{ color: C.fg, fontWeight: 400 }}>Supabase</strong> — Secure backend, user authentication, and edge function hosting. Data is stored in the EU. <a href="https://supabase.com/privacy" style={{ color: C.cyan, textDecoration: 'none' }}>Supabase Privacy Policy</a>.</li>
            <li><strong style={{ color: C.fg, fontWeight: 400 }}>Apple</strong> — App Store distribution, In-App Purchases, and push notification delivery. <a href="https://www.apple.com/legal/privacy/" style={{ color: C.cyan, textDecoration: 'none' }}>Apple Privacy Policy</a>.</li>
          </ul>
          <p style={{ marginTop: 12 }}>We do not use advertising networks, analytics SDKs, or data brokers.</p>
        </Section>

        <Section title="Data retention">
          <p>Conversation content is processed in-session and not retained on our servers after the response is returned. Profile data (name, animals, preferences) is stored locally on your device and in your Supabase account record for authentication purposes.</p>
          <p style={{ marginTop: 12 }}>API usage metadata (token counts, model, and timestamp — not message content) is retained on our servers for operational purposes. This data is deleted when you request account deletion.</p>
          <p style={{ marginTop: 12 }}>If you request deletion of your account and all associated data, contact us at <a href="mailto:privacy@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>privacy@symponia.io</a> and we will process your request within 30 days. You can also delete your account directly from within the app.</p>
        </Section>

        <div id="gdpr">
          <Section title="GDPR — Your rights (EEA residents)">
            <p>If you are located in the European Economic Area, you have the following rights under the General Data Protection Regulation (GDPR):</p>
            <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
              <li><strong style={{ color: C.fg, fontWeight: 400 }}>Right of access</strong> — You can request a copy of the personal data we hold about you.</li>
              <li><strong style={{ color: C.fg, fontWeight: 400 }}>Right to rectification</strong> — You can request correction of inaccurate data.</li>
              <li><strong style={{ color: C.fg, fontWeight: 400 }}>Right to erasure</strong> — You can request deletion of your personal data ("right to be forgotten").</li>
              <li><strong style={{ color: C.fg, fontWeight: 400 }}>Right to portability</strong> — You can request your data in a portable format.</li>
              <li><strong style={{ color: C.fg, fontWeight: 400 }}>Right to object</strong> — You can object to processing of your data in certain circumstances.</li>
              <li><strong style={{ color: C.fg, fontWeight: 400 }}>Right to withdraw consent</strong> — You can withdraw consent to AI data processing at any time by deleting your account. Note that withdrawal will prevent use of AI features.</li>
            </ul>
            <p style={{ marginTop: 16 }}>To exercise any of these rights, contact <a href="mailto:privacy@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>privacy@symponia.io</a>. You also have the right to lodge a complaint with your national data protection authority.</p>
            <p style={{ marginTop: 12 }}>Our legal basis for processing your data is: <strong style={{ color: C.fg, fontWeight: 400 }}>consent</strong> (AI data sharing with Anthropic — obtained at onboarding) and <strong style={{ color: C.fg, fontWeight: 400 }}>contract performance</strong> (providing the service and processing payments).</p>
          </Section>
        </div>

        <Section title="Children">
          <p>Symponia is not intended for users under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us immediately.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the "Last updated" date at the top of this page. Continued use of Symponia after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="Contact">
          <p>For any privacy-related questions or requests:</p>
          <p style={{ marginTop: 10 }}><a href="mailto:privacy@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>privacy@symponia.io</a></p>
        </Section>
      </div>
    </PageShell>
  );
}
