export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 rounded-3xl bg-[rgb(var(--hover))]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 space-y-3">
            <div className="aspect-video rounded-xl bg-[rgb(var(--hover))]" />
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-[rgb(var(--hover))]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-[rgb(var(--hover))]" />
                <div className="h-3 w-1/2 rounded bg-[rgb(var(--hover))]" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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

