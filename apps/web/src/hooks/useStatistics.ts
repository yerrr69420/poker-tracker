'use client';

import { useMemo } from 'react';
import type { SessionWithSite } from '@poker-tracker/shared';
import { durationMinutes } from '@poker-tracker/shared';

export interface SessionStats {
  netResult: number;
  totalMinutes: number;
  netHourlyRate: number;
  averageNetResult: number;
  numberOfSessions: number;
  averageDurationMinutes: number;
  winRatio: number;
}

function computeStats(sessions: SessionWithSite[]): SessionStats {
  const completed = sessions.filter((s) => s.end_time != null);
  const totalMinutes = completed.reduce(
    (sum, s) => sum + durationMinutes(s.start_time, s.end_time!),
    0
  );
  const netResult = sessions.reduce((sum, s) => sum + s.profit, 0);
  const numberOfSessions = sessions.length;
  const winningSessions = sessions.filter((s) => s.profit > 0).length;
  const hours = totalMinutes / 60;

  return {
    netResult,
    totalMinutes,
    netHourlyRate: hours > 0 ? netResult / hours : 0,
    averageNetResult: numberOfSessions > 0 ? netResult / numberOfSessions : 0,
    numberOfSessions,
    averageDurationMinutes: completed.length > 0 ? totalMinutes / completed.length : 0,
    winRatio: numberOfSessions > 0 ? winningSessions / numberOfSessions : 0,
  };
}

export function useStatistics(sessions: SessionWithSite[]) {
  const all = useMemo(() => computeStats(sessions), [sessions]);
  const cash = useMemo(
    () => computeStats(sessions.filter((s) => s.format === 'cash')),
    [sessions]
  );
  const tournament = useMemo(
    () => computeStats(sessions.filter((s) => s.format === 'tournament')),
    [sessions]
  );

  return { all, cash, tournament };
}
