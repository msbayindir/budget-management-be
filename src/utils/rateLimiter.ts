import { Request, Response, NextFunction } from 'express';
import { error } from './thrower';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      message: 'Too many requests, please try again later.',
      keyGenerator: (req: Request) => req.ip || 'unknown',
      ...options
    };

    // Clean expired entries every minute
    setInterval(() => this.cleanExpired(), 60 * 1000);
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.options.keyGenerator!(req);
      const now = Date.now();
      const windowStart = now - this.options.windowMs;

      let requestData = this.requests.get(key);

      // If no data or window expired, reset
      if (!requestData || now > requestData.resetTime) {
        requestData = {
          count: 0,
          resetTime: now + this.options.windowMs
        };
      }

      requestData.count++;
      this.requests.set(key, requestData);

      // Check if limit exceeded
      if (requestData.count > this.options.max) {
        const resetTime = Math.ceil((requestData.resetTime - now) / 1000);
        res.set({
          'X-RateLimit-Limit': this.options.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString()
        });
        
        error(res, this.options.message!, 429);
        return;
      }

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': this.options.max.toString(),
        'X-RateLimit-Remaining': (this.options.max - requestData.count).toString(),
        'X-RateLimit-Reset': Math.ceil((requestData.resetTime - now) / 1000).toString()
      });

      next();
    };
  }
}

// Pre-configured rate limiters
export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  keyGenerator: (req: Request) => req.ip + ':auth'
});

export const generalLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please slow down.',
  keyGenerator: (req: Request) => req.ip || 'unknown'
});

export { RateLimiter };
