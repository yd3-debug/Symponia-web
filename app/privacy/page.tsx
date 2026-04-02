import { PageShell } from '@/components/PageShell';

const C = {
  fg: '#eae6f8', sub: '#b8b0d8', dim: '#7c70a8', cyan: '#5ce8d0',
  border: 'rgba(255,255,255,0.07)',
  heading: "var(--font-cormorant), 'Georgia', serif",
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
        <p style={{ fontFamily: C.body, fontSize: '0.82rem', fontWeight: 300, color: C.dim, marginBottom: 56 }}>Last updated: April 2026</p>

        <Section title="Who we are">
          <p>Symponia is a self-discovery application developed and operated by Symponia Ltd ("we", "us", "our"). We are committed to protecting your personal information and your right to privacy.</p>
          <p style={{ marginTop: 12 }}>If you have any questions about this policy or our privacy practices, please contact us at <a href="mailto:privacy@symponia.io" style={{ color: C.cyan, textDecoration: 'none' }}>privacy@symponia.io</a>.</p>
        </Section>

        <Section title="What data we collect">
          <p><strong style={{ color: C.fg, fontWeight: 400 }}>Data stored locally on your device:</strong></p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li>Your seven spirit animals</li>
            <li>Your name and gender (if provided during onboarding)</li>
            <li>Your resonance frequency preference</li>
            <li>Conversation history per Oracle mode</li>
            <li>Token balance</li>
            <li>Notification preferences</li>
          </ul>
          <p style={{ marginTop: 16 }}><strong style={{ color: C.fg, fontWeight: 400 }}>Data transmitted during a session:</strong></p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li>Your message text (to generate Oracle responses)</li>
            <li>Your animal data and preferences (to personalise responses)</li>
          </ul>
          <p style={{ marginTop: 16 }}>Messages are sent to our secure backend (Supabase Edge Functions) and then to Anthropic's Claude API to generate responses. We do not store the content of your conversations on our servers after the session ends.</p>
        </Section>

        <Section title="How we use your data">
          <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
            <li>To generate personalised Oracle responses</li>
            <li>To deliver your daily reading</li>
            <li>To maintain your session during a conversation</li>
            <li>To process token and subscription purchases (via Stripe)</li>
            <li>To send optional push notifications (if you have enabled them)</li>
          </ul>
          <p style={{ marginTop: 12 }}>We do not use your data for advertising, profiling, or any purpose beyond the operation of Symponia.</p>
        </Section>

        <Section title="Third parties">
          <p>We work with the following third-party services:</p>
          <ul style={{ marginTop: 10, paddingLeft: 20, lineHeight: 2 }}>
            <li><strong style={{ color: C.fg, fontWeight: 400 }}>Anthropic (Claude API)</strong> — AI response generation. Anthropic's privacy policy applies to data processed through their API.</li>
            <li><strong style={{ color: C.fg, fontWeight: 400 }}>Supabase</strong> — Secure backend and edge function hosting.</li>
            <li><strong style={{ color: C.fg, fontWeight: 400 }}>Stripe</strong> — Payment processing for token and subscription purchases. We never see or store your payment card details.</li>
            <li><strong style={{ color: C.fg, fontWeight: 400 }}>Apple</strong> — App Store distribution and push notification delivery.</li>
          </ul>
        </Section>

        <Section title="Data retention">
          <p>All personal data is stored locally on your device and is deleted when you uninstall the app. Session data transmitted to our servers is not retained after the response is returned.</p>
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
