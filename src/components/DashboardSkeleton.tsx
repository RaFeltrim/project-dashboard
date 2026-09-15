export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <div className="h-8 w-48 bg-slate-800 rounded mb-2"></div>
          <div className="h-4 w-64 bg-slate-800 rounded"></div>
        </div>
        <div className="w-full md:w-96 h-12 bg-slate-800 rounded-full"></div>
      </div>

      {/* Filtros globais skeleton */}
      <div className="h-16 bg-slate-900 border border-slate-800 rounded-xl"></div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-36">
            <div className="h-4 w-24 bg-slate-800 rounded mb-4"></div>
            <div className="h-10 w-32 bg-slate-800 rounded mb-4"></div>
            <div className="h-2 w-full bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl h-24"></div>
        ))}
      </div>

      {/* Graficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl h-80"></div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl h-80"></div>
      </div>
    </div>
  );
}
