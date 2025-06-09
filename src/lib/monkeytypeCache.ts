import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const USER_KEY_PREFIX = 'user:';
const META_LAST_GLOBAL_UPDATE_KEY = 'cache:meta:lastGlobalUpdate';
const META_IS_UPDATING_KEY = 'cache:meta:isUpdating'; // Lock key
const META_LAST_RATE_LIMIT_TIME_KEY = 'cache:meta:lastRateLimitTime';
const USER_SET_KEY = 'cache:userset'; // Set of discordIds

interface UserScore {
  wpm15: number | null;
  raw15: number | null;
  acc15: number | null;
  wpm30: number | null;
  raw30: number | null;
  acc30: number | null;
  wpm60: number | null;
  raw60: number | null;
  acc60: number | null;
}

interface CachedUserData {
  discordId: string;
  mtUsername: string;
  scores: UserScore;
  lastFetched: number;
  fetchAttempts: number;
  lastError?: string;
}

class MonkeytypeCacheManager {
  private readonly CACHE_DURATION = 5 * 60 * 1000;
  private readonly MAX_FETCH_ATTEMPTS = 3;
  private readonly FETCH_TIMEOUT = 10000;
  private readonly RATE_LIMIT_DELAY = 5 * 60 * 1000;

  public async getCachedData(): Promise<CachedUserData[]> {
    const userIds = await redis.smembers(USER_SET_KEY);
    if (!userIds || userIds.length === 0) {
      return [];
    }
    const userDataPromises = userIds.map(id => redis.get<CachedUserData>(`${USER_KEY_PREFIX}${id}`));
    const allUserData = await Promise.all(userDataPromises);
    return allUserData.filter(data => data !== null) as CachedUserData[];
  }

  public async getCachedUserData(discordId: string): Promise<CachedUserData | null> {
    const userData = await redis.get<CachedUserData>(`${USER_KEY_PREFIX}${discordId}`);
    return userData || null;
  }

  public async getCacheStats() {
    const now = Date.now();
    
    const lastGlobalUpdateStr = await redis.get<number>(META_LAST_GLOBAL_UPDATE_KEY);
    const lastGlobalUpdate = lastGlobalUpdateStr ? Number(lastGlobalUpdateStr) : 0;
    
    const isUpdating = (await redis.exists(META_IS_UPDATING_KEY)) === 1;
    
    const userCount = await redis.scard(USER_SET_KEY);
    
    let freshDataCount = 0;
    if (userCount > 0) {
      const userIds = await redis.smembers(USER_SET_KEY);
      const userDataPromises = userIds.map(id => redis.get<CachedUserData>(`${USER_KEY_PREFIX}${id}`));
      const allUserData = await Promise.all(userDataPromises);
      freshDataCount = allUserData.filter(user => user && (now - user.lastFetched < this.CACHE_DURATION)).length;
    }

    const cacheAge = lastGlobalUpdate ? now - lastGlobalUpdate : 0;

    return {
      userCount,
      freshDataCount,
      staleDataCount: userCount - freshDataCount,
      lastGlobalUpdate,
      cacheAge,
      isUpdating,
      nextUpdateIn: lastGlobalUpdate ? Math.max(0, this.CACHE_DURATION - cacheAge) : this.CACHE_DURATION,
    };
  }

  public async forceUpdate(discordId?: string): Promise<void> {
    await this.updateCache(discordId);
  } 

