import React from 'react';
import { Loader2, XCircle, Film, Sparkles, CheckCircle2 } from 'lucide-react';

interface GenerationProgressProps {
  progress: number; // 0 - 100
  stage: string;
  estimatedSecondsRemaining: number;
  onCancel: () => void;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  progress,
  stage,
  estimatedSecondsRemaining,
  onCancel,
}) => {
  return (
    <div className="rounded-2xl bg-[#141417] border border-[#8B5CF6]/40 p-6 space-y-5 shadow-2xl shadow-[#8B5CF6]/10 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#22D3EE]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Generating Cinematic Video
              <span className="text-xs font-normal text-zinc-400">
                via MotionAI Neural Pipeline
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{stage}</p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B1B20] hover:bg-red-500/15 border border-[#292930] hover:border-red-500/30 text-zinc-400 hover:text-red-400 text-xs transition-colors cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel Job</span>
        </button>
      </div>

      {/* Progress Bar & Numerical Percentage */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#22D3EE] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Temporal consistency check passed</span>
          </div>
          <span className="font-mono text-sm font-bold text-white">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="w-full bg-[#1B1B20] h-2.5 rounded-full overflow-hidden border border-[#292930] p-0.5">
          <div
            className="bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#22D3EE] h-full rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Stage: {stage.split('(')[0].trim()}</span>
          <span>
            {estimatedSecondsRemaining > 0
              ? `~${estimatedSecondsRemaining}s remaining`
              : 'Encoding output stream...'}
          </span>
        </div>
      </div>
    </div>
  );
};
