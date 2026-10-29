import React from 'react';
import { Check, Zap, Sparkles, Shield, HelpCircle } from 'lucide-react';
import { UserProfile } from '../../types';

interface PricingViewProps {
  user: UserProfile;
  onUpgradePlan?: (planName: string) => void;
}

const PLANS = [
  {
    name: 'Free Trial',
    price: '$0',
    period: 'forever',
    description: 'Perfect for exploring image-to-video capabilities.',
    credits: 10,
    features: [
      '10 generation credits / month',
      '720p HD exports',
      'All 12 camera presets',
      'Gemini Vision scene analysis',
      'Standard processing queue',
    ],
    cta: 'Current Plan',
    current: false,
  },
  {
    name: 'Creator Pro',
    price: '$29',
    period: 'per month',
    description: 'For content creators, indie filmmakers, and digital artists.',
    credits: 200,
    features: [
      '200 generation credits / month',
      '1080p Full HD exports',
      'Gemini prompt enhancement core',
      'Split-screen wipe & comparison',
      'Priority rendering queue',
      'Commercial usage license',
      'Unlimited draft revisions',
    ],
    cta: 'Active Plan',
    popular: true,
    current: true,
  },
  {
    name: 'Studio Max',
    price: '$79',
    period: 'per month',
    description: 'For production agencies and high-volume VFX studios.',
    credits: 800,
    features: [
      '800 generation credits / month',
      '1080p & 4K cinematic upscaling',
      'Batch 4-variation generations',
      'Dedicated cluster processing',
      'Custom motion curve presets',
      'API access & webhook integration',
      'Priority 24/7 creative support',
    ],
    cta: 'Upgrade to Studio Max',
    current: false,
  },
];

export const PricingView: React.FC<PricingViewProps> = ({ user, onUpgradePlan }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 uppercase tracking-wider">
          Transparent Creator Pricing
        </span>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Scale Your Cinematic Vision
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          Every plan includes our full suite of 12 camera trajectories, Gemini vision analysis, and zero-loss video downloads.
        </p>
      </div>

      {/* Credit Balance Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141417] via-[#1B1B20] to-[#141417] border border-[#8B5CF6]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#22D3EE]">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400">Current Plan & Usage</span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{user.plan}</span>
              <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Active
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              <strong className="text-white font-mono text-sm">{user.creditsRemaining}</strong> of{' '}
              <span className="font-mono">{user.totalCredits}</span> credits remaining this cycle
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Cycle Consumption</span>
            <span className="font-mono text-zinc-200">
              {Math.round(((user.totalCredits - user.creditsRemaining) / user.totalCredits) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#292930] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] h-full rounded-full"
              style={{
                width: `${((user.totalCredits - user.creditsRemaining) / user.totalCredits) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = user.plan === plan.name;
          return (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-[#141417] border-2 border-[#8B5CF6] shadow-xl shadow-[#8B5CF6]/15'
                  : 'bg-[#141417] border border-[#292930]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-zinc-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-zinc-400">/{plan.period}</span>
                </div>

                <div className="pt-4 border-t border-[#292930] space-y-2.5">
                  <span className="text-xs font-semibold text-zinc-300 block">
                    Plan Inclusions:
                  </span>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  disabled={isCurrent}
                  onClick={() => onUpgradePlan?.(plan.name)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#1B1B20] text-zinc-400 border border-[#292930] cursor-default'
                      : plan.popular
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9d74f7] text-white shadow-lg shadow-[#8B5CF6]/25'
                      : 'bg-[#1B1B20] hover:bg-[#8B5CF6] text-white border border-[#292930]'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