  private async updateCache(discordId?: string): Promise<void> {
    const lockAcquired = await redis.set(META_IS_UPDATING_KEY, 'true', { nx: true, ex: 300 });
    if (!lockAcquired) {
      console.log('Cache update already in progress (lock held), skipping...');
      return;
    }

    try {
      const now = Date.now();
      const lastRateLimitTimeStr = await redis.get<number>(META_LAST_RATE_LIMIT_TIME_KEY);
      const lastRateLimitTime = lastRateLimitTimeStr ? Number(lastRateLimitTimeStr) : 0;

      if (now - lastRateLimitTime < this.RATE_LIMIT_DELAY) {
        const remainingTime = Math.ceil((this.RATE_LIMIT_DELAY - (now - lastRateLimitTime)) / 1000);
        console.log(`Rate limited. Skipping update. ${remainingTime}s remaining in cooldown.`);
        return;
      }

      const startTime = Date.now();
      console.log(`Starting Monkeytype cache update${discordId ? ' for single user' : ''}...`);

      let users: Array<{ discordId: string; mtUrl: string }>;
      
      if (discordId) {
        const user = await this.getVerifiedUser(discordId);
        users = user ? [user] : [];
        if (!user) {
          console.log(`User ${discordId} not found or not verified`);
        }
      } else {
        users = await this.getVerifiedUsers();
      }
      
      console.log(`Found ${users.length} verified Monkeytype user(s) to update`);

      if (users.length === 0) {
        console.log('ℹNo verified users found, cache update complete');
        await redis.set(META_LAST_GLOBAL_UPDATE_KEY, Date.now());
        return;
      }

      const results = await this.processUsersInBatches(users, 1);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      await redis.set(META_LAST_GLOBAL_UPDATE_KEY, Date.now());
      const duration = Date.now() - startTime;

      console.log(`Cache update complete: ${successful} successful, ${failed} failed (${duration}ms)`);

      results.slice(0, 3).forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to update user ${users[index]?.mtUrl}:`, result.reason);
        }
      });

    } catch (error) {
      console.error('Cache update failed:', error);
      await redis.set(META_LAST_GLOBAL_UPDATE_KEY, Date.now());
    } finally {
      await redis.del(META_IS_UPDATING_KEY);
    }
  }

  private async processUsersInBatches(
    users: Array<{ discordId: string; mtUrl: string }>, 
    batchSize: number
  ): Promise<Array<PromiseSettledResult<void>>> {
    const results: Array<PromiseSettledResult<void>> = [];
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const batchPromises = batch.map(user => this.updateUserData(user));
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      const hasRateLimit = batchResults.some(result => 
        result.status === 'rejected' && 
        result.reason?.message?.includes('429')
      );
      
      if (hasRateLimit) {
        console.log('🚫 Rate limit detected, entering cooldown period...');
        await redis.set(META_LAST_RATE_LIMIT_TIME_KEY, Date.now());
        break; 
      }
      
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  private async getVerifiedUser(discordId: string): Promise<{ discordId: string; mtUrl: string } | null> {
    try {
      const { default: prisma } = await import('@/lib/primsa');
      
      const user = await prisma.user.findUnique({
        where: {
          discordId,
          mtVerified: true,
          mtUrl: {
            not: null,
          },
        },
        select: {
          discordId: true,
          mtUrl: true,
        },
      });
      
      return user as { discordId: string; mtUrl: string } | null;
    } catch (error) {
      console.error('Failed to get verified user:', error);
      return null;
    }
  }

  private async getVerifiedUsers(): Promise<Array<{ discordId: string; mtUrl: string }>> {
    try {
      const { default: prisma } = await import('@/lib/primsa');
      
      return await prisma.user.findMany({
        where: {
          mtUrl: {
            not: null,
          },
          mtVerified: true,
        },
        select: {
          discordId: true,
          mtUrl: true,
        },
      });
    } catch (error) {
      console.error('Database connection failed:', error);
      return [];
    }
  }

  private async updateUserData(user: { discordId: string; mtUrl: string }): Promise<void> {
    const userKey = `${USER_KEY_PREFIX}${user.discordId}`;
    
    const existingData = await redis.get<CachedUserData>(userKey);
    
    if (existingData && 
        existingData.fetchAttempts >= this.MAX_FETCH_ATTEMPTS &&
        Date.now() - existingData.lastFetched < 5 * 60 * 1000) { 
      console.log(`Skipping update for ${user.mtUrl}, max fetch attempts reached recently.`);
      return;
    }

    try {
      const scores = await this.fetchUserScores(user.mtUrl);
      
      const userData: CachedUserData = {
        discordId: user.discordId,
        mtUsername: user.mtUrl,
        scores,
        lastFetched: Date.now(),
        fetchAttempts: 0,
        lastError: undefined,
      };

      await redis.set(userKey, JSON.stringify(userData));
      await redis.sadd(USER_SET_KEY, user.discordId);

      await this.updateDatabaseScores(user.discordId, scores);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const userData: CachedUserData = {
        discordId: user.discordId,
        mtUsername: user.mtUrl,
        scores: existingData?.scores || this.getEmptyScores(),
        lastFetched: Date.now(),
        fetchAttempts: (existingData?.fetchAttempts || 0) + 1,
        lastError: errorMessage,
      };

      await redis.set(userKey, JSON.stringify(userData));
      await redis.sadd(USER_SET_KEY, user.discordId);
      
      console.warn(`Failed to update ${user.mtUrl}: ${errorMessage}`);
      if (errorMessage.includes('429') || errorMessage.includes('Rate limited')) {
        throw error;
      }
    }
  }
  
  private async fetchUserScores(username: string): Promise<UserScore> {
    try {
      return await this.fetchScoresViaAPI(username);
    } catch (apiError) {
      console.error(`API fetch failed for ${username}:`, apiError);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Skipping scraping fallback in development for ${username}`);
        throw new Error(`API failed and scraping disabled in development: ${apiError}`);
      }
      
