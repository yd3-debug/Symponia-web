import type { Metadata } from 'next';

// No index — this page is invisible to search engines
export const metadata: Metadata = {
  title: 'Dashboard · Symponia',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
