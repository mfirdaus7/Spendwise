import { useEffect, useState } from "react";
import { X } from "lucide-react";

const categories = ["Food & Drinks", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Education", "Salary", "Freelance", "Other"];

export default function TransactionModal({ open, onClose, onSave, editing }) {
  const [form, setForm] = useState({
    type: "expense", title: "", category: "Food & Drinks", amount: "", date: new Date().toISOString().slice(0, 10), note: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) setForm({ ...editing, amount: String(editing.amount), date: editing.date?.slice(0, 10) });
    else setForm({ type: "expense", title: "", category: "Food & Drinks", amount: "", date: new Date().toISOString().slice(0, 10), note: "" });
    setError("");
  }, [editing, open]);

  if (!open) return null;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0 || !form.date) {
      setError("Please complete the title, amount and date.");
      return;
    }
    try {
      await onSave({ ...form, amount: Number(form.amount) });
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-panel">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div><h2 className="font-display text-lg font-extrabold text-slate-900">{editing ? "Edit transaction" : "Add transaction"}</h2><p className="mt-1 text-xs text-slate-400">Keep your money records up to date.</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            {["expense", "income"].map((type) => <button type="button" key={type} onClick={() => update("type", type)} className={`rounded-lg py-2.5 text-sm font-bold capitalize transition ${form.type === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{type}</button>)}
          </div>
          <label className="field-label">Description<input className="field-input" placeholder="e.g. Lunch with friends" value={form.title} onChange={(e) => update("title", e.target.value)} autoFocus /></label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="field-label">Amount (RM)<input className="field-input" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => update("amount", e.target.value)} /></label>
            <label className="field-label">Category<select className="field-input" value={form.category} onChange={(e) => update("category", e.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          </div>
          <label className="field-label">Date<input className="field-input" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></label>
          <label className="field-label">Note <span className="font-normal text-slate-400">(optional)</span><textarea className="field-input min-h-20 resize-y" placeholder="Add a little detail..." value={form.note} onChange={(e) => update("note", e.target.value)} /></label>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{editing ? "Save changes" : "Add transaction"}</button></div>
        </form>
      </section>
    </div>
  );
}