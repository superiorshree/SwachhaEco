import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { RequestItem } from '../../types';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RequestItem | null;
  raterRole: 'user' | 'collector';
  raterId: string;
  onSuccess: () => void;
}

export default function RatingModal({
  isOpen,
  onClose,
  request,
  raterRole,
  raterId,
  onSuccess
}: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const targetName = raterRole === 'user' ? (request.collector_name || 'Collector') : (request.user_name || 'Citizen');
  const targetId = raterRole === 'user' ? (request.collector_id || '') : request.user_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) {
      setErrorMsg('No target participant identified to rate.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: request.id,
          rater_id: raterId,
          rater_role: raterRole,
          target_id: targetId,
          rating,
          comment: comment.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit rating.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-canvas border border-border-hairline rounded-lg w-full max-w-[480px] p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted48 hover:text-ink hover:bg-canvas-parchment transition-colors absolute right-5 top-5"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-[21px] font-semibold tracking-tight text-ink">
          {raterRole === 'user' ? 'Rate Your Collector' : 'Verify & Rate Citizen'}
        </h3>
        <p className="text-[13px] text-ink-muted48 mt-1">
          {raterRole === 'user'
            ? `Share feedback on collection service by ${targetName}`
            : `Rate segregation quality for ${targetName}`}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Star selector */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        filled
                          ? 'text-[#16793f] fill-[#16793f]'
                          : 'text-border-hairline'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-[14px] font-semibold text-ink mt-2">
              {rating === 5 && 'Outstanding • Perfectly Segregated'}
              {rating === 4 && 'Great • Clean & Punctual'}
              {rating === 3 && 'Average • Acceptable'}
              {rating === 2 && 'Fair • Minor Contamination'}
              {rating === 1 && 'Poor • Disorganized'}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">
              Review Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add details about packaging, pickup speed, or sorting accuracy..."
              className="w-full bg-canvas text-ink text-[14px] border border-border-hairline rounded-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary-focus"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md bg-[#fff2f2] text-[#d70015] text-[13px] border border-[#ffb3b8]">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-soft">
            <button
              type="button"
              onClick={onClose}
              className="btn-pearl-capsule text-[14px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-[14px] px-6 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
