import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  Check,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import { CameraPreset } from '../../types';
import { enhancePromptWithGemini } from '../../services/api';
import { getDefaultNegativePrompt } from '../../utils/motionMath';

interface PromptEditorProps {
  prompt: string;
  negativePrompt: string;
  onPromptChange: (val: string) => void;
  onNegativePromptChange: (val: string) => void;
  cameraPreset: CameraPreset;
  intensity: number;
  aspectRatio: string;
}

const PROMPT_SUGGESTIONS = [
  'Slowly push the camera forward, move the clouds gently across the sky, and add subtle atmospheric fog.',
  'Gentle breeze blowing through hair and fabric with soft organic breathing and warm sunset glint.',
  'Cinematic horizontal tracking pass with water reflections, rain ripples, and neon light flares.',
  'Smooth continuous drone flyover across waves, generating realistic sea spray and wave cresting.',
  'Cinematic 360-degree orbit with rich parallax depth between foreground subject and background.',
];

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  negativePrompt,
  onPromptChange,
  onNegativePromptChange,
  cameraPreset,
  intensity,
  aspectRatio,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showNegative, setShowNegative] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleEnhanceWithGemini = async () => {
    if (isEnhancing) return;
    setIsEnhancing(true);

    try {
      const res = await enhancePromptWithGemini(
        prompt || 'Bring this image to life with smooth cinematic motion',
        cameraPreset,
        intensity,
        aspectRatio
      );

      if (res.enhancedPrompt) {
        onPromptChange(res.enhancedPrompt);
      }
      if (res.negativePrompt && !negativePrompt) {
        onNegativePromptChange(res.negativePrompt);
        setShowNegative(true);
      }
    } catch (err) {
      console.error('Enhance prompt failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSavePreset = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('motionai_saved_prompts') || '[]');
      if (prompt.trim() && !saved.includes(prompt.trim())) {
        saved.unshift(prompt.trim());
        localStorage.setItem('motionai_saved_prompts', JSON.stringify(saved.slice(0, 10)));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleApplySuggestion = (text: string) => {
    onPromptChange(text);
  };

  return (
    <div className="space-y-4 rounded-2xl bg-[#141417] border border-[#292930] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#8B5CF6]" />
            Natural-Language Motion Prompt
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Describe how you want the scene, objects, and camera to move
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Enhance button powered by Gemini */}
          <button
            onClick={handleEnhanceWithGemini}
            disabled={isEnhancing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9d74f7] hover:to-[#8B5CF6] text-white text-xs font-semibold shadow-md shadow-[#8B5CF6]/20 transition-all cursor-pointer disabled:opacity-50"
            title="Enhance prompt with cinematic details and lighting physics using Gemini"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'Enhancing with Gemini...' : 'Enhance with Gemini'}</span>
          </button>

          {/* Clear prompt */}
          {prompt && (
            <button
              onClick={() => onPromptChange('')}
              className="p-1.5 rounded-lg bg-[#1B1B20] hover:bg-[#23232a] border border-[#292930] text-zinc-400 hover:text-white transition-colors"
              title="Clear prompt"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Save preset */}
          {prompt && (
            <button
              onClick={handleSavePreset}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#1B1B20] hover:bg-[#23232a] border border-[#292930] text-zinc-300 hover:text-white text-xs transition-colors"
              title="Save to preset library"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Save</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Prompt Textarea */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe how you want your image to move..."
          rows={3}
          className="w-full rounded-xl bg-[#1B1B20] border border-[#292930] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] p-3 text-sm text-white placeholder-zinc-500 resize-none outline-none transition-colors"
        />

        <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500">
          <span>Be descriptive about camera speed, lighting shifts, and subject motion</span>
          <span className="font-mono">{prompt.length} / 1000</span>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5 uppercase tracking-wider">
          Quick Cinematic Prompts:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PROMPT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleApplySuggestion(sug)}
              className="px-2.5 py-1 rounded-lg bg-[#1B1B20] hover:bg-[#25252e] border border-[#292930] hover:border-[#8B5CF6]/40 text-[11px] text-zinc-300 hover:text-white text-left transition-colors cursor-pointer"
            >
              "{sug.length > 55 ? sug.slice(0, 52) + '...' : sug}"
            </button>
          ))}
        </div>
      </div>

      {/* Negative Prompt Disclosure */}
      <div className="pt-2 border-t border-[#292930]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowNegative(!showNegative)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <span>Negative Prompt (Artifact Suppression)</span>
            <span className="text-[10px] text-zinc-500">
              {showNegative ? '(Hide)' : '(Show)'}
            </span>
          </button>

          {!negativePrompt && showNegative && (
            <button
              onClick={() => onNegativePromptChange(getDefaultNegativePrompt())}
              className="text-[11px] text-[#8B5CF6] hover:underline"
            >
              Insert Recommended Negative Filters
            </button>
          )}
        </div>

        {showNegative && (
          <div className="mt-2.5 space-y-1">
            <textarea
              value={negativePrompt}
              onChange={(e) => onNegativePromptChange(e.target.value)}
              placeholder="List artifacts, distortions, or defects to prevent..."
              rows={2}
              className="w-full rounded-xl bg-[#1B1B20] border border-[#292930] focus:border-red-500/50 p-2.5 text-xs text-zinc-300 placeholder-zinc-600 resize-none outline-none font-mono"
            />
            <p className="text-[10px] text-zinc-500">
              Excludes warping, morphing features, flickering lights, and unnatural motion jumps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
