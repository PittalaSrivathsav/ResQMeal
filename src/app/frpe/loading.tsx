export default function FRPELoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="animate-pulse rounded-3xl bg-gradient-to-r from-[#075B2A] to-[#138A36] h-32" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="animate-pulse rounded-2xl bg-white border border-slate-200/80 h-20" />
        ))}
      </div>
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="animate-pulse rounded-3xl bg-white border border-slate-200/80 h-28" />
        ))}
      </div>
    </div>
  );
}
