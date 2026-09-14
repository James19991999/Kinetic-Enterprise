export default function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 gap-md md:grid-cols-4" aria-busy="true" aria-label="Loading dashboard">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-lg bg-surface-container-low" />
      ))}
      <div className="col-span-full h-64 animate-pulse rounded-lg bg-surface-container-low" />
    </div>
  );
}
