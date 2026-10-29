import React, { useState } from 'react';
import { Sparkles, ArrowRight, Play, Layers, Compass, Wind } from 'lucide-react';
import { TEMPLATES } from '../../data/mockTemplates';
import { TemplateItem } from '../../types';

interface TemplatesViewProps {
  onUseTemplate: (template: TemplateItem) => void;
}

const CATEGORIES = ['All', 'Landscape', 'Portrait', 'Sci-Fi', 'Nature', 'Cinematic'];

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  const [selectedCat, setSelectedCat] = useState('All');

  const filtered = TEMPLATES.filter((tpl) => {
    if (selectedCat === 'All') return true;
    return tpl.category === selectedCat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
          Cinematic Templates & Motion Presets
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Handcrafted prompt recipes and camera choreographies calibrated for cinematic realism
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer shrink-0 ${
              selectedCat === cat
                ? 'bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20'
                : 'bg-[#141417] text-zinc-400 hover:text-white border border-[#292930]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tpl) => (
          <div
            key={tpl.id}
            className="group rounded-2xl bg-[#141417] border border-[#292930] hover:border-[#8B5CF6]/50 transition-all overflow-hidden flex flex-col justify-between"
          >
            {/* Visual Header */}
            <div className="relative aspect-video bg-black overflow-hidden">
              <img
                src={tpl.thumbnailUrl}
                alt={tpl.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />

              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#8B5CF6]/80 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider border border-white/10">
                {tpl.category}
              </span>

              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300">
                <span className="font-mono bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10">
                  {tpl.motionSettings.cameraPreset.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Intensity: {tpl.motionSettings.intensity}%
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-white group-hover:text-[#22D3EE] transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {tpl.description}
                </p>
                <div className="pt-2">
                  <p className="text-[11px] text-zinc-500 line-clamp-2 italic">
                    "{tpl.prompt}"
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-[#292930]">
                <button
                  onClick={() => onUseTemplate(tpl)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1B1B20] hover:bg-[#8B5CF6] text-zinc-200 hover:text-white font-medium text-xs transition-colors cursor-pointer group/btn"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
