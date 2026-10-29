import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Crown,
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  X,
  Infinity as InfinityIcon,
  Zap,
  Eye,
  EyeOff,
  Fingerprint,
} from 'lucide-react';
import { UserProfile } from '../../types';
import {
  verifyAdminPasskey,
  ADMIN_MASKED_EMAIL,
  maskAdminEmail,
  saveEncryptedPasskey,
  getSavedEncryptedPasskey,
  clearSavedEncryptedPasskey,
  ADMIN_PASSKEY_SHA256,
} from '../../utils/cryptoAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('admin');

  // Normal user inputs
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // Admin inputs
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEncrypted, setRememberEncrypted] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasSavedEncryptedKey, setHasSavedEncryptedKey] = useState(false);

  useEffect(() => {
    const saved = getSavedEncryptedPasskey();
    setHasSavedEncryptedKey(saved === ADMIN_PASSKEY_SHA256);
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Admin Login with SHA-256 verification
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsVerifying(true);

    try {
      const isValid = await verifyAdminPasskey(adminPassword);

      if (!isValid) {
        setAdminError(
          'Access Denied: Invalid Admin Master Passkey. Access is strictly granted only upon entering the exact authorized master passkey.'
        );
        setIsVerifying(false);
        return;
      }

      // If user chose to remember with SHA-256 encryption
      if (rememberEncrypted) {
        saveEncryptedPasskey(ADMIN_PASSKEY_SHA256);
        setHasSavedEncryptedKey(true);
      } else {
        clearSavedEncryptedPasskey();
        setHasSavedEncryptedKey(false);
      }

      // Grant Admin Privileges with email masked as **************
      const adminUser: UserProfile = {
        id: 'usr-admin-master',
        name: 'Administrator',
        email: ADMIN_MASKED_EMAIL,
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        role: 'admin',
        isAdmin: true,
        isInfiniteCredits: true,
        hasUltra4k: true,
        plan: 'Studio Max',
        creditsRemaining: 999999,
        totalCredits: 999999,
      };

      onLogin(adminUser);
      onClose();
    } catch (err) {
      setAdminError('An error occurred during cryptographic passkey verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Easy Login via saved SHA-256 encrypted passkey
  const handleEasyEncryptedLogin = () => {
    const saved = getSavedEncryptedPasskey();
    if (saved === ADMIN_PASSKEY_SHA256) {
      const adminUser: UserProfile = {
        id: 'usr-admin-master',
        name: 'Administrator',
        email: ADMIN_MASKED_EMAIL,
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        role: 'admin',
        isAdmin: true,
        isInfiniteCredits: true,
        hasUltra4k: true,
        plan: 'Studio Max',
        creditsRemaining: 999999,
        totalCredits: 999999,
      };
      onLogin(adminUser);
      onClose();
    } else {
      setAdminError('Saved encrypted credential expired. Please enter passkey manually.');
      clearSavedEncryptedPasskey();
      setHasSavedEncryptedKey(false);
    }
  };

  // Handle Normal User Login submission
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const email = userEmail.trim() || 'creator@motionai.studio';
    const name = userName.trim() || email.split('@')[0];

    const normalUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'user',
      isAdmin: false,
      isInfiniteCredits: false,
      hasUltra4k: false,
      plan: 'Creator Pro',
      creditsRemaining: 48,
      totalCredits: 200,
    };

    onLogin(normalUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#141417] border border-[#292930] shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-5 border-b border-[#292930] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] p-[1.5px]">
              <div className="w-full h-full bg-[#0A0A0B] rounded-[9px] flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#22D3EE]" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">MotionAI Security Portal</h3>
              <p className="text-[11px] text-zinc-400">
                User Authentication & Encrypted Admin Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1B1B20] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: User Login vs Admin Login */}
        <div className="grid grid-cols-2 p-1.5 bg-[#0e0e11] border-b border-[#292930]">
          <button
            onClick={() => {
              setActiveTab('user');
              setAdminError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'user'
                ? 'bg-[#1B1B20] text-white shadow-sm border border-[#292930]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>User Login</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              setAdminError(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-amber-500/20 to-[#8B5CF6]/20 text-white shadow-sm border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Login</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
              SHA-256
            </span>
          </button>
        </div>

        {/* TAB 1: User Login */}
        {activeTab === 'user' && (
          <div className="p-6 space-y-4">
            <div className="p-3 rounded-xl bg-[#1B1B20] border border-[#292930] text-xs text-zinc-300 space-y-1">
              <span className="font-semibold text-white block">Standard Creator Portal</span>
              <p className="text-[11px] text-zinc-400">
                Standard features, standard credit quotas, and 720p/1080p generation.
              </p>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#1B1B20] border border-[#292930] rounded-lg p-2.5 text-white outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-[#1B1B20] border border-[#292930] rounded-lg pl-9 pr-3 py-2.5 text-white outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full bg-[#1B1B20] border border-[#292930] rounded-lg pl-9 pr-3 py-2.5 text-white outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold transition-colors cursor-pointer mt-2"
              >
                Sign In as Normal User
              </button>
            </form>

            <div className="pt-2 border-t border-[#292930] text-center">
              <button
                onClick={() => {
                  onLogin({
                    id: 'usr-alex',
                    name: 'Alex Rivera',
                    email: 'alex.rivera@cinema.ai',
                    avatarUrl:
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                    role: 'user',
                    isAdmin: false,
                    isInfiniteCredits: false,
                    hasUltra4k: false,
                    plan: 'Creator Pro',
                    creditsRemaining: 48,
                    totalCredits: 200,
                  });
                  onClose();
                }}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Quick Demo Sign In (Alex Rivera • Creator Pro)
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Admin Login with Masked Email & SHA-256 Passkey Verification */}
        {activeTab === 'admin' && (
          <div className="p-6 space-y-4">
            {/* Admin VIP Perks Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#1B1B20] to-[#8B5CF6]/10 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <Crown className="w-4 h-4" />
                  <span>Studio Max Administrator Access</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> SHA-256 Protected
                </span>
              </div>
              <ul className="text-[11px] text-zinc-300 space-y-1">
                <li className="flex items-center gap-1.5">
                  <InfinityIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span><strong>Infinite Free Generations</strong> (Studio Max unlocked)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span><strong>Ultra 4K Quality Unlocked</strong> (3840×2160 UHD rendering)</span>
                </li>
              </ul>
            </div>

            {/* Quick easy login if encrypted SHA-256 passkey is already saved */}
            {hasSavedEncryptedKey && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Fingerprint className="w-4 h-4" />
                  <span>Encrypted SHA-256 Passkey Found</span>
                </div>
                <button
                  onClick={handleEasyEncryptedLogin}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-colors cursor-pointer text-xs"
                >
                  Quick Unlock
                </button>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-3.5 text-xs">
              {/* Administrator Email Box with Masked Asterisks */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-400 font-medium">Administrator Email</label>
                  <span className="text-[10px] font-mono text-zinc-500">Identity Protected</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                  {/* Displays ************** as requested */}
                  <input
                    type="text"
                    value={ADMIN_MASKED_EMAIL}
                    readOnly
                    disabled
                    aria-label="Administrator Email (Hidden)"
                    className="w-full bg-[#1B1B20]/80 border border-[#292930] rounded-lg pl-9 pr-3 py-2.5 text-amber-300 font-mono tracking-widest outline-none cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-zinc-500" />
                  <span>Administrator email address is masked with asterisks for security.</span>
                </p>
              </div>

              {/* Master Admin Passkey Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-400 font-medium">Admin Master Passkey</label>
                  <span className="text-[10px] text-zinc-500">SHA-256 Encrypted</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Master Admin Passkey..."
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError(null);
                    }}
                    className="w-full bg-[#1B1B20] border border-[#292930] focus:border-amber-400 rounded-lg pl-9 pr-10 py-2.5 text-white outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Access is only granted when the exact master passkey is verified.
                </p>
              </div>

              {/* Remember Encrypted Passkey Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={rememberEncrypted}
                  onChange={(e) => setRememberEncrypted(e.target.checked)}
                  className="accent-amber-400 w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-zinc-300 text-[11px]">
                  Save encrypted SHA-256 passkey token for fast 1-click login
                </span>
              </label>

              {/* Error Message */}
              {adminError && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying || !adminPassword}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#8B5CF6] hover:brightness-110 text-zinc-950 font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isVerifying ? 'Verifying SHA-256 Hash...' : 'Verify Passkey & Unlock Studio Max'}
              </button>
            </form>

            {/* Hint for authorized administrator */}
            <div className="pt-2 border-t border-[#292930] text-center">
              <span className="text-[10px] text-zinc-500">
                Encrypted Master Passkey authentication active (SHA-256).
              </span>
            </div>
          </div>
        )}

        {/* Bottom Current Session Bar */}
        <div className="p-3 bg-[#0e0e11] border-t border-[#292930] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Active User:</span>
            <span className="font-semibold text-white">{currentUser.name}</span>
            {currentUser.isAdmin && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                ADMIN
              </span>
            )}
          </div>
          <span className="text-zinc-500 font-mono text-[11px]">
            {currentUser.isAdmin ? ADMIN_MASKED_EMAIL : currentUser.email}
          </span>
        </div>
      </div>
    </div>
  );
};
