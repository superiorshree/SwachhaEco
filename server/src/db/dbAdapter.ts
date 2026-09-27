import { isSupabaseConfigured, supabase } from './supabaseClient';
import { query as sqliteQuery, get as sqliteGet, run as sqliteRun } from './database';

export interface UserRow {
  id: string;
  name: string;
  contact_info: string;
  role: 'user' | 'collector' | 'admin';
  verified: boolean;
  points: number;
  streak_count: number;
  badges: string[];
  created_at: string;
  open_request_count?: number;
  completed_request_count?: number;
  rejected_request_count?: number;
}

export interface RequestRow {
  id: string;
  user_id: string;
  waste_category: string;
  pickup_location: string;
  pickup_date: string;
  photo_url: string;
  photo_exif_present: boolean;
  photo_gps_match: boolean | null;
  status: 'Submitted' | 'Assigned' | 'On the Way' | 'Completed' | 'Rejected';
  rejection_reason?: string | null;
  collector_id?: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_contact?: string;
  collector_name?: string;
  collector_contact?: string;
  collector_rating?: number | null;
  collector_comment?: string | null;
  user_rating?: number | null;
  user_comment?: string | null;
}

export interface RatingRow {
  id: string;
  request_id: string;
  rater_id: string;
  rater_role: 'user' | 'collector';
  target_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  rater_name?: string;
  target_name?: string;
}

export interface BadgeRow {
  id: string;
  name: string;
  description: string;
  min_points: number;
  min_streak: number;
}

function normalizeUser(u: any): UserRow {
  return {
    ...u,
    verified: Boolean(u.verified),
    points: Number(u.points || 0),
    streak_count: Number(u.streak_count || 0),
    badges: Array.isArray(u.badges) ? u.badges : JSON.parse(u.badges || '[]'),
    open_request_count: Number(u.open_request_count || 0),
    completed_request_count: Number(u.completed_request_count || 0),
    rejected_request_count: Number(u.rejected_request_count || 0),
  };
}

