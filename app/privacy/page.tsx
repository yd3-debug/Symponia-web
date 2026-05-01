import { PageShell } from '@/components/PageShell';

const C = {
  fg: '#F1F0FF', sub: '#AEAECE', dim: '#A8A8C8', cyan: '#06B6D4',
  border: '#1A1A30',
  heading: "var(--font-cal-sans), 'Inter', sans-serif",
  body: "var(--font-inter), 'Helvetica Neue', sans-serif",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
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
        <p style={{ fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, color: C.dim, marginBottom: 56 }}>Last updated: May 2026</p>

        <Section title="Who we are">
          <p>Symponia is a self-discovery application developed and operated by Boroto Ltd ("we", "us", "our"). We are committed to protecting your personal information and your right to privacy.</p>
          <p style={{ marginTop: 12 }}>If you have any questions about this policy or our privacy practices, please contact us at <a href="mailto:privacy@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>privacy@symponia.io</a>.</p>
        </Section>

        <Section title="What data we collect">
          <p><strong style={{ color: C.fg, fontWeight: 400 }}>Data stored locally on your device:</strong></p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li>Your seven animal archetypes</li>
            <li>Your name and gender (if provided during onboarding)</li>
            <li>Your resonance frequency preference</li>
            <li>Conversation history per mode</li>
            <li>Token balance</li>
            <li>Notification preferences</li>
          </ul>
          <p style={{ marginTop: 16 }}><strong style={{ color: C.fg, fontWeight: 400 }}>Data transmitted during a session:</strong></p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li>Your message text</li>
            <li>Your first name (as provided during onboarding)</li>
            <li>Your gender (if provided)</li>
            <li>Your seven animal archetypes</li>
            <li>Your resonance frequency preference</li>
          </ul>
          <p style={{ marginTop: 16 }}>This data is processed via Anthropic's Claude API to generate reflective responses. Your conversations are stored securely in our Supabase database, associated with your account, and are deleted when you delete your account or request data erasure. You can delete your account at any time from within the app (Profile tab → Account section → "delete account").</p>
        </Section>

        <Section title="How we use your data">
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            <li>To generate personalised Symponia responses</li>
            <li>To deliver your daily reflection</li>
            <li>To maintain your session during a conversation</li>
            <li>To process token and subscription purchases (via Apple In-App Purchase)</li>
            <li>To send optional push notifications (if you have enabled them)</li>
          </ul>
          <p style={{ marginTop: 12 }}>We do not use your data for advertising, profiling, or any purpose beyond the operation of Symponia.</p>
        </Section>

        <Section title="Third parties">
          <p>We work with the following third-party services:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li><strong style={{ color: C.fg, fontWeight: 400 }}>Anthropic (Claude AI)</strong> — Symponia uses Anthropic's Claude API to generate reflective responses. Anthropic operates under Zero Data Retention (ZDR) terms for Symponia: your conversations are not retained by Anthropic after the response is generated, and are not used to train or improve Anthropic's AI models. Anthropic's standard privacy policy applies to incidental technical metadata. See <a href="https://www.anthropic.com/legal/privacy" style={{ color: C.cyan, textDecoration: 'none' }}>anthropic.com/legal/privacy</a>.</li>
            <li><strong style={{ color: C.fg, fontWeight: 400 }}>Supabase</strong> — Secure backend and edge function hosting.</li>
            <li><strong style={{ color: C.fg, fontWeight: 400 }}>Apple</strong> — App Store distribution, push notification delivery, and in-app purchase processing. Payment details are handled entirely by Apple; we never see or store payment card details.</li>
          </ul>
        </Section>

        <Section title="Data retention">
          <p>Your account and conversation history are stored in our Supabase database and remain until you delete your account. Conversation content transmitted to Anthropic is not retained by them per ZDR terms. Local device data is removed when you uninstall the app.</p>
          <p style={{ marginTop: 12 }}>If you request deletion of any data associated with your account, contact us at <a href="mailto:privacy@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>privacy@symponia.io</a> and we will process your request within 30 days.</p>
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
              <li><strong style={{ color: C.fg, fontWeight: 400 }}>Right to restrict processing</strong> — You can request that we limit how we use your data.</li>
            </ul>
            <p style={{ marginTop: 16 }}>To exercise any of these rights, contact <a href="mailto:privacy@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>privacy@symponia.io</a>. You also have the right to lodge a complaint with your national data protection authority.</p>
            <p style={{ marginTop: 12 }}>Our legal basis for processing your data is: <strong style={{ color: C.fg, fontWeight: 400 }}>legitimate interests</strong> (providing the service you have requested) and <strong style={{ color: C.fg, fontWeight: 400 }}>contract performance</strong> (processing payments).</p>
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
