import { useState } from 'react'
import {
  UtensilsCrossed,
  LayoutDashboard,
  PlusCircle,
  HeartHandshake,
  RotateCcw,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react'


export default function Navbar({
  activeTab,
  setActiveTab,
  surplusCount = 0,
  needsCount = 0,
  matchesCount = 0,
  onResetData,
  isSimulateError,
  setIsSimulateError,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: matchesCount > 0 ? `${matchesCount} matched` : null,
    },
    {
      id: 'add-surplus',
      label: 'Add Surplus',
      icon: PlusCircle,
      badge: surplusCount > 0 ? `${surplusCount} active` : null,
    },
    {
      id: 'add-need',
      label: 'Add Need',
      icon: HeartHandshake,
      badge: needsCount > 0 ? `${needsCount} pending` : null,
    },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => {
              setActiveTab('dashboard')
              setMobileMenuOpen(false)
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 bg-clip-text text-transparent">
                  FeedForward
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AI Optimizer
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Food Waste-to-Need Redistribution
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs ring-1 ring-emerald-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-medium px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right Tools & Reset Button */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Error simulation toggle button for testing */}
            <button
              onClick={() => setIsSimulateError(!isSimulateError)}
              title={isSimulateError ? 'Simulated error is active' : 'Simulate API error state'}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors ${
                isSimulateError
                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-medium'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-current" />
              <span>{isSimulateError ? 'Simulating Error' : 'Test Error State'}</span>
            </button>

            {/* Reset data */}
            <button
              onClick={onResetData}
              title="Reset to default mock data"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Data</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-emerald-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setIsSimulateError(!isSimulateError)
              }}
              className="text-xs px-2.5 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {isSimulateError ? 'Simulate Error: ON' : 'Test Error'}
            </button>
            <button
              onClick={() => {
                onResetData()
                setMobileMenuOpen(false)
              }}
              className="text-xs flex items-center space-x-1 px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
