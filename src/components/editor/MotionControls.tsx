import React, { useState } from 'react';
import {
  Camera,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Move,
  Minimize2,
  RotateCw,
  Navigation,
  Activity,
  Sliders,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Repeat,
  ShieldCheck,
  Crop,
  Layers,
} from 'lucide-react';
import { CameraPreset, MotionSettings } from '../../types';
import {
  CAMERA_PRESET_METADATA,
  classifyMotionIntensity,
} from '../../utils/motionMath';

interface MotionControlsProps {
  settings: MotionSettings;
  onChange: (updated: MotionSettings) => void;
}

const PRESET_ICONS: Record<CameraPreset, React.ComponentType<{ className?: string }>> = {
  static: Camera,
  slow_zoom_in: ZoomIn,
  slow_zoom_out: ZoomOut,
  pan_left: ArrowLeft,
  pan_right: ArrowRight,
  tilt_up: ArrowUp,
  tilt_down: ArrowDown,
  dolly_in: Move,
  dolly_out: Minimize2,
  orbit: RotateCw,
  cinematic_tracking: Navigation,
  handheld_cinematic: Activity,
};

export const MotionControls: React.FC<MotionControlsProps> = ({
  settings,
  onChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const intensityInfo = classifyMotionIntensity(settings.intensity);

  const handlePresetSelect = (preset: CameraPreset) => {
    onChange({ ...settings, cameraPreset: preset });
  };

  const handleIntensityChange = (val: number) => {
    onChange({ ...settings, intensity: val });
  };

  return (
    <div className="space-y-5 rounded-2xl bg-[#141417] border border-[#292930] p-5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#8B5CF6]" />
          Motion & Camera Controls
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Select optical trajectory and fine-tune physical movement intensity
        </p>
      </div>

      {/* Camera Movement Presets Grid */}
      <div>
        <label className="text-xs font-semibold text-zinc-300 block mb-2.5">
          Camera Movement Preset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {(Object.keys(CAMERA_PRESET_METADATA) as CameraPreset[]).map((presetKey) => {
            const meta = CAMERA_PRESET_METADATA[presetKey];
            const Icon = PRESET_ICONS[presetKey];
            const isSelected = settings.cameraPreset === presetKey;

            return (
              <button
                key={presetKey}
                onClick={() => handlePresetSelect(presetKey)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 shadow-md shadow-[#8B5CF6]/10'
                    : 'border-[#292930] bg-[#1B1B20] hover:border-[#8B5CF6]/40 hover:bg-[#202026]'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#8B5CF6] text-white'
                        : 'bg-[#292930] text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse"></span>
                  )}
                </div>
                <div>
                  <h4
                    className={`text-xs font-medium ${
                      isSelected ? 'text-white' : 'text-zinc-300'
                    }`}
                  >
                    {meta.label}
                  </h4>
                  <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                    {meta.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Motion Intensity Slider */}
      <div className="p-4 rounded-xl bg-[#1B1B20] border border-[#292930] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">Motion Intensity</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${intensityInfo.badgeColor}`}
            >
              {intensityInfo.label}
            </span>
          </div>
          <span className="text-sm font-mono font-bold text-white">
            {settings.intensity}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={settings.intensity}
          onChange={(e) => handleIntensityChange(Number(e.target.value))}
          className="w-full accent-[#8B5CF6] h-1.5 bg-[#292930] rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[10px] font-mono text-zinc-500">
          <span>0 (Subtle)</span>
          <span>25 (Natural)</span>
          <span>50 (Dynamic)</span>
          <span>100 (Expressive)</span>
        </div>

        <p className="text-xs text-zinc-400">{intensityInfo.description}</p>

        {/* Warning callout for high intensity */}
        {intensityInfo.warning && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs mt-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{intensityInfo.warning}</span>
          </div>
        )}
      </div>

      {/* Advanced Motion Controls Collapsible */}
      <div className="border border-[#292930] rounded-xl overflow-hidden bg-[#1B1B20]/60">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#22D3EE]" />
            <span>Advanced Kinematic & Consistency Controls</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-4 pt-1 space-y-4 border-t border-[#292930] text-xs">
            {/* Speed & Smoothness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Animation Speed</span>
                  <span className="font-mono text-zinc-200">
                    {settings.animationSpeed}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.animationSpeed}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      animationSpeed: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-[#22D3EE] h-1.5 bg-[#292930] rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Motion Smoothness</span>
                  <span className="font-mono text-zinc-200">
                    {settings.motionSmoothness}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={settings.motionSmoothness}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      motionSmoothness: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-[#22D3EE] h-1.5 bg-[#292930] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Strengths: Camera, Subject, Background */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Camera Strength</span>
                  <span className="font-mono text-zinc-300">
                    {settings.cameraMovementStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.cameraMovementStrength}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      cameraMovementStrength: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-[#8B5CF6] h-1.5 bg-[#292930] rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Subject Strength</span>
                  <span className="font-mono text-zinc-300">
                    {settings.subjectMovementStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.subjectMovementStrength}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      subjectMovementStrength: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-[#8B5CF6] h-1.5 bg-[#292930] rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Background Strength</span>
                  <span className="font-mono text-zinc-300">
                    {settings.backgroundMovementStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.backgroundMovementStrength}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      backgroundMovementStrength: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-[#8B5CF6] h-1.5 bg-[#292930] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#292930]">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#141417] border border-[#292930] cursor-pointer hover:border-[#8B5CF6]/40 transition-colors">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#22D3EE]" />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      3D Depth Parallax
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Multi-plane foreground vs backdrop
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.depthParallax}
                  onChange={(e) =>
                    onChange({ ...settings, depthParallax: e.target.checked })
                  }
                  className="accent-[#8B5CF6] w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#141417] border border-[#292930] cursor-pointer hover:border-[#8B5CF6]/40 transition-colors">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-[#22D3EE]" />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      Seamless Loop
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Returns seamlessly to origin
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.loopAnimation}
                  onChange={(e) =>
                    onChange({ ...settings, loopAnimation: e.target.checked })
                  }
                  className="accent-[#8B5CF6] w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#141417] border border-[#292930] cursor-pointer hover:border-[#8B5CF6]/40 transition-colors">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      Preserve Subject Appearance
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Locks face & anatomy features
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.preserveSubject}
                  onChange={(e) =>
                    onChange({ ...settings, preserveSubject: e.target.checked })
                  }
                  className="accent-[#8B5CF6] w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#141417] border border-[#292930] cursor-pointer hover:border-[#8B5CF6]/40 transition-colors">
                <div className="flex items-center gap-2">
                  <Crop className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      Preserve Composition
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Maintains focal framing rules
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.preserveComposition}
                  onChange={(e) =>
                    onChange({ ...settings, preserveComposition: e.target.checked })
                  }
                  className="accent-[#8B5CF6] w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
