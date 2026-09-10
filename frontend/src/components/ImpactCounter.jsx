import { Scale, Utensils, Leaf, CheckCircle2, TrendingUp } from 'lucide-react'


export default function ImpactCounter({ matches = [] }) {
  // Calculate total kg matched from matches list
  const totalKg = matches.reduce((acc, m) => acc + (parseFloat(m.matchedQuantity) || 0), 0)
  
  // Calculate estimated meals provided: 1kg = 3 meals
  const totalMeals = Math.round(totalKg * 3)

  // Environmental impact: 1 kg food waste saved ≈ 2.5 kg CO2 avoided
  const co2AvoidedKg = Math.round(totalKg * 2.5)

  // Total completed allocations
  const matchesCount = matches.length

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden border border-emerald-800/40">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header of Impact Panel */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-emerald-800/50 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live Community Impact Metrics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Redistribution Impact Counter
          </h2>
          <p className="text-sm text-emerald-200/80 mt-1">
            Real-time analytics computed directly from optimized surplus-to-need distributions.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/10 self-start sm:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-100">
            {matchesCount} Active Match{matchesCount === 1 ? '' : 'es'} Recorded
          </span>
        </div>
      </div>

      {/* 4 Metrics Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
        {/* Total Kg Matched */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-emerald-400/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-300">
              Total Food Saved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {totalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-base font-semibold text-emerald-300">kg</span>
          </div>
          <p className="text-xs text-emerald-200/70 mt-1">
            Rescued surplus delivered to shelters
          </p>
        </div>

        {/* Estimated Meals Provided (1kg = 3 meals) */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-amber-400/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-300">
              Estimated Meals
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-300">
              {totalMeals.toLocaleString()}
            </span>
            <span className="text-base font-semibold text-amber-200">meals</span>
          </div>
          <p className="text-xs text-amber-200/70 mt-1">
            Calculated at 3 meals per 1 kg food
          </p>
        </div>

        {/* CO2 Emissions Prevented */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-teal-400/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-teal-300">
              CO₂ Emissions Saved
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {co2AvoidedKg.toLocaleString()}
            </span>
            <span className="text-base font-semibold text-teal-300">kg CO₂e</span>
          </div>
          <p className="text-xs text-teal-200/70 mt-1">
            Landfill methane & transport emissions averted
          </p>
        </div>

        {/* Successful Matches Count */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-sky-400/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-sky-300">
              Successful Linkages
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {matchesCount}
            </span>
            <span className="text-base font-semibold text-sky-200">routes</span>
          </div>
          <p className="text-xs text-sky-200/70 mt-1">
            Zero-waste donor-to-shelter connections
          </p>
        </div>
      </div>
    </div>
  )
}
