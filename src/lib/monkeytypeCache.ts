/**
 * Centralized Monkeytype Data Cache Manager
 * 
 * This service manages fetching and caching Monkeytype user data with automatic
 * background updates every 5 minutes. It prevents excessive API requests by
 * serving cached data and only refreshing when the cache expires.
 */

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

interface CacheEntry {
  data: Map<string, CachedUserData>;
  lastGlobalUpdate: number;
  isUpdating: boolean;
}

class MonkeytypeCacheManager {
  private cache: CacheEntry = {
    data: new Map(),
    lastGlobalUpdate: 0,
    isUpdating: false,
  };

  private readonly CACHE_DURATION = 5 * 60 * 1000;
  private readonly MAX_FETCH_ATTEMPTS = 3;
  private readonly FETCH_TIMEOUT = 10000;
  private readonly RATE_LIMIT_DELAY = 5 * 60 * 1000;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastRateLimitTime = 0;

  constructor() {
    this.startBackgroundUpdates();
  }

  private startBackgroundUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    setTimeout(() => {
      this.updateCache();
    }, 2000);

    this.updateInterval = setInterval(() => {
      this.updateCache();
    }, this.CACHE_DURATION);

    console.log('Monkeytype cache manager started - updating every 5 minutes');
  }

  public stopBackgroundUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('Monkeytype cache manager stopped');
  }

  public getCachedData(): CachedUserData[] {
    return Array.from(this.cache.data.values());
  }

  public getCachedUserData(discordId: string): CachedUserData | null {
    return this.cache.data.get(discordId) || null;
  }

  public getCacheStats() {
    const now = Date.now();
    const cacheAge = now - this.cache.lastGlobalUpdate;
    const userCount = this.cache.data.size;
    const freshDataCount = Array.from(this.cache.data.values())
      .filter(user => now - user.lastFetched < this.CACHE_DURATION).length;

    return {
      userCount,
      freshDataCount,
      staleDataCount: userCount - freshDataCount,
      lastGlobalUpdate: this.cache.lastGlobalUpdate,
      cacheAge,
      isUpdating: this.cache.isUpdating,
      nextUpdateIn: Math.max(0, this.CACHE_DURATION - cacheAge),
    };
  }

  public async forceUpdate(): Promise<void> {
    await this.updateCache();
  }  private async updateCache(): Promise<void> {
    if (this.cache.isUpdating) {
      console.log('Cache update already in progress, skipping...');
      return;
    }

    const now = Date.now();
    if (now - this.lastRateLimitTime < this.RATE_LIMIT_DELAY) {
      const remainingTime = Math.ceil((this.RATE_LIMIT_DELAY - (now - this.lastRateLimitTime)) / 1000);
      console.log(`Rate limited. Skipping update. ${remainingTime}s remaining in cooldown.`);
      return;
    }

    this.cache.isUpdating = true;
    const startTime = Date.now();

    try {
      console.log('Starting Monkeytype cache update...');

      const users = await this.getVerifiedUsers();
      console.log(`Found ${users.length} verified Monkeytype users`);

      if (users.length === 0) {
        console.log('ℹNo verified users found, cache update complete');
        this.cache.lastGlobalUpdate = Date.now();
        return;
      }

      const results = await this.processUsersInBatches(users, 1);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      this.cache.lastGlobalUpdate = Date.now();
      const duration = Date.now() - startTime;

      console.log(`Cache update complete: ${successful} successful, ${failed} failed (${duration}ms)`);

      results.slice(0, 3).forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to update user ${users[index]?.mtUrl}:`, result.reason);
        }
      });

    } catch (error) {
      console.error('Cache update failed:', error);
      this.cache.lastGlobalUpdate = Date.now();
    } finally {
      this.cache.isUpdating = false;
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
        this.lastRateLimitTime = Date.now();
        break;
      }
      
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
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
    const existingData = this.cache.data.get(user.discordId);
    
    if (existingData && 
        existingData.fetchAttempts >= this.MAX_FETCH_ATTEMPTS &&
        Date.now() - existingData.lastFetched < 5 * 60 * 1000) {
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

      this.cache.data.set(user.discordId, userData);

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

      this.cache.data.set(user.discordId, userData);
      
      console.warn(`Failed to update ${user.mtUrl}: ${errorMessage}`);
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
            'User-Agent': 'VIT-Typing-Stats/1.0',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (response.status === 429) {
          const waitTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`Rate limited for ${username}. Waiting ${waitTime}ms before retry ${retryCount + 1}/${maxRetries}`);
          
          if (retryCount === maxRetries - 1) {
            this.lastRateLimitTime = Date.now();
            throw new Error(`Rate limited after ${maxRetries} attempts`);
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
