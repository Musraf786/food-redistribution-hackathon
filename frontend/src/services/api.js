/**
 * FeedForward In-Memory & LocalStorage Mock API Service
 * 
 * Implements the required endpoint behaviors:
 * POST /api/surplus   { donorName, foodType, quantity, expiryDate } -> { id, status }
 * GET  /api/surplus   -> [ { id, donorName, foodType, quantity, expiryDate, status } ]
 * POST /api/needs     { recipientName, foodType, quantityNeeded } -> { id, status }
 * GET  /api/needs     -> [ { id, recipientName, foodType, quantityNeeded, status } ]
 * POST /api/match/run -> [ { surplusId, needId, matchedQuantity } ]
 * GET  /api/matches   -> [ { id, donorName, recipientName, foodType, matchedQuantity, createdAt } ]
 */

const STORAGE_KEYS = {
  SURPLUS: 'feedforward_surplus_v1',
  NEEDS: 'feedforward_needs_v1',
  MATCHES: 'feedforward_matches_v1',
}

// Generate future ISO date relative to current time
const getRelativeDate = (hoursFromNow) => {
  const d = new Date()
  d.setHours(d.getHours() + hoursFromNow)
  return d.toISOString()
}

// Default Seed Data
const DEFAULT_SURPLUS = [
  {
    id: 'surplus-1',
    donorName: 'Artisan Bakeshop & Cafe',
    foodType: 'Fresh Bread & Pastries',
    quantity: 25,
    expiryDate: getRelativeDate(10), // RED (< 24h)
    status: 'available',
  },
  {
    id: 'surplus-2',
    donorName: 'Grand Central Catering',
    foodType: 'Prepared Meals (Hot Trays)',
    quantity: 45,
    expiryDate: getRelativeDate(16), // RED (< 24h)
    status: 'available',
  },
  {
    id: 'surplus-3',
    donorName: 'Metro Green Grocers',
    foodType: 'Fresh Produce (Vegetables & Fruit)',
    quantity: 70,
    expiryDate: getRelativeDate(42), // YELLOW (< 3 days, ~1.7 days)
    status: 'available',
  },
  {
    id: 'surplus-4',
    donorName: 'Alpine Creamery',
    foodType: 'Dairy (Milk & Greek Yogurt)',
    quantity: 30,
    expiryDate: getRelativeDate(60), // YELLOW (< 3 days, ~2.5 days)
    status: 'available',
  },
  {
    id: 'surplus-5',
    donorName: 'Summit Logistics Pantry',
    foodType: 'Canned Goods & Grains',
    quantity: 120,
    expiryDate: getRelativeDate(240), // GREEN (> 3 days, ~10 days)
    status: 'available',
  },
]

const DEFAULT_NEEDS = [
  {
    id: 'need-1',
    recipientName: 'Hope Haven Shelter',
    foodType: 'Fresh Bread & Pastries',
    quantityNeeded: 20,
    status: 'pending',
  },
  {
    id: 'need-2',
    recipientName: 'Downtown Soup Kitchen',
    foodType: 'Prepared Meals (Hot Trays)',
    quantityNeeded: 60,
    status: 'pending',
  },
  {
    id: 'need-3',
    recipientName: 'Eastside Community Center',
    foodType: 'Fresh Produce (Vegetables & Fruit)',
    quantityNeeded: 50,
    status: 'pending',
  },
  {
    id: 'need-4',
    recipientName: 'St. Vincent Youth Refuge',
    foodType: 'Dairy (Milk & Greek Yogurt)',
    quantityNeeded: 25,
    status: 'pending',
  },
]

