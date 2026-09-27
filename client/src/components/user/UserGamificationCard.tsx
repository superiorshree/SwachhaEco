import { useState, useEffect } from 'react';
import { Badge, User } from '../../types';
import { Award, Flame, CheckCircle, Lock, ChevronDown, Leaf, Shield, Star, Medal } from 'lucide-react';

interface UserGamificationCardProps {
  user: User;
}

export default function UserGamificationCard({ user }: UserGamificationCardProps) {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [isExpanded, setIsExpanded] = useState(false); // Default collapsed for clean scannability!

  useEffect(() => {
    fetch('/api/badges')
      .then(res => res.json())
      .then(data => setAllBadges(data))
      .catch(err => console.error('Error fetching badges:', err));
  }, []);

  const userBadgeIds = new Set(user.badges || []);

  const nextBadge = allBadges.find(b => !userBadgeIds.has(b.id));
  const pointsToNext = nextBadge ? Math.max(0, nextBadge.min_points - user.points) : 0;
  const progressPercent = nextBadge
    ? Math.min(100, Math.round((user.points / nextBadge.min_points) * 100))
    : 100;

  const renderBadgeIcon = (id: string) => {
    switch (id) {
      case 'green_starter':
        return <Leaf className="w-5 h-5 text-[#16793f]" />;
      case 'eco_warrior':
        return <Shield className="w-5 h-5 text-[#239a4e]" />;
      case 'recycling_champion':
        return <Award className="w-5 h-5 text-[#16793f]" />;
      case 'zero_waste_hero':
        return <Star className="w-5 h-5 text-[#dc2626]" />;
      default:
        return <Medal className="w-5 h-5 text-[#16793f]" />;
    }
  };

  return (
    <div className="bg-canvas border border-border-hairline rounded-lg overflow-hidden shadow-xs">
      {/* Header bar - Clickable to expand/collapse */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-canvas-parchment/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-pill bg-emerald-50 text-[#16793f] flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-[#16793f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-ink">
                Swachhata Incentive Credit Standing
              </h3>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-canvas-parchment text-ink-muted80 border border-border-soft">
                Tier {userBadgeIds.size} of {allBadges.length || 4}
              </span>
            </div>
            <p className="text-[12px] text-ink-muted48">
              Under SWM By-laws, citizens receive civic points &amp; recognition for verified source segregation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-right">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-ink-muted48 block font-medium">Next Milestone</span>
              <span className="text-[12px] font-semibold text-primary">
                {nextBadge ? `${pointsToNext} pts to ${nextBadge.name.split('(')[0].trim()}` : 'All Badges Achieved'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-primary font-medium">
            <span>{isExpanded ? 'Hide Tiers' : 'View Tiers'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded Tier Details */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5 bg-canvas-parchment/40 border-t border-border-soft">
          {/* Progress to Next Milestone */}
          {nextBadge && (
            <div className="p-4 rounded-md bg-canvas border border-border-hairline space-y-2">
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" /> Progress towards {nextBadge.name}
                </span>
                <span className="text-ink-muted48 font-medium">
                  {user.points} / {nextBadge.min_points} Points ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-canvas-parchment rounded-pill overflow-hidden border border-border-soft">
                <div
                  className="h-full bg-primary rounded-pill transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 4 Recognition Tiers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {allBadges.map((badge) => {
              const isEarned = userBadgeIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isEarned
                      ? 'bg-canvas border-primary/30 shadow-xs'
                      : 'bg-canvas/60 border-border-hairline opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-pill bg-canvas-parchment border border-border-hairline flex items-center justify-center">
                      {renderBadgeIcon(badge.id)}
                    </div>
                    {isEarned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-pill bg-[#e8f7ed] text-[#248a3d]">
                        <CheckCircle className="w-3 h-3" /> Conferred
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-pill bg-canvas-parchment text-ink-muted48 border border-border-soft">
                        <Lock className="w-3 h-3" /> In Progress
                      </span>
                    )}
                  </div>

                  <h4 className="text-[14px] font-semibold text-ink mt-2.5">
                    {badge.name}
                  </h4>
                  <p className="text-[12px] text-ink-muted48 mt-1 leading-normal">
                    {badge.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-border-soft flex items-center justify-between text-[11px] text-ink-muted80">
                    <span>Criteria:</span>
                    <strong className="text-ink">{badge.min_points} pts {badge.min_streak > 0 ? `• ${badge.min_streak}w streak` : ''}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly Streak Explainer */}
          <div className="p-3.5 rounded-md bg-canvas border border-border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px]">
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-[#16793f] shrink-0" />
              <span className="text-ink-muted80">
                <strong className="text-ink">Weekly Municipal Beat Consistency: </strong>
                Maintained by handing over segregated recyclables at least once per calendar week during the morning collection round.
              </span>
            </div>
            <span className="text-[12px] px-3 py-1 rounded-pill bg-emerald-50 text-[#16793f] font-semibold border border-emerald-200 whitespace-nowrap">
              Active Streak: {user.streak_count} Weeks
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
