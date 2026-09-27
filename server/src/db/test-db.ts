import { initDatabase, query } from './database';
import { seedDatabase } from './seed';

async function test() {
  console.log('Initializing database schema...');
  await initDatabase();
  console.log('Running seed...');
  await seedDatabase(true);

  const users = await query('SELECT id, name, role, verified, points, streak_count FROM users');
  console.log('Users count:', users.length);
  console.table(users);

  const requests = await query('SELECT id, user_id, waste_category, status, photo_exif_present, rejection_reason FROM requests');
  console.log('Requests count:', requests.length);
  console.table(requests);

  const ratings = await query('SELECT * FROM ratings');
  console.log('Ratings count:', ratings.length);
  console.table(ratings);

  const badges = await query('SELECT * FROM badges');
  console.log('Badges count:', badges.length);
  console.table(badges);
}

test().catch(console.error);
