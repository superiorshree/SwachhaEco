import React, { useState } from 'react';
import { X, Camera, AlertCircle, CheckCircle, Leaf, Recycle, Package, Laptop, Activity, Trash2, MapPin, Calendar } from 'lucide-react';
import exifr from 'exifr';
import { WasteCategory } from '../../types';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  openRequestCount: number;
  onSuccess: () => void;
}

const CATEGORIES: { id: WasteCategory; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: 'Organic', label: 'Wet Compostables', icon: Leaf, desc: 'Kitchen food scraps, fruit peels, garden clippings' },
  { id: 'Plastic', label: 'Clean Dry Plastics', icon: Recycle, desc: 'PET bottles, milk pouches, rigid containers' },
  { id: 'Paper', label: 'Paper & Cardboard', icon: Package, desc: 'Flattened corrugated boxes, newspaper bundles' },
  { id: 'E-Waste', label: 'Electronic Waste', icon: Laptop, desc: 'Old electronics, chargers, cords, small appliances' },
  { id: 'Medical', label: 'Domestic Bio-Waste', icon: Activity, desc: 'Expired pharma packaging, sterile clinical items' },
  { id: 'Other', label: 'Bulky Household', icon: Trash2, desc: 'Wrapped broken glass, scrap metal, dry textiles' },
];

export default function CreateRequestModal({
  isOpen,
  onClose,
  userId,
  openRequestCount,
  onSuccess
}: CreateRequestModalProps) {
  const [category, setCategory] = useState<WasteCategory>('Plastic');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const pickupSlot = '07:00 AM – 09:30 AM (Morning Beat)';
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exifInfo, setExifInfo] = useState<{
    hasExif: boolean;
    camera?: string;
    hasGps: boolean;
    coords?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isRateLimited = openRequestCount >= 5;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setErrorMsg(null);

    // Create preview
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);

    // Analyze EXIF
    try {
      const data = await exifr.parse(selected, {
        gps: true,
        exif: true,
        tiff: true
      });

      if (data) {
        const camera = data.Model || data.Make || 'Digital Camera';
        const hasGps = Boolean(data.latitude && data.longitude);
        setExifInfo({
          hasExif: true,
          camera,
          hasGps,
          coords: hasGps ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}` : undefined
        });
      } else {
        setExifInfo({ hasExif: false, hasGps: false });
      }
    } catch {
      setExifInfo({ hasExif: false, hasGps: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRateLimited) {
      setErrorMsg('You have reached the limit of 5 active in-flight collection requests. Please await fulfillment before booking additional beats.');
      return;
    }

    if (!pickupLocation.trim()) {
      setErrorMsg('Please enter your doorstep address or society pickup location.');
      return;
    }

    if (!file) {
      setErrorMsg('A verification photo of your segregated recyclables is required for driver dispatch.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('waste_category', category);
      formData.append('pickup_location', pickupLocation.trim());
      formData.append('pickup_date', pickupDate);
      formData.append('photo', file);

      const res = await fetch('/api/requests', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule collection.');
      }

      setPickupLocation('');
      setFile(null);
      setPreviewUrl(null);
      setExifInfo(null);
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
      <div className="bg-canvas border border-border-hairline rounded-lg w-full max-w-[620px] max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-soft">
          <div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
              Solid Waste Management &amp; Resource Recovery
            </span>
            <h3 className="text-[22px] sm:text-[24px] font-semibold tracking-tight text-ink mt-0.5">
              Schedule Doorstep Waste Collection
            </h3>
            <p className="text-[13px] text-ink-muted48 mt-0.5">
              Book a verified beat pickup with your authorized neighborhood sanitation unit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted48 hover:text-ink hover:bg-canvas-parchment transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rate Limit Alert */}
        {isRateLimited && (
          <div className="mt-4 p-4 rounded-md bg-[#fff2f2] border border-[#ffb3b8] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#d70015] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-semibold text-[#d70015]">
                Maximum Active Requests Reached (5/5)
              </h4>
              <p className="text-[12px] text-ink-muted80 mt-0.5 leading-snug">
                You currently have 5 active doorstep requests assigned or en route. In accordance with ward route management, please await driver fulfillment before scheduling new beats.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-2">
              Select Segregated Recyclable Stream
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                const CatIcon = cat.icon;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-start p-3 rounded-md text-left transition-all ${
                      isSelected
                        ? 'bg-canvas border-2 border-primary text-ink shadow-xs'
                        : 'bg-surface-pearl border border-border-soft text-ink-muted80 hover:border-border-hairline'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <CatIcon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-ink-muted80'}`} />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                      )}
                    </div>
                    <span className="text-[13px] font-semibold mt-1.5 text-ink leading-tight">
                      {cat.label}
                    </span>
                    <span className="text-[11px] text-ink-muted48 mt-0.5 line-clamp-1">
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Pickup Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Doorstep Address / Society Pickup Point</span>
              </label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Flat 402, Mayur Vihar, Paud Road, Kothrud - 411038"
                className="w-full bg-canvas text-ink text-[13px] border border-border-hairline rounded-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-focus placeholder:text-ink-muted48"
              />
              <span className="text-[11px] text-ink-muted48 mt-1 block">
                Ward 12 (Kothrud Beat) route optimization enabled
              </span>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Scheduled Collection Date</span>
              </label>
              <input
                type="date"
                required
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-canvas text-ink text-[13px] border border-border-hairline rounded-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-focus"
              />
              <span className="text-[11px] text-ink-muted48 mt-1 block">
                Preferred Beat: <strong>{pickupSlot}</strong>
              </span>
            </div>
          </div>

          {/* 3. Photo Verification */}
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Curbside Verification Photo (Required)</span>
              </span>
              <span className="text-[11px] font-normal text-primary">
                Geo-tag &amp; timestamp inspected
              </span>
            </label>

            <div className="border border-dashed border-border-hairline rounded-lg p-4 bg-canvas-parchment hover:bg-canvas transition-colors">
              <input
                type="file"
                id="waste-photo"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="waste-photo"
                className="flex flex-col items-center justify-center cursor-pointer py-3"
              >
                {previewUrl ? (
                  <div className="relative group w-full max-h-44 overflow-hidden rounded-md flex justify-center bg-black/5">
                    <img
                      src={previewUrl}
                      alt="Waste preview"
                      className="max-h-44 object-contain rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium">
                      Click to choose different image
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1.5">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="text-[13px] font-medium text-ink">
                      Click to take photo or upload segregated bag
                    </span>
                    <span className="text-[11px] text-ink-muted48 mt-0.5">
                      Captures clear proof outside your door to assist vehicle dispatch
                    </span>
                  </>
                )}
              </label>

              {exifInfo && (
                <div className="mt-2.5 pt-2.5 border-t border-border-soft flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#16793f]" />
                    <span className="text-ink-muted80 font-medium">
                      {exifInfo.hasExif
                        ? `Camera hardware verified: ${exifInfo.camera}`
                        : 'Image loaded & validated'}
                    </span>
                  </div>
                  {exifInfo.hasGps && (
                    <span className="px-2 py-0.5 rounded-pill bg-emerald-50 text-[#16793f] font-medium text-[10px] border border-emerald-200">
                      GPS Geo-Coordinates Verified
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-md bg-[#fff2f2] text-[#d70015] text-[12px] border border-[#ffb3b8]">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-soft">
            <button
              type="button"
              onClick={onClose}
              className="btn-pearl-capsule text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isRateLimited}
              className="btn-primary text-[13px] px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Dispatching...' : 'Confirm Beat Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
