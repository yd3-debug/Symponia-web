'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <img src="/logo.jpg" alt="Symponia" style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', boxShadow: '0 0 40px rgba(124,58,237,0.3)', marginBottom: 12 }} />
        <p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#4A4A6A', textTransform: 'uppercase' }}>Marketing OS</p>
      </div>

      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#7C3AED',
            colorBackground: '#0F0F1A',
            colorText: '#F1F0FF',
            colorTextSecondary: '#8B8BA8',
            colorInputBackground: '#141428',
            colorInputText: '#F1F0FF',
            borderRadius: '10px',
            fontFamily: 'var(--font-inter)',
          },
          elements: {
            card: 'border border-[#1A1A30] shadow-[0_0_0_1px_#1A1A30,0_24px_80px_rgba(0,0,0,0.7)]',
            formButtonPrimary: 'bg-[#7C3AED] hover:bg-[#9F67FF] transition-colors',
          },
        }}
        redirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
