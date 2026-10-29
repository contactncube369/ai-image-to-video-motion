import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Film,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Move,
  Video,
} from 'lucide-react';
import { TEMPLATES } from '../../data/mockTemplates';

interface LandingViewProps {
  onStartCreating: () => void;
  onExploreTemplates: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartCreating,
  onExploreTemplates,
}) => {
  const [splitPos, setSplitPos] = useState(50);
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);

  const demoItems = [
    {
      title: 'Alpine Sunrise Mist',
      stillUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      motion: 'Slow Zoom In + Volumetric Clouds',
      category: 'Landscape',
    },
    {
      title: 'Golden Hour Studio',
      stillUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
      motion: 'Handheld Filmic Breathing + Hair Flutter',
      category: 'Portrait',
    },
    {
      title: 'Cyberpunk Metropolis',
      stillUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      motion: 'Cinematic Tracking + Puddle Reflections',
      category: 'Sci-Fi',
    },
  ];

  const currentDemo = demoItems[activeDemoIndex];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-6 lg:pt-12 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-semibold text-[#8B5CF6]">
          <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Next-Generation Image-to-Video Synthesis</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Bring Your Images to Life.{' '}
          <span className="bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#22D3EE] bg-clip-text text-transparent block mt-1">
            Turn a single frame into a cinematic moment.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          MotionAI transforms static photos into fluid, temporal-consistent video clips with customizable camera trajectories, natural-language direction, and Gemini AI scene understanding.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartCreating}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9d74f7] hover:to-[#8B5CF6] text-white font-bold text-sm shadow-xl shadow-[#8B5CF6]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-[#8B5CF6]/40"
          >
            <Video className="w-4 h-4" />
            <span>Create Your First Video</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onExploreTemplates}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#141417] hover:bg-[#1B1B20] text-zinc-200 font-semibold text-sm border border-[#292930] hover:border-[#8B5CF6]/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span>Explore Motion Presets</span>
          </button>
        </div>
      </section>

      {/* Interactive Demonstration: Before vs After Split Wipe */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-[#8B5CF6]" />
              Interactive Transformation Demonstration
            </h3>
            <p className="text-xs text-zinc-400">
              Drag the wipe divider to compare the original still frame with the cinematic camera push
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#141417] p-1 rounded-xl border border-[#292930] text-xs">
            {demoItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDemoIndex(idx)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeDemoIndex === idx
                    ? 'bg-[#8B5CF6] text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.category}
              </button>
            ))}
          </div>
        </div>

        {/* Wipe Canvas */}
        <div
          className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#292930] cursor-col-resize select-none shadow-2xl"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setSplitPos(Math.max(5, Math.min(95, (x / rect.width) * 100)));
          }}
        >
          {/* Background: Animated motion projection representation */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <img
              src={currentDemo.stillUrl}
              alt={currentDemo.title}
              className="w-full h-full object-cover scale-110 animate-pulse duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-md bg-[#8B5CF6]/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
              Cinematic Motion: {currentDemo.motion}
            </div>
          </div>

          {/* Foreground: Original Still clipped to splitPos */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${splitPos}%` }}
          >
            <img
              src={currentDemo.stillUrl}
              alt="Still"
              className="w-full h-full object-cover"
              style={{ width: '100%', maxWidth: 'none' }}
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md text-zinc-300 text-xs font-semibold border border-white/10">
              Original Still Photo
            </div>
          </div>

          {/* Divider line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#22D3EE] pointer-events-none flex items-center justify-center shadow-lg"
            style={{ left: `${splitPos}%` }}
          >
            <div className="w-7 h-7 rounded-full bg-[#141417] border border-[#22D3EE] text-[#22D3EE] flex items-center justify-center text-xs font-mono shadow-md">
              ⇄
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="p-6 rounded-2xl bg-[#141417] border border-[#292930] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6]">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">12 Kinematic Trajectories</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Choose from authentic film director movements: Pan, Tilt, Dolly In, Dolly Out, 360° Orbit, and organic Handheld camera breathing.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#141417] border border-[#292930] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Gemini 3.8 Flash Vision</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Deep scene analysis identifies primary subjects, foreground layers, directional lighting, and recommends optimal motion intensities.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#141417] border border-[#292930] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE]">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Temporal Consistency</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Preserve human faces, facial features, and original geometric composition without identity drift or sudden unnatural speed warping.
          </p>
        </div>
      </section>

      {/* Featured Templates Showcase */}
      <section className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Curated Cinematic Styles</h3>
            <p className="text-xs text-zinc-400">
              Jumpstart your animation with proven motion and lighting choreography
            </p>
          </div>
          <button
            onClick={onExploreTemplates}
            className="text-xs text-[#8B5CF6] hover:underline font-semibold"
          >
            View All Presets →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.slice(0, 3).map((tpl) => (
            <div
              key={tpl.id}
              onClick={onStartCreating}
              className="group rounded-2xl bg-[#141417] border border-[#292930] hover:border-[#8B5CF6]/50 transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-video relative overflow-hidden bg-black">
                <img
                  src={tpl.thumbnailUrl}
                  alt={tpl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold uppercase text-zinc-300">
                  {tpl.category}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="text-sm font-semibold text-white group-hover:text-[#22D3EE] transition-colors">
                  {tpl.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2">{tpl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