      console.log(`Falling back to scraping for ${username}...`);
      return await this.fetchScoresViaScraping(username);
    }
  }
  private async fetchScoresViaAPI(username: string): Promise<UserScore> {
    console.log(`Fetching scores for ${username} via API...`);

    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const response = await fetch(`https://api.monkeytype.com/users/${username}/profile`, {
          headers: {
            'User-Agent': 'VIT-Typing-Stats/1.0', // Keep or update User-Agent as needed
          },
          signal: AbortSignal.timeout(8000), // 8 seconds timeout
        });

        if (response.status === 429) {
          const waitTime = Math.pow(2, retryCount) * 1000; 
          console.log(`Rate limited for ${username}. Waiting ${waitTime}ms before retry ${retryCount + 1}/${maxRetries}`);
          
          if (retryCount === maxRetries - 1) {
            // This specific error will be caught by updateUserData and then processUsersInBatches
            // to set the global rate limit time in Redis.
            throw new Error(`Rate limited after ${maxRetries} attempts (429)`);
          }
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error for ${username}: ${response.status} ${response.statusText} - ${errorText}`);
          throw new Error(`Monkeytype API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`API Response for ${username}:`, {
          hasData: !!data.data,
          hasPersonalBests: !!data.data?.personalBests,
          personalBestKeys: data.data?.personalBests ? Object.keys(data.data.personalBests) : [],
        });
        
        if (!data.data || !data.data.personalBests) {
          console.error(`No personal bests data for ${username}:`, data);
          throw new Error('No personal bests data found in API response');
        }

        const personalBests = data.data.personalBests;
        
        const getScoreForMode = (mode: string, duration: number) => {
          const modeData = personalBests[mode];
          if (!modeData || !Array.isArray(modeData[duration])) {
            return { wpm: null, raw: null, acc: null };
          }
          
          const bestScore = modeData[duration][0];
          if (!bestScore) {
            return { wpm: null, raw: null, acc: null };
          }

          return {
            wpm: bestScore.wpm || null,
            raw: bestScore.raw || null,
            acc: bestScore.acc || null,
          };
        };

        const time15 = getScoreForMode('time', 15);
        const time30 = getScoreForMode('time', 30);
        const time60 = getScoreForMode('time', 60);

        return {
          wpm15: time15.wpm,
          raw15: time15.raw,
          acc15: time15.acc,
          wpm30: time30.wpm,
          raw30: time30.raw,
          acc30: time30.acc,
          wpm60: time60.wpm,
          raw60: time60.raw,
          acc60: time60.acc,
        };
        
      } catch (error) {
        if (retryCount === maxRetries - 1) {
          throw error;
        }
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`Error fetching ${username}, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw new Error(`Failed to fetch data after ${maxRetries} attempts`);
  }

  private async fetchScoresViaScraping(username: string): Promise<UserScore> {
    const puppeteer = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium');

    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: chromium.default.headless,
    });

    try {
      const page = await browser.newPage();
      
      page.setDefaultTimeout(this.FETCH_TIMEOUT);
      
      await page.goto(`https://monkeytype.com/profile/${username}`, {
        waitUntil: "networkidle2",
        timeout: this.FETCH_TIMEOUT,
      });

      await page.waitForSelector(".pbsTime", { timeout: 5000 });

      const scores = await page.evaluate(() => {
        const extractNum = (selector: string) => {
          const el = document.querySelector(selector);
          if (!el) return null;
          const match = el.textContent?.match(/(\d+(\.\d+)?)/);
          return match ? parseFloat(match[1]) : null;
        };

        return {
          wpm15: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(1) > div.fullTest > div:nth-child(2)"),
          raw15: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(1) > div.fullTest > div:nth-child(3)"),
          acc15: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(1) > div.fullTest > div:nth-child(4)"),
          wpm30: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(2) > div.fullTest > div:nth-child(2)"),
          raw30: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(2) > div.fullTest > div:nth-child(3)"),
          acc30: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(2) > div.fullTest > div:nth-child(4)"),
          wpm60: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(3) > div.fullTest > div:nth-child(2)"),
          raw60: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(3) > div.fullTest > div:nth-child(3)"),
          acc60: extractNum("#pageProfile > div > div.profile > div.pbsTime > div:nth-child(3) > div.fullTest > div:nth-child(4)"),
        };
      });

      return scores;

    } finally {
      await browser.close();
    }
  }
  private async updateDatabaseScores(discordId: string, scores: UserScore): Promise<void> {
    try {
      const { default: prisma } = await import('@/lib/primsa'); 
      const lastWrite = await prisma.score.findFirst({
        where: { userId: discordId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      const now = new Date();
      const hoursSinceLastWrite = lastWrite 
        ? (now.getTime() - lastWrite.createdAt.getTime()) / (1000 * 60 * 60) 
        : 24;

      // Only write to database if it's been at least 12 hours (twice per day)
      // or if there's no previous record for this user
      const DB_WRITE_INTERVAL_HOURS = 12;
      
      if (hoursSinceLastWrite < DB_WRITE_INTERVAL_HOURS) {
        console.log(`Skipping database write for ${discordId} - last write was ${hoursSinceLastWrite.toFixed(1)} hours ago`);
        return;
      }

      console.log(`Writing scores to database for ${discordId}`);
      const scoreMap = [
        { type: "60", wpm: scores.wpm60, raw: scores.raw60, accuracy: scores.acc60 },
        { type: "30", wpm: scores.wpm30, raw: scores.raw30, accuracy: scores.acc30 },
        { type: "15", wpm: scores.wpm15, raw: scores.raw15, accuracy: scores.acc15 },
      ];

      for (const s of scoreMap) {
        if (s.wpm !== null && !isNaN(s.wpm)) {
          await prisma.score.upsert({
            where: {
              userId_testType: {
                userId: discordId,
                testType: s.type,
              },
            },
            update: {
              wpm: s.wpm,
              raw: s.raw,
              accuracy: s.accuracy,
              createdAt: new Date(),
            },
            create: {
              userId: discordId,
              testType: s.type,
              wpm: s.wpm,
              raw: s.raw,
              accuracy: s.accuracy,
            },
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to update database scores for ${discordId}:`, error);
    }
  }

  private getEmptyScores(): UserScore {
    return {
      wpm15: null,
      raw15: null,
      acc15: null,
      wpm30: null,
      raw30: null,
      acc30: null,
      wpm60: null,
      raw60: null,
      acc60: null,
    };
  }
}

const cacheManager = new MonkeytypeCacheManager();

export default cacheManager;

export type { CachedUserData, UserScore };
