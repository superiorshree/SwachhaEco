import { run, query, initDatabase } from './database';

export async function seedDatabase(force = false): Promise<void> {
  await initDatabase();

  const existingUsers = await query('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0]?.count > 0 && !force) {
    console.log('Database already contains records. Skipping seed.');
    return;
  }

  // Clear existing if force
  if (force) {
    await run('DELETE FROM ratings');
    await run('DELETE FROM requests');
    await run('DELETE FROM users');
    await run('DELETE FROM badges');
  }

  console.log('Seeding initial badges...');
  const badges = [
    {
      id: 'green_starter',
      name: 'Green Starter (Paryavaran Mitra)',
      description: 'Completed your first verified waste segregation & collection in your civic zone.',
      min_points: 50,
      min_streak: 1
    },
    {
      id: 'eco_warrior',
      name: 'Eco Warrior (Paryavaran Rakshak)',
      description: 'Accumulated 150+ recycling points across clean civic zone pickups.',
      min_points: 150,
      min_streak: 2
    },
    {
      id: 'recycling_champion',
      name: 'Recycling Champion (Swachhata Doot)',
      description: 'Reached 300+ points with consistent weekly source segregation excellence.',
      min_points: 300,
      min_streak: 3
    },
    {
      id: 'zero_waste_hero',
      name: 'Zero Waste Hero (Shunya Kachra Leader)',
      description: 'Achieved 500+ points and demonstrated a 4-week active segregation streak.',
      min_points: 500,
      min_streak: 4
    }
  ];

  for (const b of badges) {
    await run(
      'INSERT OR REPLACE INTO badges (id, name, description, min_points, min_streak) VALUES (?, ?, ?, ?, ?)',
      [b.id, b.name, b.description, b.min_points, b.min_streak]
    );
  }

  console.log('Seeding demo users...');
  // Seed Users:
  // 1. Shreeyansh Mahamuni: Model citizen, Sector 4 resident, verified badge, 350 pts
  // 2. Priya Deshmukh: Active beginner in Green Valley Zone, 100 pts
  // 3. Rohan Shinde: Problematic user in Industrial Zone with 3 rejections (fraud flag)
  // 4. Santosh Shinde: Certified Field Collector #1 (Zone 1)
  // 5. Sunita Kamble: Certified Field Collector #2 (Zone 2)
  // 6. Mahesh Gokhale: Solid Waste Management Officer (Operations Admin)
  const users = [
    {
      id: 'user_shreeyansh',
      name: 'Shreeyansh Mahamuni',
      contact_info: 'shreeyansh.mahamuni@SwachhaEco.app',
      role: 'user',
      verified: 1, // Verified Citizen Badge earned! (5+ completed, 0 rejected)
      points: 350,
      streak_count: 3,
      badges: JSON.stringify(['green_starter', 'eco_warrior', 'recycling_champion']),
      created_at: '2026-08-01T09:00:00.000Z'
    },
    {
      id: 'user_priya',
      name: 'Priya Deshmukh',
      contact_info: 'priya.deshmukh@SwachhaEco.app',
      role: 'user',
      verified: 0,
      points: 100,
      streak_count: 2,
      badges: JSON.stringify(['green_starter']),
      created_at: '2026-08-15T10:30:00.000Z'
    },
    {
      id: 'user_rohan',
      name: 'Rohan Shinde',
      contact_info: 'rohan.shinde@SwachhaEco.app',
      role: 'user',
      verified: 0,
      points: 0,
      streak_count: 0,
      badges: JSON.stringify([]),
      created_at: '2026-09-01T11:00:00.000Z'
    },
    {
      id: 'collector_santosh',
      name: 'Santosh Shinde',
      contact_info: 'santosh.collector@SwachhaEco.app',
      role: 'collector',
      verified: 1,
      points: 0,
      streak_count: 0,
      badges: JSON.stringify([]),
      created_at: '2026-07-10T08:00:00.000Z'
    },
    {
      id: 'collector_sunita',
      name: 'Sunita Kamble',
      contact_info: 'sunita.kamble@SwachhaEco.app',
      role: 'collector',
      verified: 1,
      points: 0,
      streak_count: 0,
      badges: JSON.stringify([]),
      created_at: '2026-07-15T08:30:00.000Z'
    },
    {
      id: 'admin_mahesh',
      name: 'Mahesh Gokhale',
      contact_info: 'mahesh.gokhale@SwachhaEco.app',
      role: 'admin',
      verified: 1,
      points: 0,
      streak_count: 0,
      badges: JSON.stringify([]),
      created_at: '2026-06-01T07:00:00.000Z'
    }
  ];

  for (const u of users) {
    await run(
      `INSERT OR REPLACE INTO users 
       (id, name, contact_info, role, verified, points, streak_count, badges, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.contact_info, u.role, u.verified, u.points, u.streak_count, u.badges, u.created_at]
    );
  }

  console.log('Seeding demo pickup requests...');
  const requests = [
    // Completed requests for Shreeyansh Mahamuni (5 completed, 0 rejected -> Verified Citizen Badge!)
    {
      id: 'req_shreeyansh_01',
      user_id: 'user_shreeyansh',
      waste_category: 'Plastic',
      pickup_location: 'Flat 402, Mayur Vihar, Sector 4 - 411038',
      pickup_date: '2026-09-10',
      // Plastic bottles & containers segregated
      photo_url: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 1,
      photo_gps_match: 1,
      status: 'Completed',
      rejection_reason: null,
      collector_id: 'collector_santosh',
      created_at: '2026-09-10T08:15:00.000Z',
      updated_at: '2026-09-10T11:30:00.000Z'
    },
    {
      id: 'req_shreeyansh_02',
      user_id: 'user_shreeyansh',
      waste_category: 'Paper',
      pickup_location: 'Flat 402, Mayur Vihar, Sector 4 - 411038',
      pickup_date: '2026-09-14',
      // Stacked paper & cardboard
      photo_url: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 1,
      photo_gps_match: 1,
      status: 'Completed',
      rejection_reason: null,
      collector_id: 'collector_santosh',
      created_at: '2026-09-14T09:00:00.000Z',
      updated_at: '2026-09-14T12:00:00.000Z'
    },
    {
      id: 'req_shreeyansh_03',
      user_id: 'user_shreeyansh',
      waste_category: 'E-Waste',
      pickup_location: 'Flat 402, Mayur Vihar, Sector 4 - 411038',
      pickup_date: '2026-09-18',
      // Old electronics & circuit boards
      photo_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 1,
      photo_gps_match: 1,
      status: 'Completed',
      rejection_reason: null,
      collector_id: 'collector_sunita',
      created_at: '2026-09-18T10:00:00.000Z',
      updated_at: '2026-09-18T14:10:00.000Z'
    },
    {
      id: 'req_shreeyansh_04',
      user_id: 'user_shreeyansh',
      waste_category: 'Organic',
      pickup_location: 'Flat 402, Mayur Vihar, Sector 4 - 411038',
      pickup_date: '2026-09-22',
      // Fruit & vegetable organic waste
      photo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 1,
      photo_gps_match: 1,
      status: 'Completed',
      rejection_reason: null,
      collector_id: 'collector_santosh',
      created_at: '2026-09-22T08:30:00.000Z',
      updated_at: '2026-09-22T11:45:00.000Z'
    },
    {
      id: 'req_shreeyansh_05',
      user_id: 'user_shreeyansh',
      waste_category: 'Plastic',
      pickup_location: 'Flat 402, Mayur Vihar, Sector 4 - 411038',
      pickup_date: '2026-09-25',
      // Plastic waste sorted in bag
      photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 1,
      photo_gps_match: 1,
      status: 'Completed',
      rejection_reason: null,
      collector_id: 'collector_sunita',
      created_at: '2026-09-25T09:15:00.000Z',
      updated_at: '2026-09-25T13:20:00.000Z'
    },
    // Active request for Priya Deshmukh (Assigned to Santosh Shinde in Zone 3)
    {
      id: 'req_priya_01',
      user_id: 'user_priya',
      waste_category: 'E-Waste',
      pickup_location: 'Building B, Rohan Mithila, Zone 3 - 411014',
      pickup_date: '2026-09-27',
      photo_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 1,
      photo_gps_match: 1,
      status: 'Assigned',
      rejection_reason: null,
      collector_id: 'collector_santosh',
      created_at: '2026-09-27T08:00:00.000Z',
      updated_at: '2026-09-27T08:15:00.000Z'
    },
    // Unassigned request in Zone 2 (Claimable pool for collectors)
    {
      id: 'req_priya_02',
      user_id: 'user_priya',
      waste_category: 'Organic',
      pickup_location: 'Survey 45, Sector Road, Zone 2 - 411045',
      pickup_date: '2026-09-28',
      photo_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 1,
      photo_gps_match: null,
      status: 'Submitted',
      rejection_reason: null,
      collector_id: null,
      created_at: '2026-09-27T10:00:00.000Z',
      updated_at: '2026-09-27T10:00:00.000Z'
    },
    // On the Way request for Sunita Kamble in Zone 2
    {
      id: 'req_shreeyansh_06',
      user_id: 'user_shreeyansh',
      waste_category: 'Paper',
      pickup_location: 'Near Main Square, DP Road, Zone 2 - 411007',
      pickup_date: '2026-09-27',
      photo_url: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 1,
      photo_gps_match: 1,
      status: 'On the Way',
      rejection_reason: null,
      collector_id: 'collector_sunita',
      created_at: '2026-09-27T07:30:00.000Z',
      updated_at: '2026-09-27T09:00:00.000Z'
    },
    // Flagged user Rohan Shinde's rejected requests in Industrial Sector (3 rejections -> flagged for fraud audit)
    {
      id: 'req_rohan_01',
      user_id: 'user_rohan',
      waste_category: 'Plastic',
      pickup_location: 'Plot 88, Sector Road, Industrial Zone - 411028',
      pickup_date: '2026-09-02',
      photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 0, // No EXIF metadata detected
      photo_gps_match: 0,
      status: 'Rejected',
      rejection_reason: 'No waste found at location outside society gate',
      collector_id: 'collector_santosh',
      created_at: '2026-09-02T11:00:00.000Z',
      updated_at: '2026-09-02T14:30:00.000Z'
    },
    {
      id: 'req_rohan_02',
      user_id: 'user_rohan',
      waste_category: 'E-Waste',
      pickup_location: 'Plot 88, Sector Road, Industrial Zone - 411028',
      pickup_date: '2026-09-08',
      photo_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 0,
      photo_gps_match: 0,
      status: 'Rejected',
      rejection_reason: 'Fake request / downloaded internet image detected',
      collector_id: 'collector_sunita',
      created_at: '2026-09-08T10:15:00.000Z',
      updated_at: '2026-09-08T12:00:00.000Z'
    },
    {
      id: 'req_rohan_03',
      user_id: 'user_rohan',
      waste_category: 'Medical',
      pickup_location: 'Plot 88, Sector Road, Industrial Zone - 411028',
      pickup_date: '2026-09-15',
      photo_url: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
      photo_exif_present: 0,
      photo_gps_match: 0,
      status: 'Rejected',
      rejection_reason: 'Duplicate request already logged by neighbor',
      collector_id: 'collector_santosh',
      created_at: '2026-09-15T13:00:00.000Z',
      updated_at: '2026-09-15T15:20:00.000Z'
    }
  ];

  for (const r of requests) {
    await run(
      `INSERT OR REPLACE INTO requests 
       (id, user_id, waste_category, pickup_location, pickup_date, photo_url, photo_exif_present, photo_gps_match, status, rejection_reason, collector_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.id,
        r.user_id,
        r.waste_category,
        r.pickup_location,
        r.pickup_date,
        r.photo_url,
        r.photo_exif_present,
        r.photo_gps_match,
        r.status,
        r.rejection_reason,
        r.collector_id,
        r.created_at,
        r.updated_at
      ]
    );
  }

  console.log('Seeding bidirectional ratings...');
  const ratings = [
    // Collector Santosh rated Shreeyansh Mahamuni for request 1
    {
      id: 'rat_santosh_shreeyansh_01',
      request_id: 'req_shreeyansh_01',
      rater_id: 'collector_santosh',
      rater_role: 'collector',
      target_id: 'user_shreeyansh',
      rating: 5,
      comment: 'Dry plastic bottles were neatly crushed and segregated in blue bag outside society.',
      created_at: '2026-09-10T11:35:00.000Z'
    },
    // User Shreeyansh rated Collector Santosh for request 1
    {
      id: 'rat_shreeyansh_santosh_01',
      request_id: 'req_shreeyansh_01',
      rater_id: 'user_shreeyansh',
      rater_role: 'user',
      target_id: 'collector_santosh',
      rating: 5,
      comment: 'Santosh arrived right on time on the morning collection route. Very polite and efficient!',
      created_at: '2026-09-10T12:00:00.000Z'
    },
    // Collector Sunita rated Shreeyansh for request 3
    {
      id: 'rat_sunita_shreeyansh_01',
      request_id: 'req_shreeyansh_03',
      rater_id: 'collector_sunita',
      rater_role: 'collector',
      target_id: 'user_shreeyansh',
      rating: 5,
      comment: 'E-waste properly boxed with old chargers and cables bundled together.',
      created_at: '2026-09-18T14:15:00.000Z'
    }
  ];

  for (const rt of ratings) {
    await run(
      `INSERT OR REPLACE INTO ratings 
       (id, request_id, rater_id, rater_role, target_id, rating, comment, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [rt.id, rt.request_id, rt.rater_id, rt.rater_role, rt.target_id, rt.rating, rt.comment, rt.created_at]
    );
  }

  console.log('Database seeded successfully with demo data!');
}