const DEFAULT_MATCHES = [
  {
    id: 'match-init-1',
    donorName: 'Organic Valley Market',
    recipientName: 'St. Jude Community Shelter',
    foodType: 'Fresh Produce (Vegetables & Fruit)',
    matchedQuantity: 40,
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    id: 'match-init-2',
    donorName: 'Harbor City Deli',
    recipientName: 'Mercy Meal Outreach',
    foodType: 'Prepared Meals (Hot Trays)',
    matchedQuantity: 35,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
]

class MockApiService {
  constructor() {
    this.delayMs = 350
    this.simulateError = false
    this.initStorage()
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.SURPLUS)) {
      localStorage.setItem(STORAGE_KEYS.SURPLUS, JSON.stringify(DEFAULT_SURPLUS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEEDS)) {
      localStorage.setItem(STORAGE_KEYS.NEEDS, JSON.stringify(DEFAULT_NEEDS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(DEFAULT_MATCHES))
    }
  }

  async sleep(ms = this.delayMs) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  getStored(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  setStored(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  resetData() {
    localStorage.setItem(STORAGE_KEYS.SURPLUS, JSON.stringify(DEFAULT_SURPLUS))
    localStorage.setItem(STORAGE_KEYS.NEEDS, JSON.stringify(DEFAULT_NEEDS))
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(DEFAULT_MATCHES))
  }

  // --- API Endpoints ---

  /**
   * GET /api/surplus
   * -> [ { id, donorName, foodType, quantity, expiryDate, status } ]
   */
  async getSurplus() {
    await this.sleep()
    if (this.simulateError) throw new Error('Failed to fetch surplus inventory. Simulated network error.')
    return this.getStored(STORAGE_KEYS.SURPLUS)
  }

  /**
   * POST /api/surplus
   * payload: { donorName, foodType, quantity, expiryDate }
   * -> { id, status }
   */
  async postSurplus({ donorName, foodType, quantity, expiryDate }) {
    await this.sleep()
    if (this.simulateError) throw new Error('Failed to post surplus food. Simulated network error.')

    if (!donorName?.trim()) throw new Error('Donor name is required')
    if (!foodType?.trim()) throw new Error('Food type is required')
    const parsedQty = parseFloat(quantity)
    if (isNaN(parsedQty) || parsedQty <= 0) throw new Error('Quantity must be greater than 0 kg')
    if (!expiryDate) throw new Error('Expiry date is required')

    const newSurplus = {
      id: `surplus-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      donorName: donorName.trim(),
      foodType: foodType.trim(),
      quantity: parsedQty,
      expiryDate: new Date(expiryDate).toISOString(),
      status: 'available',
    }

    const current = this.getStored(STORAGE_KEYS.SURPLUS)
    current.unshift(newSurplus)
    this.setStored(STORAGE_KEYS.SURPLUS, current)

    return {
      id: newSurplus.id,
      status: newSurplus.status,
    }
  }

  /**
   * GET /api/needs
   * -> [ { id, recipientName, foodType, quantityNeeded, status } ]
   */
  async getNeeds() {
    await this.sleep()
    if (this.simulateError) throw new Error('Failed to fetch recipient needs. Simulated network error.')
    return this.getStored(STORAGE_KEYS.NEEDS)
  }

  /**
   * POST /api/needs
   * payload: { recipientName, foodType, quantityNeeded }
   * -> { id, status }
   */
  async postNeeds({ recipientName, foodType, quantityNeeded }) {
    await this.sleep()
    if (this.simulateError) throw new Error('Failed to post need. Simulated network error.')

    if (!recipientName?.trim()) throw new Error('Recipient / Shelter organization name is required')
    if (!foodType?.trim()) throw new Error('Food category needed is required')
    const parsedQty = parseFloat(quantityNeeded)
    if (isNaN(parsedQty) || parsedQty <= 0) throw new Error('Quantity needed must be greater than 0 kg')

    const newNeed = {
      id: `need-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientName: recipientName.trim(),
      foodType: foodType.trim(),
      quantityNeeded: parsedQty,
      status: 'pending',
    }

    const current = this.getStored(STORAGE_KEYS.NEEDS)
    current.unshift(newNeed)
    this.setStored(STORAGE_KEYS.NEEDS, current)

    return {
      id: newNeed.id,
      status: newNeed.status,
    }
  }

  /**
   * GET /api/matches
   * -> [ { id, donorName, recipientName, foodType, matchedQuantity, createdAt } ]
   */
  async getMatches() {
    await this.sleep()
    if (this.simulateError) throw new Error('Failed to fetch matches. Simulated network error.')
    return this.getStored(STORAGE_KEYS.MATCHES)
  }

  /**
   * POST /api/match/run
   * Executes greedy waste-minimization matching algorithm:
   * Prioritizes surplus expiring soonest, matches with pending needs of same category.
   * -> [ { surplusId, needId, matchedQuantity } ]
   */
  async runMatching() {
    await this.sleep(600) // Slightly longer for realistic optimization process
    if (this.simulateError) throw new Error('Optimizer engine failed to compute matches. Simulated error.')

    const surplusList = this.getStored(STORAGE_KEYS.SURPLUS)
    const needsList = this.getStored(STORAGE_KEYS.NEEDS)
    const matchesList = this.getStored(STORAGE_KEYS.MATCHES)

    // Sort available surplus by closest expiry date first (earliest expiry prioritized!)
    const activeSurplus = surplusList
      .filter((s) => s.status === 'available' || s.status === 'partially_matched')
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

    // Active needs
    const activeNeeds = needsList.filter((n) => n.status === 'pending' || n.status === 'partially_fulfilled')

    const newExecutions = []

    for (const need of activeNeeds) {
      if (need.quantityNeeded <= 0) continue

      for (const surplus of activeSurplus) {
        if (surplus.quantity <= 0) continue

        // Check food type compatibility (normalized comparison)
        const isMatch =
          surplus.foodType.trim().toLowerCase() === need.foodType.trim().toLowerCase() ||
          surplus.foodType.toLowerCase().includes(need.foodType.toLowerCase()) ||
          need.foodType.toLowerCase().includes(surplus.foodType.toLowerCase())

        if (isMatch) {
          const allocation = Math.min(surplus.quantity, need.quantityNeeded)

          if (allocation > 0) {
            surplus.quantity -= allocation
            surplus.status = surplus.quantity <= 0.001 ? 'matched' : 'partially_matched'
            if (surplus.quantity < 0.001) surplus.quantity = 0

            need.quantityNeeded -= allocation
            need.status = need.quantityNeeded <= 0.001 ? 'fulfilled' : 'partially_fulfilled'
            if (need.quantityNeeded < 0.001) need.quantityNeeded = 0

            // Record the match in the matches ledger
            const matchRecord = {
              id: `match-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              donorName: surplus.donorName,
              recipientName: need.recipientName,
              foodType: surplus.foodType,
              matchedQuantity: allocation,
              createdAt: new Date().toISOString(),
            }

            matchesList.unshift(matchRecord)

            // Contract response shape
            newExecutions.push({
              surplusId: surplus.id,
              needId: need.id,
              matchedQuantity: allocation,
            })
          }
        }

        if (need.quantityNeeded <= 0) break
      }
    }

    // Persist updated states
    this.setStored(STORAGE_KEYS.SURPLUS, surplusList)
    this.setStored(STORAGE_KEYS.NEEDS, needsList)
    this.setStored(STORAGE_KEYS.MATCHES, matchesList)

    return newExecutions
  }
}

export const api = new MockApiService()
