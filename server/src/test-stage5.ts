import { run, get, query } from './db/database';
import { evaluateUserReputation } from './services/trustService';

async function testStage5() {
  console.log('=== STAGE 5 VERIFICATION TEST ===\n');

  // 1. Initial State for user_priya
  const priyaInitial = await get('SELECT id, name, verified, points, badges FROM users WHERE id = ?', ['user_priya']);
  console.log('1. Priya Initial State:');
  console.log('   Name:', priyaInitial.name);
  console.log('   Verified:', Boolean(priyaInitial.verified));
  console.log('   Points:', priyaInitial.points);

  // 2. Add 4 completed requests for Priya (to reach 5 completed, 0 rejected)
  console.log('\n2. Simulating fulfillment of 4 more clean pickups for Priya...');
  for (let i = 1; i <= 4; i++) {
    const reqId = `req_priya_test_${i}`;
    const date = `2026-09-2${i}`;
    await run(`
      INSERT OR REPLACE INTO requests 
      (id, user_id, waste_category, pickup_location, pickup_date, photo_url, photo_exif_present, photo_gps_match, status, rejection_reason, collector_id, created_at, updated_at)
      VALUES (?, 'user_priya', 'Plastic', '12 Oak Ridge Blvd', ?, 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b', 1, 1, 'Completed', NULL, 'collector_sam', ?, ?)
    `, [reqId, date, new Date().toISOString(), new Date().toISOString()]);

    // Run event-driven check
    await evaluateUserReputation('user_priya');
  }

  // 3. Verify Priya's new standing
  const priyaAfter5 = await get('SELECT id, name, verified, points, streak_count, badges FROM users WHERE id = ?', ['user_priya']);
  console.log('\n3. Priya Standing After 5 Completed Pickups:');
  console.log('   Verified Badge Auto-Awarded:', Boolean(priyaAfter5.verified));
  console.log('   Points Balance:', priyaAfter5.points);
  console.log('   Streak (Weeks):', priyaAfter5.streak_count);
  console.log('   Badges Earned:', priyaAfter5.badges);

  if (!priyaAfter5.verified) {
    throw new Error('FAIL: Verified badge was not auto-awarded at 5 completed pickups!');
  }
  console.log('   >>> PASS: Verified badge successfully auto-awarded upon reaching 5 completed requests!');

  // 4. Test Bidirectional Rating on same Request record
  console.log('\n4. Testing Bidirectional Rating on req_priya_test_1:');
  const reqId = 'req_priya_test_1';

  // Collector rates User
  await run(`
    INSERT OR REPLACE INTO ratings (id, request_id, rater_id, rater_role, target_id, rating, comment, created_at)
    VALUES ('rat_col_priya', ?, 'collector_sam', 'collector', 'user_priya', 5, 'Perfect segregation.', ?)
  `, [reqId, new Date().toISOString()]);

  // User rates Collector
  await run(`
    INSERT OR REPLACE INTO ratings (id, request_id, rater_id, rater_role, target_id, rating, comment, created_at)
    VALUES ('rat_priya_col', ?, 'user_priya', 'user', 'collector_sam', 5, 'Arrived exactly on schedule!', ?)
  `, [reqId, new Date().toISOString()]);

  // Query request with both ratings attached
  const combined = await get(`
    SELECT 
      r.id,
      r.user_id,
      r.collector_id,
      (SELECT rating FROM ratings WHERE request_id = r.id AND rater_role = 'collector') as collector_rating,
      (SELECT comment FROM ratings WHERE request_id = r.id AND rater_role = 'collector') as collector_comment,
      (SELECT rating FROM ratings WHERE request_id = r.id AND rater_role = 'user') as user_rating,
      (SELECT comment FROM ratings WHERE request_id = r.id AND rater_role = 'user') as user_comment
    FROM requests r
    WHERE r.id = ?
  `, [reqId]);

  console.log('   Combined Request Record:');
  console.log('   - Request ID:', combined.id);
  console.log('   - Collector -> Citizen Rating:', combined.collector_rating, 'stars ("' + combined.collector_comment + '")');
  console.log('   - Citizen -> Collector Rating:', combined.user_rating, 'stars ("' + combined.user_comment + '")');

  if (combined.collector_rating !== 5 || combined.user_rating !== 5) {
    throw new Error('FAIL: Bidirectional ratings not properly stored or retrieved on request record!');
  }
  console.log('   >>> PASS: Both ratings successfully stored and retrieved against the same Request record!');

  // 5. Test Revocation on Rejection
  console.log('\n5. Testing Badge Revocation if a rejection occurs...');
  const rejectedReqId = 'req_priya_rejected_test';
  await run(`
    INSERT OR REPLACE INTO requests 
    (id, user_id, waste_category, pickup_location, pickup_date, photo_url, photo_exif_present, photo_gps_match, status, rejection_reason, collector_id, created_at, updated_at)
    VALUES (?, 'user_priya', 'Plastic', '12 Oak Ridge Blvd', '2026-09-25', 'url', 0, 0, 'Rejected', 'Fake photo', 'collector_sam', ?, ?)
  `, [rejectedReqId, new Date().toISOString(), new Date().toISOString()]);

  await evaluateUserReputation('user_priya');

  const priyaAfterRejection = await get('SELECT verified FROM users WHERE id = ?', ['user_priya']);
  console.log('   Verified Badge After Rejection:', Boolean(priyaAfterRejection.verified));
  if (priyaAfterRejection.verified !== 0) {
    throw new Error('FAIL: Verified badge was not revoked after rejected request!');
  }
  console.log('   >>> PASS: Verified badge properly revoked when rejection occurred!');

  console.log('\n=== ALL STAGE 5 TRUST LAYER TESTS PASSED ===');
}

testStage5().catch(console.error);
