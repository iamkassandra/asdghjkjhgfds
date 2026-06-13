import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  LineChart, 
  Sparkles, 
  Info, 
  RefreshCw, 
  Send 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Purchase, CfoAuditReport } from '../../types';

export interface CfoChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}

interface CfoAnalyticsTabProps {
  purchases: Purchase[];
  totalRevenue: number;
  burnRate: number;
  mrrTarget: number;
  productsCount: number;
  isCfoAuditing: boolean;
  cfoAuditReport: CfoAuditReport | null;
  triggerAiExecutiveReview: () => void;
  triggerPriceAdjustmentAction: () => void;
  triggerCouponAction: () => void;
  cfoMessages: CfoChatMessage[];
  cfoInput: string;
  setCfoInput: (v: string) => void;
  cfoLoading: boolean;
  handleCfoCommand: (e: React.FormEvent) => void;
  cfoEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function CfoAnalyticsTab({
  purchases,
  totalRevenue,
  burnRate,
  mrrTarget,
  productsCount,
  isCfoAuditing,
  cfoAuditReport,
  triggerAiExecutiveReview,
  triggerPriceAdjustmentAction,
  triggerCouponAction,
  cfoMessages,
  cfoInput,
  setCfoInput,
  cfoLoading,
  handleCfoCommand,
  cfoEndRef
}: CfoAnalyticsTabProps) {

  // Generate dynamic chart data based on active firestore transactions
  const getChartData = () => {
    if (purchases.length === 0) {
      return [
        { date: 'June 01', sales: 0, visitors: 110 },
        { date: 'June 03', sales: 80, visitors: 340 },
        { date: 'June 06', sales: 150, visitors: 620 },
        { date: 'June 09', sales: 340, visitors: 940 },
        { date: 'June 12', sales: 520, visitors: 1240 },
      ];
    }
    const sorted = [...purchases].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let cumulative = 0;
    return sorted.map((p, idx) => {
      cumulative += p.total;
      const dateObj = new Date(p.createdAt);
      const label = isNaN(dateObj.getTime()) ? `Txn ${idx + 1}` : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: label,
        sales: cumulative,
        visitors: 120 + idx * 115
      };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Stats Ledger Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-sm border border-slate-850 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Total Sales Revenue</span>
          <div className="flex items-center gap-1 mt-1">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="font-display font-medium text-xl text-white">{totalRevenue.toFixed(2)}</span>
          </div>
          <span className="text-[8.5px] text-slate-500 font-mono mt-1 block">Stripe Authorized Transactions</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-sm border border-slate-850 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Operating Expenses (Burn)</span>
          <div className="flex items-center gap-1 mt-1">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="font-display font-medium text-xl text-white">${burnRate.toFixed(2)}</span>
          </div>
          <span className="text-[8.5px] text-slate-500 font-mono mt-1 block">API usage & Cloud Compute fees</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-sm border border-slate-850 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Operational Profit Margin</span>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <span className="font-display font-medium text-xl text-white">
              ${(totalRevenue - burnRate).toFixed(2)}
            </span>
          </div>
          <span className="text-[8.5px] text-slate-500 font-mono mt-1 block">Aetheria Net Operations Income</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-sm border border-slate-850 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">Monthly Gap to Target</span>
          <div className="flex items-center gap-1 mt-1">
            <DollarSign className="w-5 h-5 text-slate-400" />
            <span className="font-display font-medium text-xl text-white">
              ${Math.max(0, mrrTarget - totalRevenue).toFixed(2)}
            </span>
          </div>
          <span className="text-[8.5px] text-slate-500 font-mono mt-1 block">Monthly target USD: ${mrrTarget}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Recharts Chart & Strategic recommendations audit button */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Dynamic Recharts Chart */}
          <div className="bg-slate-950 p-5 rounded-sm border border-slate-850 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div>
                <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Storehouse Sales Trend Line</h4>
                <span className="text-[9px] font-mono text-slate-500">Stripe financial capture & simulated traffic</span>
              </div>
              <span className="text-[9px] font-mono bg-blue-950/40 text-blue-400 px-2 py-0.5 border border-blue-900/40 rounded-sm font-semibold uppercase">
                Real-time
              </span>
            </div>

            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={9} />
                  <YAxis stroke="#475569" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="sales" name="Store Sales (USD)" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                  <Area type="monotone" dataKey="visitors" name="Staging Visitors" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CFO AI Audit Recommendation Core */}
          <div className="bg-slate-950 rounded-sm border border-slate-850 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-3 gap-2">
              <div>
                <h4 className="font-display font-medium text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Executive Strategic AI Audits Coordinator</span>
                </h4>
                <p className="text-[9px] font-mono text-slate-500">Examine current social prospecting leads & sales flow</p>
              </div>

              <button
                onClick={triggerAiExecutiveReview}
                disabled={isCfoAuditing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border border-blue-500 rounded-sm text-xs font-semibold font-mono uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {isCfoAuditing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Structuring Audit...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Execute CFO Audit</span>
                  </>
                )}
              </button>
            </div>

            {/* Displaying AI audit recommendations */}
            {cfoAuditReport ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-850 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">AI Efficiency Index</span>
                    <div className="text-xl font-bold font-display text-blue-400 mt-1">{cfoAuditReport.score}/100</div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Executive Rating</span>
                    <div className="text-xs font-semibold text-emerald-400 mt-1 uppercase tracking-wide">{cfoAuditReport.rating}</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 border border-blue-900/30 rounded-sm text-xs text-slate-300 leading-relaxed max-h-80 overflow-y-auto font-mono text-[11px] whitespace-pre-wrap shadow-inner">
                  {cfoAuditReport.text}
                </div>

                {/* Quick actionable clicks */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block">RECOMMENDED CFO DIRECTIVE ACTION SCHEDULER</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-sm flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 block font-bold">Elasticity Optimization</span>
                        <span className="text-[11px] text-slate-300 block mt-0.5">Optimize high priced blueprint license margins (-$5.00)</span>
                      </div>
                      <button 
                        onClick={triggerPriceAdjustmentAction}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-sm cursor-pointer uppercase font-mono shrink-0 transition"
                      >
                        Execute
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-sm flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 block font-bold">Target Marketing Campaign</span>
                        <span className="text-[11px] text-slate-300 block mt-0.5">Disperse promotional token 'AETHER10' campaign</span>
                      </div>
                      <button 
                        onClick={triggerCouponAction}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-sm cursor-pointer uppercase font-mono shrink-0 transition"
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-900/20 border border-dashed border-slate-800 rounded-sm">
                <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-mono">No strategic review has been initiated for this cycle.</p>
                <p className="text-[10px] text-slate-400 mt-1">Click 'Execute CFO Audit' to let Gemini map operating recommendations.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: CFO Chat Interface */}
        <div className="xl:col-span-1">
          
          <div className="bg-slate-950 rounded-sm border border-slate-850 flex flex-col h-[520px]">
            {/* Panel head */}
            <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <div>
                  <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider">CFO General Agent</h3>
                  <p className="text-[8.5px] font-mono text-slate-400">MODEL: GEMINI-3.5 FLASH</p>
                </div>
              </div>
              <span className="text-[9px] bg-blue-950/50 text-blue-400 rounded-sm px-2 py-0.5 border border-blue-900/30 font-mono">
                Ready
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-3 overflow-y-auto fancy-scrollbar space-y-3 bg-slate-950/20 border-b border-slate-850">
              {cfoMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-sm px-3 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 border border-blue-500 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-850 text-slate-300 rounded-tl-none'
                  }`}>
                    <div className="whitespace-pre-wrap text-[11px]">{msg.text}</div>
                    <span className="block text-[8px] text-slate-500 font-mono text-right mt-1 uppercase tracking-widest">
                      {msg.role === 'user' ? 'Owner' : 'CFO Agent'}
                    </span>
                  </div>
                </div>
              ))}

              {cfoLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-850 px-3 py-2 rounded-sm rounded-tl-none flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <span className="text-[9px] text-blue-300 font-mono">Formulating strategy...</span>
                  </div>
                </div>
              )}
              <div ref={cfoEndRef} />
            </div>

            {/* Strategy Prompts suggestions */}
            <div className="px-2 py-1.5 bg-slate-950 border-t border-slate-850 overflow-x-auto whitespace-nowrap flex gap-1.5">
              <button
                onClick={() => setCfoInput("Design a pricing elasticity test for our products.")}
                className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 px-3 py-1 border border-slate-850 rounded-sm font-mono cursor-pointer"
              >
                Price elasticity
              </button>
              <button
                onClick={() => setCfoInput("Summarize my expenses and help me optimize API costs.")}
                className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 px-3 py-1 border border-slate-850 rounded-sm font-mono cursor-pointer"
              >
                Cost control
              </button>
            </div>

            {/* Chat submit */}
            <form onSubmit={handleCfoCommand} className="p-2.5 bg-slate-950 border-t border-slate-850 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Strategic commands..."
                value={cfoInput}
                onChange={(e) => setCfoInput(e.target.value)}
                disabled={cfoLoading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-sm px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={!cfoInput.trim() || cfoLoading}
                className="bg-blue-600 text-white p-2 rounded-sm hover:bg-blue-700 disabled:opacity-40 transition cursor-pointer border border-blue-500 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
