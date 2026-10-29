import React from 'react';
import {
  PlusCircle,
  Video,
  FolderKanban,
  History,
  Star,
  Sparkles,
  Settings,
  CreditCard,
  Layers,
  ChevronRight,
  X,
  Crown,
  Infinity as InfinityIcon,
  LogIn,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onNewProject: () => void;
  projectsCount: number;
  favoritesCount: number;
  user: UserProfile;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onNewProject,
  projectsCount,
  favoritesCount,
  user,
  isOpenMobile = false,
  onCloseMobile,
  onOpenAuth,
}) => {
  const navItems = [
    {
      id: 'editor',
      label: 'Create Video',
      icon: Video,
      badge: null,
    },
    {
      id: 'projects',
      label: 'My Projects',
      icon: FolderKanban,
      badge: projectsCount > 0 ? projectsCount : null,
    },
    {
      id: 'history',
      label: 'Generation History',
      icon: History,
      badge: null,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Star,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'templates',
      label: 'Templates & Presets',
      icon: Sparkles,
      badge: 'Hot',
    },
    {
      id: 'pricing',
      label: 'Plans & Usage',
      icon: CreditCard,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    onCloseMobile?.();
  };

  const handleNewProjectClick = () => {
    onNewProject();
    onCloseMobile?.();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-[#0A0A0B] select-none">
      {/* Top action: Primary Create Button */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between lg:hidden mb-2">
          <span className="text-xs font-bold uppercase text-zinc-400">Navigation</span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleNewProjectClick}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9d74f7] hover:to-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/25 transition-all active:scale-[0.98] border border-[#8B5CF6]/40 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Video Project</span>
        </button>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1B1B20] text-white border-l-2 border-[#8B5CF6] pl-3'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141417]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#8B5CF6]' : 'text-zinc-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      item.badge === 'Hot'
                        ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30'
                        : 'bg-[#292930] text-zinc-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Plan Box */}
      <div className="p-4 border-t border-[#292930] space-y-2">
        <div
          className={`p-3 rounded-xl border flex flex-col gap-2.5 ${
            user.isAdmin
              ? 'bg-gradient-to-br from-amber-500/10 via-[#141417] to-[#8B5CF6]/10 border-amber-500/30'
              : 'bg-[#141417] border-[#292930]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user.isAdmin ? (
                <Crown className="w-4 h-4 text-amber-400" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              )}
              <span
                className={`text-xs font-semibold ${
                  user.isAdmin ? 'text-amber-300 font-bold' : 'text-zinc-200'
                }`}
              >
                {user.isAdmin ? 'Studio Max (Admin)' : user.plan}
              </span>
            </div>
            {user.isAdmin ? (
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded">
                UNLIMITED
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-400">
                {Math.round((user.creditsRemaining / user.totalCredits) * 100)}% left
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#292930] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                user.isAdmin
                  ? 'bg-gradient-to-r from-amber-400 to-[#8B5CF6] w-full'
                  : 'bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]'
              }`}
              style={{
                width: user.isAdmin
                  ? '100%'
                  : `${(user.creditsRemaining / user.totalCredits) * 100}%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            {user.isAdmin ? (
              <span className="text-amber-300 font-medium">Infinite 4K Generations</span>
            ) : (
              <span>{user.creditsRemaining} credits available</span>
            )}
            <button
              onClick={() => {
                onOpenAuth?.();
                onCloseMobile?.();
              }}
              className="text-[#8B5CF6] hover:underline font-medium cursor-pointer"
            >
              {user.isAdmin ? 'Admin Mode' : 'Switch/Login'}
            </button>
          </div>
        </div>

        {/* Quick Login / Switch button */}
        <button
          onClick={() => {
            onOpenAuth?.();
            onCloseMobile?.();
          }}
          className="w-full py-2 px-3 rounded-lg bg-[#141417] hover:bg-[#1B1B20] border border-[#292930] text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>User & Admin Login Portal</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-[#292930] bg-[#0A0A0B] flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-[#0A0A0B] border-r border-[#292930] z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
