import { useState } from "react";
import { Wallet, ArrowRight, Eye, EyeOff, ShieldCheck, ChartNoAxesCombined } from "lucide-react";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try { await onAuth(mode, form); }
    catch (authError) { setError(authError.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="auth-shell">
      <section className="auth-visual hidden lg:flex">
        <div className="relative z-10 max-w-lg">
          <div className="mb-12 flex items-center gap-3"><div className="brand-mark brand-mark-light"><Wallet size={21} /></div><span className="font-display text-2xl font-extrabold tracking-tight text-white">spendwise.</span></div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80"><ShieldCheck size={14} /> YOUR MONEY, YOUR CLARITY</p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.12] tracking-tight text-white">A clearer view of your money starts here.</h1>
          <p className="mt-6 max-w-md text-base leading-8 text-white/70">Understand your habits, stay on top of your budget, and feel more confident about every financial decision.</p>
          <div className="mt-14 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white"><ChartNoAxesCombined size={20} /></div><div><p className="text-sm font-bold text-white">Your finances at a glance</p><p className="text-xs text-white/60">Simple insights. Better everyday choices.</p></div></div>
          </div>
        </div>
        <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" />
        <p className="absolute bottom-8 left-10 text-xs text-white/45">SpendWise · Personal finance, made simple</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden"><div className="brand-mark"><Wallet size={20} /></div><span className="font-display text-xl font-extrabold text-slate-900">spendwise.</span></div>
          <p className="text-sm font-bold text-violet-600">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900">{mode === "login" ? "Sign in to SpendWise" : "Create your account"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{mode === "login" ? "Your personal finance overview is just a sign-in away." : "A few details and you're ready to take control."}</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {mode === "register" && <label className="field-label">Full name<input className="field-input" placeholder="Your name" value={form.name} onChange={(e) => update("name", e.target.value)} required /></label>}
            <label className="field-label">Email address<input className="field-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required /></label>
            <label className="field-label">Password<div className="relative"><input className="field-input pr-12" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} minLength={8} required /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
            <button className="primary-button w-full justify-center py-3.5" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={17} /></button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">{mode === "login" ? "New to SpendWise?" : "Already have an account?"} <button className="font-bold text-violet-600 hover:text-violet-700" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in instead"}</button></p>
          <p className="mt-10 text-center text-xs leading-5 text-slate-400">By continuing, you agree to use SpendWise responsibly. Your account data is private to your account.</p>
        </div>
      </section>
    </main>
  );
}