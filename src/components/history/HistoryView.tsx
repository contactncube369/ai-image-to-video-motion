import React from 'react';
import { History, Play, RotateCcw, Clock, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { Project } from '../../types';

interface HistoryViewProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onRerun: (project: Project) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  projects,
  onOpenProject,
  onRerun,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <History className="w-5 h-5 text-[#8B5CF6]" />
          Generation History & Audit Log
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Historical log of image-to-video jobs, parameters, and render latencies
        </p>
      </div>

      <div className="rounded-2xl bg-[#141417] border border-[#292930] overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No generation jobs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#292930] bg-[#1B1B20]/60 text-zinc-400 font-semibold">
                  <th className="py-3 px-4">Frame</th>
                  <th className="py-3 px-4">Project / Prompt</th>
                  <th className="py-3 px-4">Camera Motion</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292930]">
                {projects.map((p) => {
                  const hasVideo = p.variations.length > 0;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#1B1B20]/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <img
                          src={p.variations[0]?.thumbnailUrl || p.imageUrl}
                          alt={p.name}
                          className="w-12 h-9 rounded object-cover border border-[#292930]"
                        />
                      </td>
                      <td className="py-3 px-4 max-w-[260px]">
                        <p className="font-semibold text-white truncate">{p.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {p.prompt || 'No custom prompt'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-zinc-300">
                          {p.motionSettings.cameraPreset.replace(/_/g, ' ')}
                        </span>
                        <span className="block text-[10px] text-zinc-500 font-mono">
                          Intensity: {p.motionSettings.intensity}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-300">
                        {p.videoSettings.duration}s • {p.videoSettings.aspectRatio}
                        <span className="block text-[10px] text-zinc-500">
                          {p.videoSettings.resolution}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        ) : p.status === 'failed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-semibold">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-semibold">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                        {new Date(p.updatedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenProject(p)}
                            className="p-1.5 rounded-lg bg-[#1B1B20] hover:bg-[#25252e] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="Open in studio"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRerun(p)}
                            className="p-1.5 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#8B5CF6] transition-colors cursor-pointer"
                            title="Re-run generation"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
