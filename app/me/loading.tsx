export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[rgb(var(--hover))]" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-[rgb(var(--hover))]" />
          <div className="h-3 w-48 rounded bg-[rgb(var(--hover))]" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="h-4 w-16 rounded bg-[rgb(var(--hover))]" />
            <div className="h-6 w-12 rounded bg-[rgb(var(--hover))]" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-4 w-2/3 rounded bg-[rgb(var(--hover))]" />
            <div className="h-3 w-full rounded bg-[rgb(var(--hover))]" />
          </div>
        ))}
      </div>
    </div>
  );
}

