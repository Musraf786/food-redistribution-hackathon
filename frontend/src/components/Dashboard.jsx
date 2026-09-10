import { useState } from 'react'
import {
  Sparkles,
  Package,
  HeartHandshake,
  ArrowRight,
  Search,
  RefreshCw,
  Clock,
  AlertTriangle,
  Building2,
  CheckCircle,
  Plus,
} from 'lucide-react'
import ImpactCounter from './ImpactCounter'
import { getSpoilageUrgency, formatExpiryDate } from '../utils/spoilage'


export default function Dashboard({
  surplusList = [],
  needsList = [],
  matchesList = [],
  loading = false,
  runningMatching = false,
  onRunMatching,
  onRefreshData,
  onNavigateAddSurplus,
  onNavigateAddNeed,
  lastMatchSummary = null,
  clearMatchSummary,
  error = null,
}) {
  const [activeViewTab, setActiveViewTab] = useState('all') // 'all', 'surplus', 'needs', 'matches'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [urgencyFilter, setUrgencyFilter] = useState('ALL') // 'ALL', 'urgent', 'moderate', 'low'

  // Filter available surplus (available or partially_matched)
  const filteredSurplus = surplusList.filter((item) => {
    const urgency = getSpoilageUrgency(item.expiryDate)
    const matchesSearch =
      item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.foodType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat =
      selectedCategory === 'ALL' || item.foodType.toLowerCase().includes(selectedCategory.toLowerCase())
    const matchesUrg = urgencyFilter === 'ALL' || urgency.level === urgencyFilter
    return matchesSearch && matchesCat && matchesUrg
  })

  // Filter pending needs
  const filteredNeeds = needsList.filter((item) => {
    const matchesSearch =
      item.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.foodType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat =
      selectedCategory === 'ALL' || item.foodType.toLowerCase().includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCat
  })

  // Filter matches
  const filteredMatches = matchesList.filter((item) => {
    const matchesSearch =
      item.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.foodType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat =
      selectedCategory === 'ALL' || item.foodType.toLowerCase().includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCat
  })

  // Urgent surplus count
  const urgentSurplusCount = surplusList.filter(
    (s) => (s.status === 'available' || s.status === 'partially_matched') && getSpoilageUrgency(s.expiryDate).level === 'urgent'
  ).length

  return (
    <div className="space-y-8">
      {/* 1. Top Impact Counter Panel */}
      <ImpactCounter matches={matchesList} />

      {/* 2. Optimizer Action Bar */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <h2 className="text-xl font-bold text-slate-900">
                Redistribution Optimizer Engine
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Pairs available food donations with waiting shelter requests in real-time.
              Surplus with closer expiration dates is prioritized to eliminate food waste.
            </p>
            {urgentSurplusCount > 0 && (
              <div className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {urgentSurplusCount} item{urgentSurplusCount === 1 ? '' : 's'} expiring in &lt;24 hours — high match urgency!
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshData}
              disabled={loading}
              title="Refresh lists"
              className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Prominent Run Matching Button */}
            <button
              onClick={onRunMatching}
              disabled={runningMatching || loading}
              className="group relative inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {runningMatching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Optimizing Routes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Run Matching</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Match Execution Outcome Banner */}
        {lastMatchSummary && (
          <div className="mt-6 p-4 rounded-xl border bg-emerald-50/90 border-emerald-200 text-emerald-900 transition-all flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">
                  {lastMatchSummary.count > 0
                    ? `Optimizer Success: ${lastMatchSummary.count} New Redistribution Route${lastMatchSummary.count === 1 ? '' : 's'} Matched!`
                    : 'Optimizer Completed: No New Compatible Matches Found'}
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  {lastMatchSummary.count > 0
                    ? `Allocated ${lastMatchSummary.totalKg} kg of food, creating ${Math.round(lastMatchSummary.totalKg * 3)} meals for waiting shelters.`
                    : 'All compatible pending needs and surplus inventories have already been fulfilled or food types differ.'}
                </p>
              </div>
            </div>
            <button
              onClick={clearMatchSummary}
              className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mt-6 p-4 rounded-xl border bg-rose-50 border-rose-200 text-rose-900 transition-all flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold">Error communicating with API:</span> {error}
            </div>
            <button
              onClick={onRefreshData}
              className="text-xs font-semibold px-2.5 py-1 bg-rose-200 text-rose-900 rounded hover:bg-rose-300"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 3. Search, Filters & View Selectors */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-slate-200/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveViewTab('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeViewTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Columns (3-in-1)
          </button>
          <button
            onClick={() => setActiveViewTab('surplus')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeViewTab === 'surplus'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Available Surplus</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
              {surplusList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveViewTab('needs')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeViewTab === 'needs'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending Needs</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800">
              {needsList.length}
            </span>
          </button>
          <button
            onClick={() => setActiveViewTab('matches')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeViewTab === 'matches'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Matches Made</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800">
              {matchesList.length}
            </span>
          </button>
        </div>

        {/* Search & Urgency Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor, shelter, food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Food Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Bread">Bakery / Bread</option>
            <option value="Meals">Prepared Meals</option>
            <option value="Produce">Produce / Fruits</option>
            <option value="Dairy">Dairy</option>
            <option value="Canned">Canned Goods</option>
          </select>

          {/* Urgency Filter for Surplus */}
          {(activeViewTab === 'all' || activeViewTab === 'surplus') && (
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="ALL">All Urgencies</option>
              <option value="urgent">🔴 Urgent (&lt; 24h)</option>
              <option value="moderate">🟡 Moderate (&lt; 3d)</option>
              <option value="low">🟢 Fresh (&gt; 3d)</option>
            </select>
          )}
        </div>
      </div>

      {/* 4. Three Core Data Columns / Views */}
      <div
        className={`grid gap-6 ${
          activeViewTab === 'all'
            ? 'grid-cols-1 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}
      >
        {/* ========================================================================= */}
        {/* COLUMN 1: AVAILABLE SURPLUS LIST */}
        {/* ========================================================================= */}
        {(activeViewTab === 'all' || activeViewTab === 'surplus') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Available Surplus
                  </h3>
                  <p className="text-xs text-slate-500">
                    {filteredSurplus.length} donations in pool
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateAddSurplus}
                className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Surplus</span>
              </button>
            </div>

            {/* Surplus Item Cards Container */}
            <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
              {loading && surplusList.length === 0 ? (
                /* Skeleton Loader */
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                ))
              ) : filteredSurplus.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Package className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                  <p className="text-sm font-medium text-slate-600">No surplus items found</p>
                  <p className="text-xs text-slate-400 mt-1">Try clearing filters or add new donation</p>
                  <button
                    onClick={onNavigateAddSurplus}
                    className="mt-3 text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    + Register surplus food
                  </button>
                </div>
              ) : (
                filteredSurplus.map((item) => {
                  const urgency = getSpoilageUrgency(item.expiryDate)
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                        item.status === 'matched'
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : urgency.level === 'urgent'
                          ? 'bg-rose-50/40 border-rose-200'
                          : urgency.level === 'moderate'
                          ? 'bg-amber-50/30 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Top Row: Food Type & Spoilage Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {item.foodType}
                        </h4>
                        {/* Spoilage-Urgency Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${urgency.badgeClass}`}
                          title={`Expires: ${formatExpiryDate(item.expiryDate)}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${urgency.dotClass}`} />
                          <span>{urgency.label}</span>
                        </span>
                      </div>

                      {/* Donor Name */}
                      <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.donorName}</span>
                      </div>

                      {/* Quantity & Expiry Info */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">
                            {item.quantity} kg
                          </span>{' '}
                          <span className="text-slate-500">
                            (≈ {Math.round(item.quantity * 3)} meals)
                          </span>
                        </div>

                        {/* Status Tag */}
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                            item.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'partially_matched'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.status === 'partially_matched' ? 'Part-Matched' : item.status}
                        </span>
                      </div>

                      {/* Expiry Timestamp Details */}
                      <div className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Expiry: {formatExpiryDate(item.expiryDate)}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* COLUMN 2: PENDING NEEDS LIST */}
        {/* ========================================================================= */}
        {(activeViewTab === 'all' || activeViewTab === 'needs') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Pending Needs
                  </h3>
                  <p className="text-xs text-slate-500">
                    {filteredNeeds.length} shelter requests
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateAddNeed}
                className="flex items-center space-x-1 text-xs font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Need</span>
              </button>
            </div>

            {/* Needs Item Cards Container */}
            <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
              {loading && needsList.length === 0 ? (
                /* Skeleton */
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                ))
              ) : filteredNeeds.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <HeartHandshake className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                  <p className="text-sm font-medium text-slate-600">No pending needs found</p>
                  <p className="text-xs text-slate-400 mt-1">Add requirements for shelters & NGOs</p>
                  <button
                    onClick={onNavigateAddNeed}
                    className="mt-3 text-xs font-semibold text-teal-600 hover:underline"
                  >
                    + Post shelter request
                  </button>
                </div>
              ) : (
                filteredNeeds.map((need) => (
                  <div
                    key={need.id}
                    className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                      need.status === 'fulfilled'
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Top Row: Food Type Needed & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {need.foodType}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                          need.status === 'fulfilled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : need.status === 'partially_fulfilled'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {need.status === 'partially_fulfilled' ? 'Part-Filled' : need.status}
                      </span>
                    </div>

                    {/* Recipient Organization */}
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{need.recipientName}</span>
                    </div>

                    {/* Quantity Needed */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-teal-900 text-sm">
                          {need.quantityNeeded} kg
                        </span>{' '}
                        <span className="text-slate-500">needed</span>
                      </div>
                      <span className="text-slate-500">
                        ≈ {Math.round(need.quantityNeeded * 3)} meals
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* COLUMN 3: MATCHES MADE LIST */}
        {/* ========================================================================= */}
        {(activeViewTab === 'all' || activeViewTab === 'matches') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Matches Made
                  </h3>
                  <p className="text-xs text-slate-500">
                    {filteredMatches.length} distributions executed
                  </p>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                Live Ledger
              </span>
            </div>

            {/* Matches Container */}
            <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
              {loading && matchesList.length === 0 ? (
                /* Skeleton */
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                ))
              ) : filteredMatches.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Sparkles className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                  <p className="text-sm font-medium text-slate-600">No matches recorded yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click "Run Matching" to trigger the redistribution algorithm
                  </p>
                </div>
              ) : (
                filteredMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 rounded-xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50/70 transition-all hover:shadow-xs"
                  >
                    {/* Food Type */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {match.foodType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {match.createdAt ? new Date(match.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>

                    {/* Donor -> Shelter Flow */}
                    <div className="mt-2 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-sky-200/60 space-y-1">
                      <div className="flex items-center justify-between text-emerald-700 font-semibold">
                        <span className="truncate">Donor: {match.donorName}</span>
                      </div>
                      <div className="flex items-center justify-center text-slate-400 my-0.5">
                        <ArrowRight className="w-3.5 h-3.5 text-sky-500" />
                      </div>
                      <div className="flex items-center justify-between text-teal-800 font-semibold">
                        <span className="truncate">Shelter: {match.recipientName}</span>
                      </div>
                    </div>

                    {/* Matched Quantity & Meals Provided */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="inline-flex items-center space-x-1.5 font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-extrabold">
                          {match.matchedQuantity} kg
                        </span>
                        <span className="text-slate-600">redistributed</span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {Math.round(match.matchedQuantity * 3)} meals
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
