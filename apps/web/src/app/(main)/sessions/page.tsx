'use client';

import Link from 'next/link';
import { useSessions } from '@/hooks/useSessions';
import SessionCard from '@/components/sessions/SessionCard';

export default function SessionsPage() {
  const { sessions, loading } = useSessions();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Sessions</h1>
        <Link
          href="/sessions/new"
          className="bg-primary text-text-inverse font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          + Add Session
        </Link>
      </div>

      {loading && <p className="text-text-muted">Loading...</p>}

      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      {!loading && sessions.length === 0 && (
        <p className="text-text-muted text-center py-8">No sessions yet.</p>
      )}
    </div>
  );
}
