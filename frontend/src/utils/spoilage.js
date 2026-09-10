/**
 * Spoilage Urgency Utility for Surplus Food
 * 
 * Rules:
 * - RED: Expiry is within 1 day (<= 24 hours) or expired
 * - YELLOW: Expiry is within 3 days (24h - 72h)
 * - GREEN: Otherwise (> 3 days / 72h)
 */

export function getSpoilageUrgency(expiryDate) {
  if (!expiryDate) {
    return {
      level: 'low',
      color: 'green',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
      dotClass: 'bg-emerald-500',
      label: 'Shelf Stable',
      daysLeft: 999,
      hoursLeft: 9999,
      isExpired: false,
    }
  }

  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffMs = expiry.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffHours <= 0) {
    return {
      level: 'urgent',
      color: 'red',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 ring-rose-600/20',
      dotClass: 'bg-rose-600',
      label: 'Expired',
      daysLeft: 0,
      hoursLeft: 0,
      isExpired: true,
      humanTime: 'Past Expiry',
    }
  }

  // RED: within 1 day (<= 24 hours)
  if (diffHours <= 24) {
    const hours = Math.max(1, Math.round(diffHours))
    return {
      level: 'urgent',
      color: 'red',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20',
      dotClass: 'bg-rose-500 animate-ping',
      label: 'Urgent: < 24h',
      daysLeft: Math.round(diffDays * 10) / 10,
      hoursLeft: hours,
      isExpired: false,
      humanTime: `${hours} hour${hours > 1 ? 's' : ''} left`,
    }
  }

  // YELLOW: within 3 days (<= 72 hours)
  if (diffHours <= 72) {
    const days = Math.ceil(diffDays)
    return {
      level: 'moderate',
      color: 'yellow',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
      dotClass: 'bg-amber-500',
      label: 'Moderate: < 3d',
      daysLeft: days,
      hoursLeft: Math.round(diffHours),
      isExpired: false,
      humanTime: `${days} day${days > 1 ? 's' : ''} left`,
    }
  }

  // GREEN: otherwise (> 3 days)
  const days = Math.ceil(diffDays)
  return {
    level: 'low',
    color: 'green',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    dotClass: 'bg-emerald-500',
    label: 'Fresh: > 3d',
    daysLeft: days,
    hoursLeft: Math.round(diffHours),
    isExpired: false,
    humanTime: `${days} days left`,
  }
}

export function formatExpiryDate(dateStr) {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}
