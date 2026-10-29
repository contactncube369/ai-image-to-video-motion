import React, { useEffect, useState } from 'react';
import { Settings, Shield, Cpu, RefreshCw, CheckCircle2, User, Key, Sliders, Lock } from 'lucide-react';
import { CameraPreset, UserProfile } from '../../types';
import { checkServerHealth, HealthCheckResponse } from '../../services/api';
import { ADMIN_MASKED_EMAIL } from '../../utils/cryptoAuth';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
}) => {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [defaultPreset, setDefaultPreset] = useState<CameraPreset>('slow_zoom_in');
  const [defaultAspect, setDefaultAspect] = useState('16:9');
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchHealth = async () => {
    setIsChecking(true);
    try {
      const res = await checkServerHealth();
      setHealth(res);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, email });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-[#8B5CF6]" />
          MotionAI Studio Settings
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your account profile, AI model pipelines, and default cinema preferences
        </p>
      </div>

      {/* Gemini Integration & System Architecture */}
      <div className="p-5 rounded-2xl bg-[#141417] border border-[#292930] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Google Gemini Vision & Prompting Engine
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  ACTIVE
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Server-side `@google/genai` SDK initialized with `gemini-3.8-flash`
              </p>
            </div>
          </div>

          <button
            onClick={fetchHealth}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B1B20] hover:bg-[#25252e] border border-[#292930] text-xs text-zinc-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Health Check</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-[#292930]">
          <div className="p-3 rounded-xl bg-[#1B1B20] border border-[#292930]">
            <span className="text-zinc-500 block mb-0.5">Model Architecture:</span>
            <span className="font-mono text-zinc-200 font-medium">gemini-3.8-flash</span>
          </div>

          <div className="p-3 rounded-xl bg-[#1B1B20] border border-[#292930]">
            <span className="text-zinc-500 block mb-0.5">API Key Status:</span>
            <span className="font-mono text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Server Injected
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1B1B20] border border-[#292930]">
            <span className="text-zinc-500 block mb-0.5">Server Gateway:</span>
            <span className="font-mono text-zinc-200 font-medium">/api/gemini/* Proxy</span>
          </div>
        </div>
      </div>

      {/* User Profile Form */}
      <div className="p-5 rounded-2xl bg-[#141417] border border-[#292930] space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-[#8B5CF6]" />
          User Profile & Credentials
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#8B5CF6]/40"
            />
            <div>
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-zinc-400 font-mono">
                {user.isAdmin ? ADMIN_MASKED_EMAIL : user.email}
              </p>
              <span className="text-[10px] font-semibold text-[#22D3EE] uppercase tracking-wider">
                {user.plan} Account
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-medium">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1B1B20] border border-[#292930] rounded-lg p-2.5 text-white outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-400 font-medium">
                Email Address {user.isAdmin && '(Protected)'}
              </label>
              <input
                type="text"
                value={user.isAdmin ? ADMIN_MASKED_EMAIL : email}
                disabled={user.isAdmin}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-[#1B1B20] border border-[#292930] rounded-lg p-2.5 outline-none font-mono ${
                  user.isAdmin ? 'text-amber-300 tracking-wider cursor-not-allowed' : 'text-white focus:border-[#8B5CF6]'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Editor Preferences */}
      <div className="p-5 rounded-2xl bg-[#141417] border border-[#292930] space-y-4 text-xs">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#22D3EE]" />
          Default Studio Studio Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium">Default Camera Preset</label>
            <select
              value={defaultPreset}
              onChange={(e) => setDefaultPreset(e.target.value as any)}
              className="w-full bg-[#1B1B20] border border-[#292930] rounded-lg p-2.5 text-white outline-none focus:border-[#8B5CF6]"
            >
              <option value="slow_zoom_in">Slow Zoom In</option>
              <option value="dolly_in">Dolly In</option>
              <option value="cinematic_tracking">Cinematic Tracking</option>
              <option value="handheld_cinematic">Handheld Cinematic</option>
              <option value="orbit">Orbit</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium">Default Aspect Ratio</label>
            <select
              value={defaultAspect}
              onChange={(e) => setDefaultAspect(e.target.value)}
              className="w-full bg-[#1B1B20] border border-[#292930] rounded-lg p-2.5 text-white outline-none focus:border-[#8B5CF6]"
            >
              <option value="16:9">16:9 (Landscape Cinema)</option>
              <option value="9:16">9:16 (Vertical Reels/TikTok)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="4:3">4:3 (Classic Academy)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoEnhance}
              onChange={(e) => setAutoEnhance(e.target.checked)}
              className="accent-[#8B5CF6] w-4 h-4 rounded"
            />
            <span className="text-zinc-300">
              Automatically trigger Gemini scene analysis when uploading new images
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
