import crypto from 'crypto';

class CacheService {
  constructor(maxItems = 2000) {
    this.cache = new Map();
    this.maxItems = maxItems;
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Create a deterministic SHA256 key from prefix and positional parameters
   */
  generateKey(prefix, ...parts) {
    const raw = parts
      .map((p) => (typeof p === 'object' ? JSON.stringify(p) : String(p || '')))
      .join(':');
    const hash = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
    return `${prefix}:${hash}`;
  }

  /**
   * Retrieve cached value if key exists and has not expired
   */
  get(key) {
    if (!this.cache.has(key)) {
      this.misses++;
      return null;
    }

    const entry = this.cache.get(key);
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Refresh LRU order (delete & re-insert)
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.hits++;
    return entry.value;
  }

  /**
   * Store a key-value pair with TTL in seconds (default 1 hour = 3600s)
   */
  set(key, value, ttlSeconds = 3600) {
    if (this.cache.size >= this.maxItems) {
      // Evict oldest item (first key in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiresAt, createdAt: Date.now() });
  }

  /**
   * Cache wrapper for async loader functions (get-or-set pattern)
   */
  async getOrSet(key, fetchFn, ttlSeconds = 3600) {
    const cached = this.get(key);
    if (cached !== null) {
      return { value: cached, fromCache: true };
    }

    const result = await fetchFn();
    if (result !== undefined && result !== null) {
      this.set(key, result, ttlSeconds);
    }
    return { value: result, fromCache: false };
  }

  /**
   * Invalidate a single key or pattern
   */
  delete(key) {
    return this.cache.delete(key);
  }

  clearPattern(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? ((this.hits / totalRequests) * 100).toFixed(1) + '%' : '0%';
    return {
      keysCount: this.cache.size,
      maxItems: this.maxItems,
      hits: this.hits,
      misses: this.misses,
      hitRate,
    };
  }
}

export const cacheService = new CacheService();
