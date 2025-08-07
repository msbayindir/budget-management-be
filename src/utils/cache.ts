// Simple in-memory cache for token validation
class TokenCache {
  private cache = new Map<string, { value: boolean; expiry: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: boolean): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.TTL
    });
  }

  get(key: string): boolean | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries periodically
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  constructor() {
    // Clean expired entries every 10 minutes
    setInterval(() => this.cleanExpired(), 10 * 60 * 1000);
  }
}

export const tokenCache = new TokenCache();
