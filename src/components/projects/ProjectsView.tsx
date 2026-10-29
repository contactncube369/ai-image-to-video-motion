import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Star,
  Download,
  Trash2,
  Film,
  Play,
  Calendar,
  Clock,
  Ratio,
  Copy,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { Project } from '../../types';

interface ProjectsViewProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onNewProject: () => void;
  onToggleFavorite: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  favoritesOnly?: boolean;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenProject,
  onNewProject,
  onToggleFavorite,
  onDeleteProject,
  onDuplicateProject,
  favoritesOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const filtered = projects.filter((p) => {
    if (favoritesOnly && !p.isFavorite) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchPrompt = p.prompt.toLowerCase().includes(q);
      if (!matchName && !matchPrompt) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <FolderKanban className="w-5 h-5 text-[#8B5CF6]" />
            {favoritesOnly ? 'Starred Projects' : 'My Project Library'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse, manage, and export your animated cinematic creations
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9d74f7] hover:to-[#8B5CF6] text-white text-xs font-semibold shadow-lg shadow-[#8B5CF6]/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Video Project</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#141417] border border-[#292930] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects by title or prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1B1B20] border border-[#292930] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-[#8B5CF6] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#1B1B20] border border-[#292930] rounded-lg px-2.5 py-1.5 text-zinc-300 focus:border-[#8B5CF6] outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Videos</option>
            <option value="draft">Drafts</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1B1B20] border border-[#292930] rounded-lg px-2.5 py-1.5 text-zinc-300 focus:border-[#8B5CF6] outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {sorted.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#141417] border border-[#292930] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1B1B20] border border-[#292930] flex items-center justify-center text-zinc-500 mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No projects found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No projects match your search keywords. Try adjusting your query.'
              : favoritesOnly
              ? 'You have not starred any projects yet. Click the star icon on any project card.'
              : 'Create your first image-to-video project to see it in your library.'}
          </p>
          {!favoritesOnly && (
            <button
              onClick={onNewProject}
              className="mt-2 px-4 py-2 rounded-lg bg-[#8B5CF6] text-white text-xs font-semibold hover:bg-[#7C3AED] transition-colors cursor-pointer"
            >
              Start Creating
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sorted.map((project) => {
            const hasVideo = project.variations.length > 0;
            const activeVar = project.variations[project.selectedVariationIndex] || project.variations[0];

            return (
              <div
                key={project.id}
                className="group rounded-2xl bg-[#141417] border border-[#292930] hover:border-[#8B5CF6]/50 transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Media Preview Box */}
                <div
                  className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                  onClick={() => onOpenProject(project)}
                >
                  <img
                    src={activeVar?.thumbnailUrl || project.imageUrl}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md ${
                        project.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {project.status === 'completed' ? 'Video Ready' : 'Draft'}
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(project.id);
                    }}
                    className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
                      project.isFavorite
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-black/40 text-zinc-400 hover:text-white border border-white/10'
                    }`}
                    title={project.isFavorite ? 'Unfavorite' : 'Favorite'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        project.isFavorite ? 'fill-amber-400' : ''
                      }`}
                    />
                  </button>

                  {/* Center Play Icon if has video */}
                  {hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-11 h-11 rounded-full bg-[#8B5CF6]/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg shadow-[#8B5CF6]/40 transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Duration & Aspect Tag */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300">
                    <span className="font-mono bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10">
                      {project.videoSettings.duration}s • {project.videoSettings.aspectRatio}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {project.motionSettings.cameraPreset.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3
                      onClick={() => onOpenProject(project)}
                      className="text-sm font-semibold text-white group-hover:text-[#22D3EE] transition-colors cursor-pointer truncate"
                    >
                      {project.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {project.prompt || 'Custom motion synthesis project'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#292930] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      {hasVideo && (
                        <a
                          href={activeVar.url}
                          download={`${project.name}.mp4`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-[#1B1B20] hover:bg-[#25252e] text-zinc-300 hover:text-white transition-colors"
                          title="Download Video"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateProject(project);
                        }}
                        className="p-1.5 rounded-lg bg-[#1B1B20] hover:bg-[#25252e] text-zinc-400 hover:text-white transition-colors"
                        title="Duplicate Project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/15 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
