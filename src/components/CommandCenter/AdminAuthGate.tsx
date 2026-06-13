import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminAuthGateProps {
  adminToken: string;
  setAdminToken: (val: string) => void;
  authError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onBackToStore: () => void;
}

export default function AdminAuthGate({
  adminToken,
  setAdminToken,
  authError,
  onSubmit,
  onBackToStore
}: AdminAuthGateProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4" style={{ backgroundColor: '#0c0f17' }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)]" />
      
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 w-full max-w-md relative z-10 shadow-2xl space-y-6 text-slate-800"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-slate-700" />
          </div>
          <h2 className="font-display font-bold text-lg tracking-wider text-slate-900 uppercase">Orchestrator Auth</h2>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Aetheria enterprise command console is active. Decrypt credentials to authorize.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
              Executive Operational Key
            </label>
            <input
              type="password"
              placeholder="Enter operational token..."
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              id="admin-security-pass"
            />
            <span className="block text-[9px] text-slate-400 mt-1.5 font-mono">
              Note: Token-less authorization is permitted for staging bypass.
            </span>
          </div>

          {authError && (
            <div className="flex items-center gap-1.5 text-rose-600 text-xs py-1.5 px-3 bg-rose-50 rounded-sm border border-rose-200">
              <AlertCircle className="w-4 h-4" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            id="admin-login-submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-sm transition tracking-widest uppercase cursor-pointer border border-transparent font-mono"
          >
            Decrypt Console
          </button>
        </form>

        <button
          onClick={onBackToStore}
          className="w-full text-center text-xs text-slate-500 hover:text-blue-600 underline cursor-pointer font-sans block"
        >
          Return to storefront
        </button>
      </motion.div>
    </div>
  );
}
