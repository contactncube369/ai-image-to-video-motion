import React from 'react';
import {
  Film,
  Sparkles,
  Zap,
  User,
  ExternalLink,
  HelpCircle,
  Menu,
  Crown,
  Infinity as InfinityIcon,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface NavbarProps {
  user: UserProfile;
  currentView: string;
  onNavigate: (view: string) => void;
  geminiConnected: boolean;
  onToggleMobileMenu?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigate,
  geminiConnected,
  onToggleMobileMenu,
  onOpenAuth,
}) => {
  return (
    <header className="h-16 border-b border-[#292930] bg-[#0A0A0B]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Branding */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-[#141417] transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          aria-label="MotionAI Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] via-[#7C3AED] to-[#22D3EE] p-[1.5px] shadow-lg shadow-[#8B5CF6]/20">
            <div className="w-full h-full bg-[#0A0A0B] rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
              <Film className="w-4 h-4 text-[#22D3EE] group-hover:text-white transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                MotionAI
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                Studio
              </span>
            </div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-2 ml-4 pl-4 border-l border-[#292930]">
          <span className="text-xs text-zinc-400">Powered by</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Gemini 3.8 Flash
          </span>
        </div>
      </div>

      {/* Right: Credits, Plan & Auth Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Credits remaining indicator */}
        {user.isInfiniteCredits ? (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-[#8B5CF6]/15 border border-amber-500/30 text-xs text-amber-300 font-semibold"
            title="Administrator unlimited generations"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Credits:</span>
            <span className="font-mono text-base font-bold flex items-center">∞</span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('pricing')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141417] border border-[#292930] hover:border-[#8B5CF6]/40 transition-colors text-xs"
            title="View credit balance and subscription"
          >
            <Zap className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span className="text-zinc-300 font-medium">
              <strong className="text-white">{user.creditsRemaining}</strong> credits
            </span>
            <span className="text-[10px] text-zinc-400 font-normal">/ {user.totalCredits}</span>
          </button>
        )}

        {/* Plan badge */}
        <button
          onClick={() => onNavigate('pricing')}
          className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
            user.isAdmin
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/20'
              : 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/30 text-white hover:brightness-110'
          }`}
        >
          {user.isAdmin && <Crown className="w-3 h-3 text-amber-400" />}
          <span>{user.plan}</span>
        </button>

        {/* Auth / Account Switcher Button */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141417] hover:bg-[#1B1B20] border border-[#292930] hover:border-[#8B5CF6]/50 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
          title="Login or switch between Admin and User"
        >
          <LogIn className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span className="hidden sm:inline">
            {user.isAdmin ? 'Admin (VIP Protected)' : 'Login / Switch'}
          </span>
        </button>

        {/* Landing link */}
        <button
          onClick={() => onNavigate('landing')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentView === 'landing'
              ? 'text-white bg-[#1B1B20]'
              : 'text-zinc-400 hover:text-white hover:bg-[#141417]'
          }`}
        >
          Overview
        </button>

        {/* User Avatar */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 p-1 pl-1.5 rounded-full bg-[#141417] border border-[#292930] hover:border-[#8B5CF6]/50 transition-colors"
          aria-label="User settings"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className={`w-7 h-7 rounded-full object-cover border ${
              user.isAdmin ? 'border-amber-400' : 'border-[#292930]'
            }`}
          />
          <span className="hidden lg:inline text-xs font-medium text-zinc-300 pr-2">
            {user.name.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
