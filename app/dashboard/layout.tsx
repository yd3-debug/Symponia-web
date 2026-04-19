import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';

// No index — this page is invisible to search engines
export const metadata: Metadata = {
  title: 'Dashboard · Symponia',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
