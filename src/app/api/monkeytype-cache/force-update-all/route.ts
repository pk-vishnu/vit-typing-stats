import { NextRequest, NextResponse } from 'next/server';
import cacheManager from '@/lib/monkeytypeCache';

export async function GET(req: NextRequest) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('API: Received authorized request to force update all Monkeytype cache.');
  try {
    // Intentionally not awaiting this, as it can take a while
    // and we want to respond to the uptime bot quickly.
    // The update will run in the background.
    cacheManager.forceUpdate().catch(error => {
      console.error('API: Background cache update failed:', error);
    });
    
    return NextResponse.json({ message: 'Global cache update initiated.' }, { status: 202 });
  } catch (error) {
    console.error('API: Error initiating global cache update:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error initiating global cache update', error: errorMessage }, { status: 500 });
  }
}