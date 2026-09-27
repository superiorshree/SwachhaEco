export type WasteCategory = 'Organic' | 'Plastic' | 'Paper' | 'E-Waste' | 'Medical' | 'Other';

export type RequestStatus = 'Submitted' | 'Assigned' | 'On the Way' | 'Completed' | 'Rejected';

export type UserRole = 'user' | 'collector' | 'admin';

export interface User {
  id: string;
  name: string;
  contact_info: string;
  role: UserRole;
  verified: boolean;
  points: number;
  streak_count: number;
  badges: string[];
  created_at: string;
  open_request_count: number;
  completed_request_count: number;
  rejected_request_count: number;
}

export interface RequestItem {
  id: string;
  user_id: string;
  waste_category: WasteCategory;
  pickup_location: string;
  pickup_date: string;
  photo_url: string;
  photo_exif_present: number | boolean;
  photo_gps_match: number | boolean | null;
  status: RequestStatus;
  rejection_reason?: string | null;
  collector_id?: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_contact?: string;
  collector_name?: string;
  collector_contact?: string;
  collector_rating?: number;
  collector_comment?: string;
  user_rating?: number;
  user_comment?: string;
}

export interface Rating {
  id: string;
  request_id: string;
  rater_id: string;
  rater_role: 'user' | 'collector';
  target_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  rater_name?: string;
  target_name?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  min_points: number;
  min_streak: number;
}
