import { dbAdapter } from '../db/dbAdapter';

export interface ReputationResult {
  verified: boolean;
  points: number;
  streak_count: number;
  badges: string[];
  completedCount: number;
  rejectedCount: number;
  changes: string[];
}

export async function evaluateUserReputation(userId: string): Promise<ReputationResult> {
  const user = await dbAdapter.getUserById(userId);
  if (!user || user.role !== 'user') {
    return {
      verified: false,
      points: 0,
      streak_count: 0,
      badges: [],
      completedCount: 0,
      rejectedCount: 0,
      changes: []
    };
  }

  // Retrieve user requests
  const userRequests = await dbAdapter.getUserRequests(userId);
  const completedRequests = userRequests.filter(r => r.status === 'Completed');
  const rejectedRequests = userRequests.filter(r => r.status === 'Rejected');

  const completedCount = completedRequests.length;
  const rejectedCount = rejectedRequests.length;
  const changes: string[] = [];

  // 1. Verified Badge Rule: >= 5 Completed and 0 Rejected
  const shouldBeVerified = completedCount >= 5 && rejectedCount === 0;
  const currentVerified = Boolean(user.verified);
  let newVerified = currentVerified;

  if (shouldBeVerified && !currentVerified) {
    newVerified = true;
    changes.push('Awarded Verified Citizen Badge (5+ clean pickups)!');
  } else if (!shouldBeVerified && currentVerified && rejectedCount > 0) {
    newVerified = false;
    changes.push('Verified Citizen Badge revoked due to rejected request.');
  }

  // 2. Points Engine: 50 points per completed request
  const newPoints = completedCount * 50;

  // 3. Weekly streak calculation (calendar weeks with at least 1 completed request)
  let streak = 0;
  if (completedRequests.length > 0) {
    const activeWeeks = new Set<string>();
    for (const req of completedRequests) {
      const d = new Date(req.pickup_date);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        activeWeeks.add(`${year}-W${weekNum}`);
      }
    }
    streak = activeWeeks.size;
  }

  // 4. Badges Evaluation
  const currentBadges: string[] = user.badges || [];
  const newBadgesSet = new Set<string>(currentBadges);

  if (completedCount >= 1 && !newBadgesSet.has('green_starter')) {
    newBadgesSet.add('green_starter');
    changes.push('Unlocked Green Starter badge!');
  }
  if (newPoints >= 150 && !newBadgesSet.has('eco_warrior')) {
    newBadgesSet.add('eco_warrior');
    changes.push('Unlocked Eco Warrior badge!');
  }
  if (newPoints >= 300 && !newBadgesSet.has('recycling_champion')) {
    newBadgesSet.add('recycling_champion');
    changes.push('Unlocked Recycling Champion badge!');
  }
  if (newPoints >= 500 && streak >= 4 && !newBadgesSet.has('zero_waste_hero')) {
    newBadgesSet.add('zero_waste_hero');
    changes.push('Unlocked Zero Waste Hero badge!');
  }

  const finalBadges = Array.from(newBadgesSet);

  // Update through database adapter
  await dbAdapter.updateUserReputation(userId, {
    verified: newVerified,
    points: newPoints,
    streak_count: streak,
    badges: finalBadges
  });

  return {
    verified: newVerified,
    points: newPoints,
    streak_count: streak,
    badges: finalBadges,
    completedCount,
    rejectedCount,
    changes
  };
}
