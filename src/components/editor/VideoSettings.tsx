import React from 'react';
import {
  Clock,
  Ratio,
  Monitor,
  Flame,
  Copy,
  Gauge,
  Film,
  Crown,
  Lock,
  Sparkles,
  Infinity as InfinityIcon,
} from 'lucide-react';
import {
  AspectRatio,
  GenerationQuality,
  Resolution,
  UserProfile,
  VideoDuration,
  VideoSettings as IVideoSettings,
} from '../../types';
import { calculateEstimatedProcessingTime } from '../../utils/motionMath';

interface VideoSettingsProps {
  settings: IVideoSettings;
  onChange: (updated: IVideoSettings) => void;
  user?: UserProfile;
  onOpenAuth?: () => void;
}

const ASPECT_RATIOS: {
  value: AspectRatio;
  label: string;
  sub: string;
  boxClass: string;
}[] = [
  { value: '16:9', label: '16:9', sub: 'Landscape / YouTube', boxClass: 'w-6 h-3.5' },
  { value: '9:16', label: '9:16', sub: 'Vertical / TikTok / Reels', boxClass: 'w-3.5 h-6' },
  { value: '1:1', label: '1:1', sub: 'Square / Social', boxClass: 'w-4 h-4' },
  { value: '4:3', label: '4:3', sub: 'Classic TV / Portrait', boxClass: 'w-5 h-4' },
];

const DURATIONS: VideoDuration[] = [4, 5, 8, 10];
const FRAME_RATES: (24 | 30 | 60)[] = [24, 30, 60];
const QUALITIES: { value: GenerationQuality; label: string; desc: string }[] = [
  { value: 'draft', label: 'Draft', desc: 'Fast turnaround, testing' },
  { value: 'standard', label: 'Standard', desc: 'Balanced detail & speed' },
  { value: 'high', label: 'High', desc: 'Max fidelity & bitrate' },
];

