function LoadingSkeleton({ className = '', rows = 3 }) {
  return (
    <div className={`glass-card rounded-2xl p-5 ${className}`}>
      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200/80" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-3 animate-pulse rounded bg-slate-200/75"
            style={{ width: `${90 - idx * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default LoadingSkeleton;
