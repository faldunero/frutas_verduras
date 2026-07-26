// Cache utilities for server and client-side caching

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

// In-memory cache (server-side)
const serverCache = new Map<string, CacheEntry<any>>()

/**
 * Get cached data from server
 * @param key Cache key
 * @returns Cached data or null if expired
 */
export function getCachedData<T>(key: string): T | null {
  const entry = serverCache.get(key)
  if (!entry) return null

  // Check if expired
  const now = Date.now()
  if (now - entry.timestamp > entry.ttl) {
    serverCache.delete(key)
    return null
  }

  return entry.data as T
}

/**
 * Set data in server cache
 * @param key Cache key
 * @param data Data to cache
 * @param ttl Time to live in milliseconds (default: 1 hour)
 */
export function setCachedData<T>(key: string, data: T, ttl: number = 3600000): void {
  serverCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  })
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  serverCache.delete(key)
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  serverCache.clear()
}

/**
 * Client-side localStorage cache
 */
export const clientCache = {
  set<T>(key: string, data: T, ttl: number = 3600000): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }
      localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error)
    }
  },

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`cache:${key}`)
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      const now = Date.now()

      // Check if expired
      if (now - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`cache:${key}`)
        return null
      }

      return entry.data as T
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error)
      return null
    }
  },

  clear(key: string): void {
    try {
      localStorage.removeItem(`cache:${key}`)
    } catch (error) {
      console.warn('LocalStorage cache clear failed:', error)
    }
  },

  clearAll(): void {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('cache:'))
      keys.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.warn('LocalStorage cache clearAll failed:', error)
    }
  },
}

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes - for frequently changing data
  MEDIUM: 30 * 60 * 1000, // 30 minutes - for semi-static data
  LONG: 60 * 60 * 1000, // 1 hour - for mostly static data
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours - for very static data
}

// Cache keys
export const CACHE_KEYS = {
  CONFIG: 'app:config',
  PRODUCTOS: 'app:productos',
  USUARIOS: 'app:usuarios',
  ORDENES: 'app:ordenes',
}
