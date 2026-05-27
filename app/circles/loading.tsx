export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[rgb(var(--hover))]" />
          <div className="space-y-2">
            <div className="h-5 w-24 rounded bg-[rgb(var(--hover))]" />
            <div className="h-3 w-40 rounded bg-[rgb(var(--hover))]" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-4 w-2/3 rounded bg-[rgb(var(--hover))]" />
            <div className="h-3 w-full rounded bg-[rgb(var(--hover))]" />
            <div className="h-3 w-4/5 rounded bg-[rgb(var(--hover))]" />
          </div>
        ))}
      </div>
    </div>
  );
}

