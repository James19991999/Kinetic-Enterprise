'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export interface PulseTrendPoint {
  date: string;
  value: number;
}

export function PulseTrend({ title, data }: { title: string; data: PulseTrendPoint[] }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-md shadow-level2">
      <h3 className="text-body-lg font-semibold text-on-surface">{title}</h3>
      <div className="mt-md h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d3e4fe" />
            <XAxis dataKey="date" stroke="#474651" fontSize={12} />
            <YAxis stroke="#474651" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#1a146b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
