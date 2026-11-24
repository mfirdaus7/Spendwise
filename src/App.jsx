import { useCallback, useEffect, useMemo, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  Plus,
  Menu,
  Search,
  Bell,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Wallet,
  TrendingUp,
  ReceiptText,
  PiggyBank,
  ChevronDown,
  ChartNoAxesCombined,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Sidebar from "./components/Sidebar.jsx";
import StatCard from "./components/StatCard.jsx";
import TransactionModal from "./components/TransactionModal.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import { api, money, monthLabel } from "./lib/api.js";

const COLORS = [
  "#7565e8",
  "#43b89b",
  "#f3a65a",
  "#ed7c92",
  "#6da6df",
  "#a78bfa",
  "#8c9aa9",
];
const currentMonth = new Date().toISOString().slice(0, 7);

export default function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("spendwise_user") || "null"),
  );
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [month, setMonth] = useState(currentMonth);
  const [dashboard, setDashboard] = useState({
    income: 0,
    expenses: 0,
    categories: [],
    trend: [],
    transaction_count: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem("spendwise_token");
    localStorage.removeItem("spendwise_user");
    setUser(null);
  }, []);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("spendwise:logout", handler);
    return () => window.removeEventListener("spendwise:logout", handler);
  }, [logout]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [summary, rows, budgetData] = await Promise.all([
        api(`/dashboard?month=${month}`),
        api(`/transactions?month=${month}`),
        api(`/budgets/${month}`),
      ]);
      setDashboard(summary);
      setTransactions(rows);
      setBudget(Number(budgetData.amount || 0));
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }, [user, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function authenticate(mode, form) {
    const data = await api(
      `/auth/${mode === "register" ? "register" : "login"}`,
      {
        method: "POST",
        body: JSON.stringify(form),
      },
    );
    localStorage.setItem("spendwise_token", data.token);
    localStorage.setItem("spendwise_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function saveTransaction(form) {
    const result = await api(
      editing ? `/transactions/${editing.id}` : "/transactions",
      {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(form),
      },
    );
    setTransactions((rows) =>
      editing
        ? rows.map((row) => (row.id === result.id ? result : row))
        : [result, ...rows],
    );
    setEditing(null);
    await loadData();
  }

  async function deleteTransaction(id) {
    if (
      !window.confirm("Delete this transaction? This action cannot be undone.")
    )
      return;
    try {
      await api(`/transactions/${id}`, { method: "DELETE" });
      setNotice("Transaction deleted.");
      await loadData();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function saveBudget(event) {
    event.preventDefault();
    const value = Number(event.target.budget.value);
    try {
      const result = await api(`/budgets/${month}`, {
        method: "PUT",
        body: JSON.stringify({ amount: value }),
      });
      setBudget(Number(result.amount));
      setNotice("Monthly budget saved.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  const balance = Number(dashboard.income) - Number(dashboard.expenses);
  const filteredTransactions = useMemo(
    () =>
      transactions.filter((item) => {
        const matchesSearch = `${item.title} ${item.category}`
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesSearch && (filter === "all" || item.type === filter);
      }),
    [transactions, search, filter],
  );

  if (!user) return <AuthScreen onAuth={authenticate} />;

  const pageTitle = {
    overview: "Overview",
    transactions: "Transactions",
    budget: "Monthly budget",
    reports: "Reports",
  }[active];

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onChange={setActive}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={logout}
      />
      <main className="main-area">
        <header className="topbar">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="icon-button lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <div>
              <p className="hidden text-xs font-semibold uppercase tracking-[.12em] text-slate-400 sm:block">
                Personal finance
              </p>
              <h1 className="font-display text-xl font-extrabold tracking-tight text-slate-900 sm:mt-0.5 sm:text-2xl">
                {pageTitle}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="month-select">
              <CalendarDays size={16} />
              <input
                aria-label="Select month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </label>
            <div className="hidden h-9 w-px bg-slate-100 sm:block" />
            <div className="avatar avatar-small">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">
          {notice && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
              <span>{notice}</span>
              <button onClick={() => setNotice("")}>Dismiss</button>
            </div>
          )}
          {active === "overview" && (
            <Overview
              dashboard={dashboard}
              balance={balance}
              transactions={transactions}
              budget={budget}
              month={month}
              onAdd={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              onViewAll={() => setActive("transactions")}
            />
          )}
          {active === "transactions" && (
            <section className="content-card">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                <div>
                  <h2 className="section-title">All transactions</h2>
                  <p className="section-subtitle">
                    A record of your money coming in and going out.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus size={17} /> Add transaction
                </button>
              </div>
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="search-box flex-1">
                  <Search size={17} />
                  <input
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="filter-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expenses</option>
                </select>
              </div>
              <TransactionTable
                rows={filteredTransactions}
                onEdit={(row) => {
                  setEditing(row);
                  setModalOpen(true);
                }}
                onDelete={deleteTransaction}
              />
            </section>
          )}
          {active === "budget" && (
            <BudgetPage
              budget={budget}
              spent={Number(dashboard.expenses)}
              month={month}
              onSave={saveBudget}
            />
          )}
          {active === "reports" && <Reports dashboard={dashboard} />}
          {loading && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Updating your figures...
            </p>
          )}
        </div>
        <footer className="page-footer">
          Made for clearer money habits <span>·</span> SpendWise
        </footer>
      </main>
      <TransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={saveTransaction}
        editing={editing}
      />
    </div>
  );
}

function Overview({
  dashboard,
  balance,
  transactions,
  budget,
  month,
  onAdd,
  onViewAll,
}) {
  const spentPercent =
    budget > 0 ? Math.min((Number(dashboard.expenses) / budget) * 100, 100) : 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Here's what's happening with your money.
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
            {monthLabel(month)}
          </h2>
        </div>
        <button
          className="primary-button self-start sm:self-auto"
          onClick={onAdd}
        >
          <Plus size={17} /> Add transaction
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total balance"
          value={money(balance)}
          tone="balance"
          hint="Income minus expenses this month"
        />
        <StatCard
          label="Total income"
          value={money(dashboard.income)}
          tone="income"
          hint="Money received this month"
        />
        <StatCard
          label="Total expenses"
          value={money(dashboard.expenses)}
          tone="expense"
          hint="Money spent this month"
        />
        <StatCard
          label="Transactions"
          value={dashboard.transaction_count || 0}
          tone="savings"
          hint="Recorded this month"
        />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
        <section className="content-card p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="section-title">Spending overview</h3>
              <p className="section-subtitle">Your daily money movement</p>
            </div>
            <span className="chart-legend">
              <i /> Expenses <i className="legend-income" /> Income
            </span>
          </div>
          <div className="h-[260px] w-full">
            {dashboard.trend?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboard.trend}
                  margin={{ top: 8, right: 5, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="expenseFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#7565e8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7565e8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#eef0f5" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9aa2b1", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9aa2b1", fontSize: 11 }}
                    tickFormatter={(value) => `RM${value}`}
                  />
                  <Tooltip
                    formatter={(value) => money(value)}
                    contentStyle={{
                      border: "1px solid #eef0f5",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#7565e8"
                    strokeWidth={2.5}
                    fill="url(#expenseFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#43b89b"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="Add transactions to see your spending trend." />
            )}
          </div>
        </section>
        <section className="content-card p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="section-title">Monthly budget</h3>
              <p className="section-subtitle">Your spending limit</p>
            </div>
            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-7">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-400">Spent so far</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-slate-900">
                  {money(dashboard.expenses)}
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {budget > 0
                  ? `${Math.round(spentPercent)}% used`
                  : "No budget set"}
              </p>
            </div>
            <div className="progress-track mt-4">
              <div
                className="progress-fill"
                style={{ width: `${spentPercent}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-400">
              <span>Spent</span>
              <span>{money(budget)} budget</span>
            </div>
          </div>
          <div className="mt-7 rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              {budget > 0
                ? "Remaining budget"
                : "Set a monthly budget to stay on track"}
            </p>
            <p className="mt-1 font-display text-xl font-extrabold text-slate-900">
              {money(Math.max(budget - Number(dashboard.expenses), 0))}
            </p>
          </div>
        </section>
      </div>
      <section className="content-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h3 className="section-title">Recent transactions</h3>
            <p className="section-subtitle">Your latest money activity</p>
          </div>
          <button
            className="text-sm font-bold text-violet-600 hover:text-violet-700"
            onClick={onViewAll}
          >
            View all
          </button>
        </div>
        <TransactionTable rows={transactions.slice(0, 5)} compact />
      </section>
    </div>
  );
}

function TransactionTable({ rows, onEdit, onDelete, compact = false }) {
  if (!rows.length)
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <ReceiptText size={22} />
        </div>
        <p className="font-bold text-slate-700">No transactions yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Your records will show up here when you add them.
        </p>
      </div>
    );
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th>CATEGORY</th>
            <th>DATE</th>
            <th className="text-right">AMOUNT</th>
            {!compact && <th className="text-right">ACTIONS</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div
                    className={`transaction-icon ${row.type === "income" ? "transaction-income" : "transaction-expense"}`}
                  >
                    {row.type === "income" ? (
                      <ArrowDownRight size={17} />
                    ) : (
                      <ArrowUpRight size={17} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{row.title}</p>
                    <p className="mt-0.5 text-xs capitalize text-slate-400">
                      {row.type}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <span className="category-pill">{row.category}</span>
              </td>
              <td className="whitespace-nowrap text-slate-500">
                {new Date(`${row.date}T00:00:00`).toLocaleDateString("en-MY", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td
                className={`whitespace-nowrap text-right font-bold ${row.type === "income" ? "text-emerald-600" : "text-slate-800"}`}
              >
                {row.type === "income" ? "+" : "−"}
                {money(row.amount)}
              </td>
              {!compact && (
                <td>
                  <div className="flex justify-end gap-1">
                    <button
                      className="table-action"
                      onClick={() => onEdit(row)}
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="table-action hover:text-rose-600"
                      onClick={() => onDelete(row.id)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BudgetPage({ budget, spent, month, onSave }) {
  return (
    <section className="content-card max-w-2xl p-6 sm:p-8">
      <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        <PiggyBank size={23} />
      </div>
      <h2 className="section-title text-xl">Set your monthly budget</h2>
      <p className="section-subtitle mt-1">
        Choose a spending limit for {monthLabel(month)}.
      </p>
      <form onSubmit={onSave} className="mt-8 space-y-5">
        <label className="field-label">
          Monthly budget (RM)
          <input
            className="field-input"
            name="budget"
            type="number"
            min="0"
            step="0.01"
            defaultValue={budget}
            placeholder="e.g. 2500"
          />
        </label>
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Current spending</span>
            <strong className="text-slate-900">{money(spent)}</strong>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Your budget is private to your account. You can update it at any
            time.
          </p>
        </div>
        <button className="primary-button">Save monthly budget</button>
      </form>
    </section>
  );
}

function Reports({ dashboard }) {
  const data = dashboard.categories || [];
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <section className="content-card p-5 sm:p-6">
        <h2 className="section-title">Expenses by category</h2>
        <p className="section-subtitle">See where your money goes.</p>
        {data.length ? (
          <>
            <div className="mx-auto mt-4 h-[280px] max-w-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={3}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={entry.category}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => money(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {data.map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-600">
                    <i
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {item.category}
                  </span>
                  <strong className="text-slate-800">
                    {money(item.amount)}
                  </strong>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyChart text="Add expense transactions to generate your report." />
        )}
      </section>
      <section className="content-card p-6">
        <h2 className="section-title">A little insight</h2>
        <p className="section-subtitle">Your month at a glance.</p>
        <div className="mt-7 space-y-4">
          <Insight
            icon={<ArrowDownRight size={18} />}
            label="Income received"
            value={money(dashboard.income)}
            tone="green"
          />
          <Insight
            icon={<ArrowUpRight size={18} />}
            label="Total spent"
            value={money(dashboard.expenses)}
            tone="purple"
          />
          <Insight
            icon={<TrendingUp size={18} />}
            label="Net balance"
            value={money(Number(dashboard.income) - Number(dashboard.expenses))}
            tone="blue"
          />
        </div>
      </section>
    </div>
  );
}

function Insight({ icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
      <div className={`insight-icon insight-${tone}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-0.5 font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
      <div className="empty-icon">
        <ChartNoAxesCombined size={22} />
      </div>
      <p className="mt-3 max-w-xs text-sm text-slate-400">{text}</p>
    </div>
  );
}
