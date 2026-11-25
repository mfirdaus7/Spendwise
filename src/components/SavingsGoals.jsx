
import { useEffect, useState } from "react";
import {
  Plus,
  PiggyBank,
  Target,
  TrendingUp,
  Pencil,
  Trash2,
  X,
  Check,
  CalendarDays,
} from "lucide-react";
import { api, money } from "../lib/api.js";

const emptyForm = {
  name: "",
  target_amount: "",
  target_date: "",
};

export default function SavingsGoals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [contributions, setContributions] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadGoals() {
    try {
      const data = await api("/savings");
      setGoals(data);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  const totalTarget = goals.reduce(
    (sum, goal) => sum + Number(goal.target_amount),
    0,
  );

  const totalSaved = goals.reduce(
    (sum, goal) => sum + Number(goal.current_amount),
    0,
  );

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setNotice("");
  }

  function openEditForm(goal) {
    setForm({
      name: goal.name,
      target_amount: goal.target_amount,
      target_date: goal.target_date
        ? String(goal.target_date).slice(0, 10)
        : "",
    });
    setEditingId(goal.id);
    setShowForm(true);
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const targetAmount = Number(form.target_amount);

    if (!form.name.trim() || !Number.isFinite(targetAmount) || targetAmount <= 0) {
      setNotice("Please enter a valid goal name and target amount.");
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      await api(editingId ? `/savings/${editingId}` : "/savings", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          target_amount: targetAmount,
          target_date: form.target_date || null,
        }),
      });

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      setNotice(editingId ? "Savings goal updated." : "Savings goal created.");
      await loadGoals();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function addContribution(id) {
    const amount = Number(contributions[id]);

    if (!Number.isFinite(amount) || amount <= 0) {
      setNotice("Please enter a valid contribution amount.");
      return;
    }

    try {
      await api(`/savings/${id}/contribute`, {
        method: "PATCH",
        body: JSON.stringify({ amount }),
      });

      setContributions((previous) => ({ ...previous, [id]: "" }));
      setNotice("Contribution added successfully.");
      await loadGoals();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function deleteGoal(id) {
    if (!window.confirm("Delete this savings goal? This cannot be undone.")) {
      return;
    }

    try {
      await api(`/savings/${id}`, { method: "DELETE" });
      setNotice("Savings goal deleted.");
      await loadGoals();
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="section-title">Your savings goals</h2>
          <p className="section-subtitle">
            Set a target, save consistently, and track your progress.
          </p>
        </div>

        <button className="primary-button" onClick={openCreateForm}>
          <Plus size={17} />
          Create goal
        </button>
      </div>

      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-700">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">
            <X size={17} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Target}
          label="Total goals"
          value={goals.length}
          description="Active savings goals"
        />
        <SummaryCard
          icon={PiggyBank}
          label="Total saved"
          value={money(totalSaved)}
          description="Your accumulated savings"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Total target"
          value={money(totalTarget)}
          description="Your combined savings target"
        />
      </div>

      {showForm && (
        <section className="content-card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="section-title">
                {editingId ? "Edit savings goal" : "Create a savings goal"}
              </h3>
              <p className="section-subtitle">
                Enter the details of your savings target.
              </p>
            </div>
            <button
              className="icon-button"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="field-label">Goal name</span>
              <input
                className="field-input"
                placeholder="e.g. Emergency Fund"
                maxLength={120}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </label>

            <label>
              <span className="field-label">Target amount (RM)</span>
              <input
                className="field-input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="10000"
                value={form.target_amount}
                onChange={(event) =>
                  setForm({ ...form, target_amount: event.target.value })
                }
                required
              />
            </label>

            <label>
              <span className="field-label">Target date (optional)</span>
              <input
                className="field-input"
                type="date"
                value={form.target_date}
                onChange={(event) =>
                  setForm({ ...form, target_date: event.target.value })
                }
              />
            </label>

            <div className="flex justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                <Check size={16} />
                {saving ? "Saving..." : editingId ? "Update goal" : "Save goal"}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <section className="content-card p-10 text-center text-sm text-slate-500">
          Loading savings goals...
        </section>
      ) : goals.length === 0 ? (
        <section className="content-card flex flex-col items-center px-6 py-14 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <PiggyBank size={30} />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-800">
            Start your savings journey
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            You haven't created any savings goals yet. Start with a small
            target and build your savings habit.
          </p>
          <button className="primary-button mt-5" onClick={openCreateForm}>
            <Plus size={17} />
            Create your first goal
          </button>
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {goals.map((goal) => {
            const saved = Number(goal.current_amount);
            const target = Number(goal.target_amount);
            const percentage =
              target > 0 ? Math.min((saved / target) * 100, 100) : 0;
            const completed = saved >= target;

            return (
              <section key={goal.id} className="content-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <PiggyBank size={21} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-800">
                        {goal.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {goal.target_date
                          ? `Target: ${new Date(`${String(goal.target_date).slice(0, 10)}T00:00:00`).toLocaleDateString("en-MY")}`
                          : "No target date"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      className="icon-button"
                      onClick={() => openEditForm(goal)}
                      title="Edit goal"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-button text-rose-500"
                      onClick={() => deleteGoal(goal.id)}
                      title="Delete goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Amount saved</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">
                      {money(saved)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Target</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {money(target)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="font-semibold text-slate-500">
                      Progress
                    </span>
                    <span className="font-bold text-violet-600">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500">
                    {completed
                      ? "Goal completed!"
                      : `${money(Math.max(target - saved, 0))} remaining`}
                  </span>
                  {completed && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-600">
                      Completed
                    </span>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-semibold text-slate-600">
                    Add contribution
                  </p>
                  <div className="flex gap-2">
                    <input
                      className="field-input min-w-0 flex-1"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Amount (RM)"
                      value={contributions[goal.id] || ""}
                      onChange={(event) =>
                        setContributions((previous) => ({
                          ...previous,
                          [goal.id]: event.target.value,
                        }))
                      }
                    />
                    <button
                      className="primary-button shrink-0"
                      onClick={() => addContribution(goal.id)}
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, description }) {
  return (
    <section className="content-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">{description}</p>
    </section>
  );
}
