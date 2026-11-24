import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp } from "lucide-react";

const icons = { balance: Wallet, income: ArrowDownRight, expense: ArrowUpRight, savings: TrendingUp };

export default function StatCard({ label, value, tone, hint }) {
  const Icon = icons[tone] || Wallet;
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className={`stat-icon stat-icon-${tone}`}><Icon size={18} /></div>
      </div>
      <p className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[27px]">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </div>
  );
}