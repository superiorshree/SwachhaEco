import app from './app';
import { isSupabaseConfigured } from './db/supabaseClient';
import { initDatabase } from './db/database';
import { seedDatabase } from './db/seed';

const PORT = process.env.PORT || 8080;

async function start() {
  if (!isSupabaseConfigured) {
    // Initialize and seed local SQLite database when Supabase is not active
    await initDatabase();
    await seedDatabase(false);
  } else {
    console.log('Using Supabase Cloud Database. Local SQLite initialization bypassed.');
  }

  app.listen(PORT, () => {
    console.log(`SwachhaEco Server listening on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
