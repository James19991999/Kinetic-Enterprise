export interface EquityBarDatum {
  label: string;
  value: number; // 0-100
}

export function EquityBar({ label, data }: { label: string; data: EquityBarDatum[] }) {
  return (
    <div className="rounded-lg bg-surface-container-low p-md shadow-level2">
      <h3 className="text-body-lg font-semibold text-on-surface">{label}</h3>
      <div className="mt-md space-y-sm">
        {data.map((d) => (
          <div key={d.label}>
            <div className="mb-xs flex justify-between text-body-sm text-on-surface-variant">
              <span>{d.label}</span>
              <span>{d.value}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${Math.min(100, Math.max(0, d.value))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
