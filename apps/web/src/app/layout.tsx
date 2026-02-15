import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Poker Tracker',
  description: 'Track sessions, manage bankroll, and review hands with the community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-deep text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
