import app from '../server/src/app';
import { isSupabaseConfigured } from '../server/src/db/supabaseClient';
import { initDatabase } from '../server/src/db/database';
import { seedDatabase } from '../server/src/db/seed';

// Initialize DB synchronously-ish or let the first request trigger it
let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function setupDb() {
  if (isSupabaseConfigured) return;
  await initDatabase();
  await seedDatabase(false);
}

// Wrapping the app to ensure DB is initialized before handling requests
const vercelHandler = async (req: any, res: any) => {
  if (!isInitialized) {
    if (!initPromise) {
      initPromise = setupDb().then(() => {
        isInitialized = true;
      });
    }
    await initPromise;
  }
  return app(req, res);
};

export default vercelHandler;