export const VideoSettings: React.FC<VideoSettingsProps> = ({
  settings,
  onChange,
  user,
  onOpenAuth,
}) => {
  const isAdmin = user?.isAdmin || false;

  const RESOLUTIONS: {
    value: Resolution;
    label: string;
    badge?: string;
    requiresAdmin?: boolean;
  }[] = [
    { value: '720p', label: '720p HD' },
    { value: '1080p', label: '1080p Full HD' },
    {
      value: '4k',
      label: '4K Ultra HD',
      badge: isAdmin ? 'Studio Max Free' : 'Admin / Max Only',
      requiresAdmin: true,
    },
  ];

  const estSeconds = calculateEstimatedProcessingTime(
    settings.duration,
    settings.resolution,
    settings.quality,
    settings.variationsCount
  );

  const handleResolutionClick = (resItem: (typeof RESOLUTIONS)[0]) => {
    if (resItem.requiresAdmin && !isAdmin) {
      onOpenAuth?.();
      return;
    }
    onChange({ ...settings, resolution: resItem.value });
  };

  return (
    <div className="space-y-5 rounded-2xl bg-[#141417] border border-[#292930] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-[#8B5CF6]" />
            Output Video Specifications
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure format dimensions, duration, temporal cadence, and quality
          </p>
        </div>

        {/* Estimated Processing Time */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B1B20] border border-[#292930] text-xs">
          <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span className="text-zinc-400">Est. Render:</span>
          <span className="text-white font-mono font-medium">~{estSeconds}s</span>
        </div>
      </div>

      {/* Admin Privilege Banner in Settings */}
      {isAdmin && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#1B1B20] to-[#8B5CF6]/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-semibold">
              Admin Privilege Active:
            </span>
            <span className="text-zinc-300">
              Infinite generation with Ultra 4K Quality unlocked freely
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded">
            <InfinityIcon className="w-3.5 h-3.5" />
            <span>FREE</span>
          </div>
        </div>
      )}

      {/* Aspect Ratio Selector */}
      <div>
        <label className="text-xs font-semibold text-zinc-300 block mb-2">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ASPECT_RATIOS.map((ar) => {
            const isSelected = settings.aspectRatio === ar.value;
            return (
              <button
                key={ar.value}
                onClick={() => onChange({ ...settings, aspectRatio: ar.value })}
                className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-white'
                    : 'border-[#292930] bg-[#1B1B20] text-zinc-400 hover:text-white hover:bg-[#202026]'
                }`}
              >
                <div
                  className={`border-2 rounded-sm ${ar.boxClass} ${
                    isSelected ? 'border-[#8B5CF6] bg-[#8B5CF6]/30' : 'border-zinc-500'
                  }`}
                />
                <div className="text-center">
                  <span className="text-xs font-bold block">{ar.label}</span>
                  <span className="text-[10px] text-zinc-500 line-clamp-1">{ar.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration & Resolution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Duration */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-2">
            Duration
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {DURATIONS.map((dur) => (
              <button
                key={dur}
                onClick={() => onChange({ ...settings, duration: dur })}
                className={`py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  settings.duration === dur
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/20 text-white font-bold'
                    : 'border-[#292930] bg-[#1B1B20] text-zinc-400 hover:text-white hover:bg-[#202026]'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Options: 720p, 1080p, 4K */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-300">
              Resolution
            </label>
            {!isAdmin && (
              <span className="text-[10px] text-zinc-500">
                4K reserved for Admin / Studio Max
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {RESOLUTIONS.map((res) => {
              const isSelected = settings.resolution === res.value;
              const isLocked = res.requiresAdmin && !isAdmin;

              return (
                <button
                  key={res.value}
                  onClick={() => handleResolutionClick(res)}
                  className={`py-2 px-1 rounded-lg border text-xs font-medium transition-all relative cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/20 text-white font-bold'
                      : isLocked
                      ? 'border-[#292930] bg-[#141417] text-zinc-500 hover:border-amber-500/40'
                      : 'border-[#292930] bg-[#1B1B20] text-zinc-400 hover:text-white hover:bg-[#202026]'
                  }`}
                  title={
                    isLocked
                      ? 'Click to log in as Admin to access free 4K generation'
                      : res.label
                  }
                >
                  <div className="flex items-center gap-1">
                    {res.value === '4k' && (
                      <Crown className={`w-3 h-3 ${isAdmin ? 'text-amber-400' : 'text-zinc-500'}`} />
                    )}
                    <span>{res.label}</span>
                  </div>
                  {res.badge && (
                    <span
                      className={`text-[9px] uppercase font-bold tracking-tight mt-0.5 ${
                        isAdmin ? 'text-amber-300' : 'text-zinc-500'
                      }`}
                    >
                      {res.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Frame Rate & Variations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Frame Rate */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-2">
            Frame Rate
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {FRAME_RATES.map((fps) => (
              <button
                key={fps}
                onClick={() => onChange({ ...settings, frameRate: fps })}
                className={`py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  settings.frameRate === fps
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/20 text-white font-bold'
                    : 'border-[#292930] bg-[#1B1B20] text-zinc-400 hover:text-white hover:bg-[#202026]'
                }`}
              >
                {fps} fps
              </button>
            ))}
          </div>
        </div>

        {/* Variations Count */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 block mb-2">
            Number of Variations
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => onChange({ ...settings, variationsCount: count })}
                className={`py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  settings.variationsCount === count
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/20 text-white font-bold'
                    : 'border-[#292930] bg-[#1B1B20] text-zinc-400 hover:text-white hover:bg-[#202026]'
                }`}
              >
                {count} {count === 1 ? 'Clip' : 'Clips'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quality Tier Cards */}
      <div>
        <label className="text-xs font-semibold text-zinc-300 block mb-2">
          Synthesis Quality Profile
        </label>
        <div className="grid grid-cols-3 gap-2">
          {QUALITIES.map((q) => {
            const isSelected = settings.quality === q.value;
            return (
              <button
                key={q.value}
                onClick={() => onChange({ ...settings, quality: q.value })}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/15'
                    : 'border-[#292930] bg-[#1B1B20] hover:border-[#8B5CF6]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-white' : 'text-zinc-300'
                    }`}
                  >
                    {q.label}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{q.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
