import { useState, useEffect, useCallback } from 'react'
import { api } from './services/api'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import AddSurplusForm from './components/AddSurplusForm'
import AddNeedForm from './components/AddNeedForm'
import { UtensilsCrossed, ShieldCheck } from 'lucide-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'add-surplus' | 'add-need'
  const [surplusList, setSurplusList] = useState([])
  const [needsList, setNeedsList] = useState([])
  const [matchesList, setMatchesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [runningMatching, setRunningMatching] = useState(false)
  const [error, setError] = useState(null)
  const [lastMatchSummary, setLastMatchSummary] = useState(null)
  const [isSimulateError, setIsSimulateError] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Synchronize error simulation mode
  const handleToggleSimulateError = (val) => {
    setIsSimulateError(val)
    api.simulateError = val
  }

  // Fetch all lists from API
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [surplus, needs, matches] = await Promise.all([
        api.getSurplus(),
        api.getNeeds(),
        api.getMatches(),
      ])
      setSurplusList(surplus)
      setNeedsList(needs)
      setMatchesList(matches)
    } catch (err) {
      console.error('API Fetch Error:', err)
      setError(err.message || 'Failed to communicate with API server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial data hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllData()
  }, [fetchAllData])


  // Handle Add Surplus (POST /api/surplus)
  const handleAddSurplus = async (payload) => {
    try {
      const res = await api.postSurplus(payload)
      await fetchAllData()
      showToast(`Surplus registered: ${payload.donorName} (${payload.quantity} kg)`, 'success')
      return res
    } catch (err) {
      showToast(err.message || 'Failed to submit surplus', 'error')
      throw err
    }
  }

  // Handle Add Need (POST /api/needs)
  const handleAddNeed = async (payload) => {
    try {
      const res = await api.postNeeds(payload)
      await fetchAllData()
      showToast(`Food requirement posted: ${payload.recipientName} (${payload.quantityNeeded} kg)`, 'success')
      return res
    } catch (err) {
      showToast(err.message || 'Failed to submit need', 'error')
      throw err
    }
  }

  // Handle Run Matching (POST /api/match/run)
  const handleRunMatching = async () => {
    try {
      setRunningMatching(true)
      setError(null)
      const matchedRoutes = await api.runMatching()
      await fetchAllData()

      const totalMatchedKg = matchedRoutes.reduce(
        (acc, r) => acc + (parseFloat(r.matchedQuantity) || 0),
        0
      )

      const summary = {
        count: matchedRoutes.length,
        totalKg: totalMatchedKg,
      }
      setLastMatchSummary(summary)

      if (matchedRoutes.length > 0) {
        showToast(
          `Matching optimizer complete! Created ${matchedRoutes.length} new routes (${totalMatchedKg} kg redistributed).`,
          'success'
        )
      } else {
        showToast('No new compatible pairs found to match.', 'info')
      }
    } catch (err) {
      console.error('Matching failed:', err)
      setError(err.message || 'Optimizer execution error')
      showToast(err.message || 'Matching error', 'error')
    } finally {
      setRunningMatching(false)
    }
  }

  // Reset to default mock data
  const handleResetData = async () => {
    api.resetData()
    setLastMatchSummary(null)
    await fetchAllData()
    showToast('Mock database reset to original demo state', 'info')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Toast banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-all duration-300 transform translate-y-0">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-medium border ${
              toast.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : toast.type === 'info'
                ? 'bg-slate-900 text-slate-100 border-slate-700'
                : 'bg-emerald-900 text-emerald-100 border-emerald-700'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-xs opacity-75 hover:opacity-100 ml-2 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Simulated error alert bar if enabled */}
      {isSimulateError && (
        <div className="bg-rose-600 text-white text-xs font-semibold py-1.5 px-4 text-center">
          ⚠️ Simulated Network Error Mode Active. API calls will simulate server failures to verify UI resilience.
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        surplusCount={surplusList.length}
        needsCount={needsList.length}
        matchesCount={matchesList.length}
        onResetData={handleResetData}
        isSimulateError={isSimulateError}
        setIsSimulateError={handleToggleSimulateError}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            surplusList={surplusList}
            needsList={needsList}
            matchesList={matchesList}
            loading={loading}
            runningMatching={runningMatching}
            onRunMatching={handleRunMatching}
            onRefreshData={fetchAllData}
            onNavigateAddSurplus={() => setActiveTab('add-surplus')}
            onNavigateAddNeed={() => setActiveTab('add-need')}
            lastMatchSummary={lastMatchSummary}
            clearMatchSummary={() => setLastMatchSummary(null)}
            error={error}
          />
        )}

        {activeTab === 'add-surplus' && (
          <AddSurplusForm
            onSubmitSurplus={handleAddSurplus}
            onNavigateDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'add-need' && (
          <AddNeedForm
            onSubmitNeed={handleAddNeed}
            onNavigateDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white">
              <UtensilsCrossed className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-700">FeedForward Optimizer</span>
            <span>— Food Waste-to-Need Redistribution</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Smart Greedy Matching Engine</span>
            </span>
            <span>1kg food = 3 meals</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
