import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  X,
  UserRound,
} from "lucide-react";

const items = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "budget", label: "Monthly budget", icon: Wallet },
  { id: "reports", label: "Reports", icon: ChartNoAxesCombined },
  { id: "profile", label: "My Profile", icon: UserRound },
];

export default function Sidebar({
  active,
  onChange,
  open,
  onClose,
  user,
  onLogout,
}) {
  return (
    <>
      {open && (
        <button
          className="sidebar-backdrop lg:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="flex items-center justify-between px-6 pt-7 pb-9">
          <button
            type="button"
            onClick={() => {
              onChange("overview");
              onClose();
            }}
            className="flex items-center gap-3"
          >
            <div className="brand-mark">
              <Wallet size={20} strokeWidth={2.5} />
            </div>

            <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
              spendwise<span className="text-violet-600">.</span>
            </span>
          </button>
          <button
            className="icon-button lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4">
          <p className="nav-caption">WORKSPACE</p>
          <nav className="mt-3 space-y-1">
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onChange(id);
                  onClose();
                }}
                className={`nav-link ${active === id ? "nav-link-active" : ""}`}
              >
                <Icon size={18} strokeWidth={1.9} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-5">
          <div className="upgrade-card mb-5">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Wallet size={18} />
            </div>
            <p className="text-sm font-bold">Small steps add up.</p>
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              Keep an eye on your spending and make every ringgit count.
            </p>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {user?.email || ""}
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => {
                  onChange("settings");
                  onClose();
                }}
                title="Settings"
              >
                <Settings size={17} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
