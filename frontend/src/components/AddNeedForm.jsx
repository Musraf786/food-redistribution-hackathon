import { useState } from 'react'
import {
  HeartHandshake,
  Building,
  Utensils,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Users,
} from 'lucide-react'


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

export default function AddNeedForm({ onSubmitNeed, onNavigateDashboard }) {
  const [formData, setFormData] = useState({
    recipientName: '',
    foodType: 'Prepared Meals (Hot Trays)',
    customFoodType: '',
    quantityNeeded: '',
  })

  const [isCustomType, setIsCustomType] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successResult, setSuccessResult] = useState(null)

  // Demo presets
  const handleApplyPreset = (preset) => {
    setErrorMsg('')
    setSuccessResult(null)
    setFormData({
      recipientName: preset.recipientName,
      foodType: preset.foodType,
      customFoodType: '',
      quantityNeeded: preset.quantityNeeded.toString(),
    })
    setIsCustomType(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessResult(null)

    const finalFoodType = isCustomType ? formData.customFoodType.trim() : formData.foodType.trim()

    if (!formData.recipientName.trim()) {
      setErrorMsg('Please specify the recipient organization (Shelter, NGO, or Soup Kitchen).')
      return
    }

    if (!finalFoodType) {
      setErrorMsg('Please select or specify the food category required.')
      return
    }

    const qty = parseFloat(formData.quantityNeeded)
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please enter a valid quantity needed greater than 0 kg.')
      return
    }

    try {
      setSubmitting(true)
      const res = await onSubmitNeed({
        recipientName: formData.recipientName.trim(),
        foodType: finalFoodType,
        quantityNeeded: qty,
      })

      setSuccessResult({
        id: res.id,
        status: res.status,
        recipientName: formData.recipientName,
        quantityNeeded: qty,
        foodType: finalFoodType,
      })

      // Reset form
      setFormData({
        recipientName: '',
        foodType: 'Prepared Meals (Hot Trays)',
        customFoodType: '',
        quantityNeeded: '',
      })
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit food requirement. Please check connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
        <div className="flex items-center space-x-3 text-teal-600 mb-2">
          <div className="p-2 rounded-lg bg-teal-50 border border-teal-100">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Community Need Intake
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Post Food Need for Shelters & NGOs
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Specify exact nutritional or meal quantity requirements for homeless shelters,
          soup kitchens, and community pantries. Our optimizer will pair your need with matching surplus.
        </p>

        {/* Rapid demo presets */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Quick Demo Presets:
          </span>
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                recipientName: 'Harbor Light Shelter',
                foodType: 'Prepared Meals (Hot Trays)',
                quantityNeeded: 45,
              })
            }
            className="text-xs px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 font-medium transition-colors"
          >
            🍲 Hot Meals for Shelter (45 kg)
          </button>
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                recipientName: 'St. Jude Youth Center',
                foodType: 'Fresh Bread & Pastries',
                quantityNeeded: 25,
              })
            }
            className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-medium transition-colors"
          >
            🍞 Breakfast Bread (25 kg)
          </button>
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                recipientName: 'Community Solidarity Pantry',
                foodType: 'Fresh Produce (Vegetables & Fruit)',
                quantityNeeded: 75,
              })
            }
            className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium transition-colors"
          >
            🥦 Produce Pantry (75 kg)
          </button>
        </div>
      </div>

      {/* Success banner if submitted */}
      {successResult && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 shadow-xs transition-all">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-teal-900">
                Food Need Successfully Posted! (ID: {successResult.id})
              </h3>
              <p className="text-xs text-teal-700 mt-1">
                Requested <span className="font-semibold">{successResult.quantityNeeded} kg</span> of{' '}
                <span className="font-semibold">{successResult.foodType}</span> for{' '}
                <span className="font-semibold">{successResult.recipientName}</span>.
                Status is marked as <span className="font-semibold uppercase">{successResult.status}</span>.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateDashboard}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors shadow-2xs"
                >
                  <span>Go to Dashboard & Run Matching</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessResult(null)}
                  className="text-xs text-teal-800 hover:underline"
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

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6"
      >
        {/* Recipient Organization */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Recipient Organization / Shelter Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Hope Haven Shelter, City Soup Kitchen, Family Refuge"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm outline-hidden transition-all bg-slate-50/50 hover:bg-white"
            />
          </div>
        </div>

        {/* Food Type */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Food Category Needed <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCustomType(!isCustomType)}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium"
            >
              {isCustomType ? '← Choose from standard list' : '+ Enter custom category'}
            </button>
          </div>

          {isCustomType ? (
            <input
              type="text"
              required
              placeholder="e.g. Baby Formula, Dietary Specific Meals, Rice & Lentils"
              value={formData.customFoodType}
              onChange={(e) => setFormData({ ...formData, customFoodType: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm outline-hidden transition-all bg-slate-50/50 hover:bg-white"
            />
          ) : (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Utensils className="w-4 h-4" />
              </div>
              <select
                value={formData.foodType}
                onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm outline-hidden transition-all bg-slate-50/50 hover:bg-white"
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

        {/* Quantity Needed */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Quantity Needed (kg) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              step="0.5"
              required
              placeholder="e.g. 40"
              value={formData.quantityNeeded}
              onChange={(e) => setFormData({ ...formData, quantityNeeded: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm outline-hidden transition-all bg-slate-50/50 hover:bg-white pr-12"
            />
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-400 pointer-events-none">
              KG
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>
              Provides approximately{' '}
              <strong className="text-slate-800">
                {formData.quantityNeeded ? Math.round(parseFloat(formData.quantityNeeded || 0) * 3) : 0} meals
              </strong>{' '}
              to community members.
            </span>
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Posting Need...</span>
              </>
            ) : (
              <>
                <HeartHandshake className="w-4 h-4" />
                <span>Publish Food Need</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