export const dbAdapter = {
  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------
  async getUsers(): Promise<UserRow[]> {
    if (isSupabaseConfigured && supabase) {
      // In Supabase, fetch users and compute counts
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('role', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      const { data: reqs } = await supabase
        .from('requests')
        .select('user_id, status');

      const countsByUser: Record<string, { open: number; completed: number; rejected: number }> = {};
      (reqs || []).forEach(r => {
        if (!countsByUser[r.user_id]) {
          countsByUser[r.user_id] = { open: 0, completed: 0, rejected: 0 };
        }
        if (r.status === 'Completed') countsByUser[r.user_id].completed++;
        else if (r.status === 'Rejected') countsByUser[r.user_id].rejected++;
        else countsByUser[r.user_id].open++;
      });

      return (users || []).map(u => ({
        ...normalizeUser(u),
        open_request_count: countsByUser[u.id]?.open || 0,
        completed_request_count: countsByUser[u.id]?.completed || 0,
        rejected_request_count: countsByUser[u.id]?.rejected || 0,
      }));
    }

    // SQLite
    const users = await sqliteQuery(`
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id AND r.status NOT IN ('Completed', 'Rejected')) as open_request_count,
        (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id AND r.status = 'Completed') as completed_request_count,
        (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id AND r.status = 'Rejected') as rejected_request_count
      FROM users u
      ORDER BY u.role, u.name
    `);
    return users.map(normalizeUser);
  },

  async getUserById(id: string): Promise<UserRow | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!user) return null;

      const { data: reqs } = await supabase
        .from('requests')
        .select('status')
        .eq('user_id', id);

      let open = 0, completed = 0, rejected = 0;
      (reqs || []).forEach(r => {
        if (r.status === 'Completed') completed++;
        else if (r.status === 'Rejected') rejected++;
        else open++;
      });

      return {
        ...normalizeUser(user),
        open_request_count: open,
        completed_request_count: completed,
        rejected_request_count: rejected,
      };
    }

    // SQLite
    const user = await sqliteGet(`
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id AND r.status NOT IN ('Completed', 'Rejected')) as open_request_count,
        (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id AND r.status = 'Completed') as completed_request_count,
        (SELECT COUNT(*) FROM requests r WHERE r.user_id = u.id AND r.status = 'Rejected') as rejected_request_count
      FROM users u
      WHERE u.id = ?
    `, [id]);

    return user ? normalizeUser(user) : null;
  },

  async updateUserReputation(
    userId: string,
    data: { verified: boolean; points: number; streak_count: number; badges: string[] }
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('users')
        .update({
          verified: data.verified,
          points: data.points,
          streak_count: data.streak_count,
          badges: data.badges
        })
        .eq('id', userId);

      if (error) throw error;
      return;
    }

    // SQLite
    await sqliteRun(`
      UPDATE users 
      SET verified = ?, points = ?, streak_count = ?, badges = ?
      WHERE id = ?
    `, [data.verified ? 1 : 0, data.points, data.streak_count, JSON.stringify(data.badges), userId]);
  },

  // --------------------------------------------------------------------------
  // REQUESTS
  // --------------------------------------------------------------------------
  async getRequestsOverview(): Promise<RequestRow[]> {
    if (isSupabaseConfigured && supabase) {
      const { data: requests, error } = await supabase
        .from('requests')
        .select(`
          *,
          user:users!requests_user_id_fkey(name, contact_info),
          collector:users!requests_collector_id_fkey(name, contact_info),
          ratings(rater_role, rating, comment)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (requests || []).map((r: any) => {
        const ratings = r.ratings || [];
        const collectorRating = ratings.find((rt: any) => rt.rater_role === 'collector');
        const userRating = ratings.find((rt: any) => rt.rater_role === 'user');

        return {
          id: r.id,
          user_id: r.user_id,
          waste_category: r.waste_category,
          pickup_location: r.pickup_location,
          pickup_date: r.pickup_date,
          photo_url: r.photo_url,
          photo_exif_present: Boolean(r.photo_exif_present),
          photo_gps_match: r.photo_gps_match === null ? null : Boolean(r.photo_gps_match),
          status: r.status,
          rejection_reason: r.rejection_reason,
          collector_id: r.collector_id,
          created_at: r.created_at,
          updated_at: r.updated_at,
          user_name: r.user?.name || 'Unknown Citizen',
          user_contact: r.user?.contact_info || '',
          collector_name: r.collector?.name || null,
          collector_contact: r.collector?.contact_info || null,
          collector_rating: collectorRating?.rating || null,
          collector_comment: collectorRating?.comment || null,
          user_rating: userRating?.rating || null,
          user_comment: userRating?.comment || null,
        };
      });
    }

    // SQLite
    const requests = await sqliteQuery(`
      SELECT 
        r.*,
        u.name as user_name,
        u.contact_info as user_contact,
        c.name as collector_name,
        c.contact_info as collector_contact,
        (SELECT rating FROM ratings WHERE request_id = r.id AND rater_role = 'collector') as collector_rating,
        (SELECT comment FROM ratings WHERE request_id = r.id AND rater_role = 'collector') as collector_comment,
        (SELECT rating FROM ratings WHERE request_id = r.id AND rater_role = 'user') as user_rating,
        (SELECT comment FROM ratings WHERE request_id = r.id AND rater_role = 'user') as user_comment
      FROM requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN users c ON r.collector_id = c.id
      ORDER BY r.created_at DESC
    `);

    return requests.map(r => ({
      ...r,
      photo_exif_present: Boolean(r.photo_exif_present),
      photo_gps_match: r.photo_gps_match === null ? null : Boolean(r.photo_gps_match),
    }));
  },

  async getRequestById(id: string): Promise<RequestRow | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: r, error } = await supabase
        .from('requests')
        .select(`
          *,
          user:users!requests_user_id_fkey(name, contact_info),
          collector:users!requests_collector_id_fkey(name, contact_info),
          ratings(rater_role, rating, comment)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!r) return null;

      const ratings = (r as any).ratings || [];
      const collectorRating = ratings.find((rt: any) => rt.rater_role === 'collector');
      const userRating = ratings.find((rt: any) => rt.rater_role === 'user');

      return {
        id: r.id,
        user_id: r.user_id,
        waste_category: r.waste_category,
        pickup_location: r.pickup_location,
        pickup_date: r.pickup_date,
        photo_url: r.photo_url,
        photo_exif_present: Boolean(r.photo_exif_present),
        photo_gps_match: r.photo_gps_match === null ? null : Boolean(r.photo_gps_match),
        status: r.status,
        rejection_reason: r.rejection_reason,
        collector_id: r.collector_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
        user_name: (r as any).user?.name || 'Unknown Citizen',
        user_contact: (r as any).user?.contact_info || '',
        collector_name: (r as any).collector?.name || null,
        collector_contact: (r as any).collector?.contact_info || null,
        collector_rating: collectorRating?.rating || null,
        collector_comment: collectorRating?.comment || null,
        user_rating: userRating?.rating || null,
        user_comment: userRating?.comment || null,
      };
    }

    // SQLite
    const r = await sqliteGet(`
      SELECT 
        r.*,
        u.name as user_name,
        u.contact_info as user_contact,
        c.name as collector_name,
        c.contact_info as collector_contact,
        (SELECT rating FROM ratings WHERE request_id = r.id AND rater_role = 'collector') as collector_rating,
        (SELECT comment FROM ratings WHERE request_id = r.id AND rater_role = 'collector') as collector_comment,
        (SELECT rating FROM ratings WHERE request_id = r.id AND rater_role = 'user') as user_rating,
        (SELECT comment FROM ratings WHERE request_id = r.id AND rater_role = 'user') as user_comment
      FROM requests r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN users c ON r.collector_id = c.id
      WHERE r.id = ?
    `, [id]);

    if (!r) return null;
    return {
      ...r,
      photo_exif_present: Boolean(r.photo_exif_present),
      photo_gps_match: r.photo_gps_match === null ? null : Boolean(r.photo_gps_match),
    };
  },

  async getUserRequests(userId: string): Promise<RequestRow[]> {
    const all = await this.getRequestsOverview();
    return all.filter(r => r.user_id === userId);
  },

  async getOpenRequestCount(userId: string): Promise<number> {
    if (isSupabaseConfigured && supabase) {
      const { count, error } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('status', 'in', '("Completed","Rejected")');

      if (error) throw error;
      return count || 0;
    }

    // SQLite
    const row = await sqliteGet<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM requests 
      WHERE user_id = ? AND status NOT IN ('Completed', 'Rejected')
    `, [userId]);

    return row?.count || 0;
  },

  async createRequest(req: {
    id: string;
    user_id: string;
    waste_category: string;
    pickup_location: string;
    pickup_date: string;
    photo_url: string;
    photo_exif_present: boolean;
    photo_gps_match: boolean | null;
    status: string;
    created_at: string;
    updated_at: string;
  }): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('requests').insert({
        id: req.id,
        user_id: req.user_id,
        waste_category: req.waste_category,
        pickup_location: req.pickup_location,
        pickup_date: req.pickup_date,
        photo_url: req.photo_url,
        photo_exif_present: req.photo_exif_present,
        photo_gps_match: req.photo_gps_match,
        status: req.status,
        rejection_reason: null,
        collector_id: null,
        created_at: req.created_at,
        updated_at: req.updated_at
      });

      if (error) throw error;
      return;
    }

    // SQLite
    await sqliteRun(`
      INSERT INTO requests 
      (id, user_id, waste_category, pickup_location, pickup_date, photo_url, photo_exif_present, photo_gps_match, status, rejection_reason, collector_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)
    `, [
      req.id,
      req.user_id,
      req.waste_category,
      req.pickup_location,
      req.pickup_date,
      req.photo_url,
      req.photo_exif_present ? 1 : 0,
      req.photo_gps_match === null ? null : (req.photo_gps_match ? 1 : 0),
      req.status,
      req.created_at,
      req.updated_at
    ]);
  },

  async updateRequest(
    id: string,
    updates: {
      status?: string;
      rejection_reason?: string | null;
      collector_id?: string | null;
      updated_at: string;
    }
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return;
    }

    // SQLite
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.rejection_reason !== undefined) {
      fields.push('rejection_reason = ?');
      values.push(updates.rejection_reason);
    }
    if (updates.collector_id !== undefined) {
      fields.push('collector_id = ?');
      values.push(updates.collector_id);
    }
    fields.push('updated_at = ?');
    values.push(updates.updated_at);

    values.push(id);

    await sqliteRun(`
      UPDATE requests 
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);
  },

  // --------------------------------------------------------------------------
  // RATINGS
  // --------------------------------------------------------------------------
  async getRatingsForRequest(requestId: string): Promise<RatingRow[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          rater:users!ratings_rater_id_fkey(name),
          target:users!ratings_target_id_fkey(name)
        `)
        .eq('request_id', requestId);

      if (error) throw error;

      return (data || []).map((r: any) => ({
        id: r.id,
        request_id: r.request_id,
        rater_id: r.rater_id,
        rater_role: r.rater_role,
        target_id: r.target_id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        rater_name: r.rater?.name || 'User',
        target_name: r.target?.name || 'User',
      }));
    }

    // SQLite
    const ratings = await sqliteQuery(`
      SELECT r.*, u.name as rater_name, t.name as target_name
      FROM ratings r
      JOIN users u ON r.rater_id = u.id
      JOIN users t ON r.target_id = t.id
      WHERE r.request_id = ?
    `, [requestId]);

    return ratings;
  },

  async saveRating(rating: {
    id: string;
    request_id: string;
    rater_id: string;
    rater_role: 'user' | 'collector';
    target_id: string;
    rating: number;
    comment?: string | null;
    created_at: string;
  }): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('ratings')
        .upsert(
          {
            id: rating.id,
            request_id: rating.request_id,
            rater_id: rating.rater_id,
            rater_role: rating.rater_role,
            target_id: rating.target_id,
            rating: rating.rating,
            comment: rating.comment || null,
            created_at: rating.created_at
          },
          { onConflict: 'request_id,rater_id' }
        );

      if (error) throw error;
      return;
    }

    // SQLite
    const existing = await sqliteGet(
      'SELECT id FROM ratings WHERE request_id = ? AND rater_id = ?',
      [rating.request_id, rating.rater_id]
    );

    if (existing) {
      await sqliteRun(`
        UPDATE ratings 
        SET rating = ?, comment = ?, created_at = ?
        WHERE id = ?
      `, [rating.rating, rating.comment || null, rating.created_at, existing.id]);
    } else {
      await sqliteRun(`
        INSERT INTO ratings (id, request_id, rater_id, rater_role, target_id, rating, comment, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        rating.id,
        rating.request_id,
        rating.rater_id,
        rating.rater_role,
        rating.target_id,
        rating.rating,
        rating.comment || null,
        rating.created_at
      ]);
    }
  },

  // --------------------------------------------------------------------------
  // BADGES
  // --------------------------------------------------------------------------
  async getBadges(): Promise<BadgeRow[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('min_points', { ascending: true });

      if (error) throw error;
      return data || [];
    }

    return sqliteQuery('SELECT * FROM badges ORDER BY min_points ASC');
  },

  // --------------------------------------------------------------------------
  // STATS OVERVIEW
  // --------------------------------------------------------------------------
  async getStatsOverview(): Promise<any> {
    if (isSupabaseConfigured && supabase) {
      const [
        { data: requests },
        { data: users }
      ] = await Promise.all([
        supabase.from('requests').select('*'),
        supabase.from('users').select('*')
      ]);

      const reqList = requests || [];
      const userList = users || [];

      const totalRequests = reqList.length;
      const totalUsers = userList.filter(u => u.role === 'user').length;
      const totalCollectors = userList.filter(u => u.role === 'collector').length;

      // Status counts
      const statusMap: Record<string, number> = {};
      const catMap: Record<string, number> = {};
      let rejectedTotal = 0;

      reqList.forEach(r => {
        statusMap[r.status] = (statusMap[r.status] || 0) + 1;
        catMap[r.waste_category] = (catMap[r.waste_category] || 0) + 1;
        if (r.status === 'Rejected') rejectedTotal++;
      });

      const statusCounts = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
      const categoryCounts = Object.entries(catMap)
        .map(([waste_category, count]) => ({ waste_category, count }))
        .sort((a, b) => b.count - a.count);

      const overallRejectionRate = totalRequests > 0
        ? Number(((rejectedTotal / totalRequests) * 100).toFixed(1))
        : 0;

      // Flagged users (> 2 rejections)
      const userReqMap: Record<string, { total: number; rejected: number }> = {};
      reqList.forEach(r => {
        if (!userReqMap[r.user_id]) userReqMap[r.user_id] = { total: 0, rejected: 0 };
        userReqMap[r.user_id].total++;
        if (r.status === 'Rejected') userReqMap[r.user_id].rejected++;
      });

      const flaggedUsers = userList
        .filter(u => (userReqMap[u.id]?.rejected || 0) > 2)
        .map(u => {
          const stats = userReqMap[u.id] || { total: 0, rejected: 0 };
          return {
            id: u.id,
            name: u.name,
            contact_info: u.contact_info,
            verified: Boolean(u.verified),
            total_requests: stats.total,
            rejected_count: stats.rejected,
            rejection_rate: stats.total > 0 ? Number(((stats.rejected / stats.total) * 100).toFixed(1)) : 0
          };
        });

      // Photo integrity
      const photoMap: Record<string, number> = {};
      reqList.forEach(r => {
        const key = `${r.photo_exif_present ? 1 : 0}_${r.photo_gps_match === null ? 'null' : (r.photo_gps_match ? 1 : 0)}`;
        photoMap[key] = (photoMap[key] || 0) + 1;
      });

      const photoIntegrity = Object.entries(photoMap).map(([key, count]) => {
        const [exif, gps] = key.split('_');
        return {
          photo_exif_present: exif === '1' ? 1 : 0,
          photo_gps_match: gps === 'null' ? null : (gps === '1' ? 1 : 0),
          count
        };
      });

      return {
        summary: {
          totalRequests,
          totalUsers,
          totalCollectors,
          overallRejectionRate
        },
        statusCounts,
        categoryCounts,
        photoIntegrity,
        flaggedUsers
      };
    }

    // SQLite
    const totalRequests = await sqliteGet<{ count: number }>('SELECT COUNT(*) as count FROM requests');
    const totalUsers = await sqliteGet<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const totalCollectors = await sqliteGet<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role = 'collector'");

    const statusCounts = await sqliteQuery<{ status: string; count: number }>(`
      SELECT status, COUNT(*) as count
      FROM requests
      GROUP BY status
    `);

    const categoryCounts = await sqliteQuery<{ waste_category: string; count: number }>(`
      SELECT waste_category, COUNT(*) as count
      FROM requests
      GROUP BY waste_category
      ORDER BY count DESC
    `);

    const rejectionStats = await sqliteGet<{ total: number; rejected: number; rate: number }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        ROUND((SUM(CASE WHEN status = 'Rejected' THEN 1.0 ELSE 0.0 END) / COUNT(*)) * 100, 1) as rate
      FROM requests
    `);

    const flaggedUsers = await sqliteQuery(`
      SELECT 
        u.id, u.name, u.contact_info, u.verified,
        COUNT(r.id) as total_requests,
        SUM(CASE WHEN r.status = 'Rejected' THEN 1 ELSE 0 END) as rejected_count,
        ROUND((SUM(CASE WHEN r.status = 'Rejected' THEN 1.0 ELSE 0.0 END) / COUNT(r.id)) * 100, 1) as rejection_rate
      FROM users u
      JOIN requests r ON u.id = r.user_id
      GROUP BY u.id
      HAVING rejected_count > 2
    `);

    const photoIntegrity = await sqliteQuery(`
      SELECT 
        photo_exif_present,
        photo_gps_match,
        COUNT(*) as count
      FROM requests
      GROUP BY photo_exif_present, photo_gps_match
    `);

    return {
      summary: {
        totalRequests: totalRequests?.count || 0,
        totalUsers: totalUsers?.count || 0,
        totalCollectors: totalCollectors?.count || 0,
        overallRejectionRate: rejectionStats?.rate || 0,
      },
      statusCounts,
      categoryCounts,
      photoIntegrity,
      flaggedUsers
    };
  }
};
