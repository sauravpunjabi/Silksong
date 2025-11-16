export default function StatsCard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

      
      <div className="p-5 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
        <p className="text-sm opacity-70">Meals planned this week</p>
        <h2 className="text-2xl font-semibold mt-1">12</h2>
      </div>

      
      <div className="p-5 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
        <p className="text-sm opacity-70">Healthy meals picked</p>
        <h2 className="text-2xl font-semibold mt-1">5</h2>
      </div>

      
      <div className="p-5 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm">
        <p className="text-sm opacity-70">Most used ingredient</p>
        <h2 className="text-2xl font-semibold mt-1">Tomato</h2>
      </div>

    </div>
  );
}
