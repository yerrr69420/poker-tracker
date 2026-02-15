'use client';

import type { BankrollChartPoint } from '@poker-tracker/shared';

interface Props {
  data: BankrollChartPoint[];
  height?: number;
}

export default function BankrollChart({ data, height = 120 }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-text-muted text-sm" style={{ height }}>
        No data yet
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div style={{ height }}>
      <div className="flex items-end gap-0.5 h-full pb-5">
        {data.map((point, i) => {
          const barHeight = Math.max(2, (point.total / maxVal) * (height - 30));
          return (
            <div key={point.date + i} className="flex-1 flex flex-col items-center">
              <div
                className={`w-4/5 rounded-sm ${point.total >= 0 ? 'bg-profit' : 'bg-loss'}`}
                style={{ height: barHeight }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-text-muted">
        <span>{data[0]?.date?.slice(5)}</span>
        <span>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  );
}
