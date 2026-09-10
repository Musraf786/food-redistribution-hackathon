import { useState } from 'react'
import {
  PackagePlus,
  Clock,
  Building2,
  Utensils,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'

import { getSpoilageUrgency } from '../utils/spoilage'

const FOOD_TYPE_OPTIONS = [
  'Fresh Bread & Pastries',
  'Prepared Meals (Hot Trays)',
  'Fresh Produce (Vegetables & Fruit)',
  'Dairy (Milk & Greek Yogurt)',
  'Canned Goods & Grains',
  'Packaged Sandwiches & Salads',
  'Frozen Proteins & Meats',
  'Juices & Beverages',
]

export default function AddSurplusForm({ onSubmitSurplus, onNavigateDashboard }) {
  // Helpers for default expiry dates
  const getDefaultExpiry = (hoursAhead = 12) => {
    const d = new Date()
    d.setHours(d.getHours() + hoursAhead)
    return d.toISOString().slice(0, 16)
  }

  const [formData, setFormData] = useState({
    donorName: '',
    foodType: 'Fresh Bread & Pastries',
    customFoodType: '',
    quantity: '',
    expiryDate: getDefaultExpiry(14), // default ~14 hours ahead (RED urgency)
  })

  const [isCustomType, setIsCustomType] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successResult, setSuccessResult] = useState(null)

  // Live preview urgency computation
  const urgency = getSpoilageUrgency(formData.expiryDate)

  // Handle Preset autofills for rapid demonstration
  const handleApplyPreset = (preset) => {
    setErrorMsg('')
    setSuccessResult(null)
    setFormData({
      donorName: preset.donorName,
      foodType: preset.foodType,
      customFoodType: '',
      quantity: preset.quantity.toString(),
      expiryDate: getDefaultExpiry(preset.hours),
    })
    setIsCustomType(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessResult(null)

    const finalFoodType = isCustomType ? formData.customFoodType.trim() : formData.foodType.trim()

    if (!formData.donorName.trim()) {
      setErrorMsg('Please enter the donor business or individual name.')
      return
    }

    if (!finalFoodType) {
      setErrorMsg('Please select or specify the food category.')
      return
    }

    const qty = parseFloat(formData.quantity)
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please enter a valid quantity greater than 0 kg.')
      return
    }

    if (!formData.expiryDate) {
      setErrorMsg('Please provide the estimated expiration date and time.')
      return
    }

    try {
      setSubmitting(true)
      const res = await onSubmitSurplus({
        donorName: formData.donorName.trim(),
        foodType: finalFoodType,
        quantity: qty,
        expiryDate: formData.expiryDate,
      })

      setSuccessResult({
        id: res.id,
        status: res.status,
        donorName: formData.donorName,
        quantity: qty,
        foodType: finalFoodType,
        urgency,
      })

      // Reset form
      setFormData({
        donorName: '',
        foodType: 'Fresh Bread & Pastries',
        customFoodType: '',
        quantity: '',
        expiryDate: getDefaultExpiry(14),
      })
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit surplus food. Please check connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
        <div className="flex items-center space-x-3 text-emerald-600 mb-2">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
            <PackagePlus className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Surplus Food Donation Intake
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Post Available Food Surplus
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Register safe, edible surplus food from restaurants, bakeries, markets, and caterers.
          Our algorithm automatically assesses spoilage urgency and matches with nearby shelters.
        </p>

        {/* Rapid demo presets */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Demo Presets:
          </span>
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                donorName: 'Sunny Valley Bakery',
                foodType: 'Fresh Bread & Pastries',
                quantity: 35,
                hours: 8, // Urgent RED
              })
            }
            className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-medium transition-colors"
          >
            🔴 Urgent Bakery (8 hrs)
          </button>
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                donorName: 'Catering Deluxe Co.',
                foodType: 'Prepared Meals (Hot Trays)',
                quantity: 50,
                hours: 36, // Moderate YELLOW
              })
            }
            className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-medium transition-colors"
          >
            🟡 Moderate Catering (1.5 days)
          </button>
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                donorName: 'Green Orchard Market',
                foodType: 'Fresh Produce (Vegetables & Fruit)',
                quantity: 80,
                hours: 120, // Low GREEN
              })
            }
            className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium transition-colors"
          >
            🟢 Fresh Produce (5 days)
          </button>
        </div>
      </div>

      {/* Success banner if submitted */}
      {successResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs transition-all">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-emerald-900">
                Surplus Item Successfully Registered! (ID: {successResult.id})
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                <span className="font-semibold">{successResult.quantity} kg</span> of{' '}
                <span className="font-semibold">{successResult.foodType}</span> from{' '}
                <span className="font-semibold">{successResult.donorName}</span> has been logged to the pool.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateDashboard}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <span>View on Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessResult(null)}
                  className="text-xs text-emerald-800 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Submission Error:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* Two Column Grid: Form on Left, Live Urgency Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-5"
        >
          {/* Donor Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Donor Name / Organization <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Downtown Metro Bistro, Daily Bread Bakery"
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all bg-slate-50/50 hover:bg-white"
              />
            </div>
          </div>

          {/* Food Type */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Food Category <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomType(!isCustomType)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {isCustomType ? '← Choose from standard list' : '+ Enter custom category'}
              </button>
            </div>

            {isCustomType ? (
              <input
                type="text"
                required
                placeholder="e.g. Artisanal Soup, Canned Stew, Organic Apples"
                value={formData.customFoodType}
                onChange={(e) => setFormData({ ...formData, customFoodType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all bg-slate-50/50 hover:bg-white"
              />
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <select
                  value={formData.foodType}
                  onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all bg-slate-50/50 hover:bg-white"
                >
                  {FOOD_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quantity & Expiry Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Surplus Quantity (kg) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  required
                  placeholder="e.g. 25"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all bg-slate-50/50 hover:bg-white pr-12"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
                  KG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                ≈ {formData.quantity ? Math.round(parseFloat(formData.quantity || 0) * 3) : 0} estimated meals
              </p>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Estimated Expiration <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-hidden transition-all bg-slate-50/50 hover:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used to calculate spoilage priority.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Surplus...</span>
                </>
              ) : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  <span>Register Surplus Food</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Live Urgency Preview Badge */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-600 mb-4 pb-3 border-b border-slate-100">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Urgency Preview
              </h2>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Spoilage Category</span>
                {/* Spoilage Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${urgency.badgeClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${urgency.dotClass}`} />
                  <span>{urgency.label}</span>
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <div className="text-xs text-slate-500">Urgency Window</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  {urgency.humanTime}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <div className="text-xs text-slate-500">Redistribution Priority</div>
                <div className="text-xs font-medium text-slate-700 mt-1">
                  {urgency.color === 'red' && (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      Priority 1: Dispatched in next optimizer run!
                    </span>
                  )}
                  {urgency.color === 'yellow' && (
                    <span className="text-amber-600 font-semibold">
                      Priority 2: Matched within 24-48 hours.
                    </span>
                  )}
                  {urgency.color === 'green' && (
                    <span className="text-emerald-600 font-semibold">
                      Standard: Shelf-stable or ample shelf life.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Explanatory rules card */}
            <div className="mt-5 space-y-2 text-[11px] text-slate-500">
              <div className="font-semibold text-slate-700">Urgency Badge Rules:</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span><strong className="text-rose-700">RED:</strong> Expiry within 1 day (≤ 24 hours)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span><strong className="text-amber-700">YELLOW:</strong> Expiry within 3 days (24h - 72h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong className="text-emerald-700">GREEN:</strong> Fresh / Shelf stable (&gt; 3 days)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Calculated relative to local time
          </div>
        </div>
      </div>
    </div>
  )
}
