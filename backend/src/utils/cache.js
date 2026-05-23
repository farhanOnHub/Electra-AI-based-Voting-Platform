/**
 * Caching utility with Redis support and in-memory fallback
 */

// In-memory cache fallback
const memoryCache = new Map();
const memoryCacheTTL = new Map();

/**
 * Set value in cache
 */
export const setCache = async (key, value, ttl = 300) => {
  try {
    // Try Redis first (if configured)
    if (global.redisClient) {
      await global.redisClient.setex(key, ttl, JSON.stringify(value));
    } else {
      // Fallback to memory cache
      memoryCache.set(key, value);
      memoryCacheTTL.set(key, Date.now() + (ttl * 1000));
    }
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

/**
 * Get value from cache
 */
export const getCache = async (key) => {
  try {
    // Try Redis first (if configured)
    if (global.redisClient) {
      const value = await global.redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      }
    } else {
      // Fallback to memory cache
      const ttl = memoryCacheTTL.get(key);
      if (ttl && Date.now() > ttl) {
        memoryCache.delete(key);
        memoryCacheTTL.delete(key);
        return null;
      }
      return memoryCache.get(key) || null;
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Delete value from cache
 */
export const deleteCache = async (key) => {
  try {
    if (global.redisClient) {
      await global.redisClient.del(key);
    } else {
      memoryCache.delete(key);
      memoryCacheTTL.delete(key);
    }
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

/**
 * Clear all cache
 */
export const clearCache = async () => {
  try {
    if (global.redisClient) {
      await global.redisClient.flushall();
    } else {
      memoryCache.clear();
      memoryCacheTTL.clear();
    }
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

/**
 * Delete cache by pattern
 */
export const deleteCachePattern = async (pattern) => {
  try {
    if (global.redisClient) {
      const keys = await global.redisClient.keys(pattern);
      if (keys.length > 0) {
        await global.redisClient.del(keys);
      }
    } else {
      // For memory cache, delete all keys that match pattern
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
          memoryCache.delete(key);
          memoryCacheTTL.delete(key);
        }
      }
    }
    return true;
  } catch (error) {
    console.error('Cache pattern delete error:', error);
    return false;
  }
};
