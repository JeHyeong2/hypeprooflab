import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let _redis: Redis | null = null;
let _ratelimit: Ratelimit | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

export function getRatelimit(): Ratelimit {
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
    });
  }
  return _ratelimit;
}
