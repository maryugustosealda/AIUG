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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-4 w-1/2 rounded bg-[rgb(var(--hover))]" />
            <div className="h-3 w-full rounded bg-[rgb(var(--hover))]" />
            <div className="flex justify-between mt-2">
              <div className="h-3 w-16 rounded bg-[rgb(var(--hover))]" />
              <div className="h-3 w-12 rounded bg-[rgb(var(--hover))]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

