"use client";

import { Github, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, PrimaryButton } from "@/components/ui/primitives";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export function AuthView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState("");
  const next = searchParams.get("next") || "/dashboard";
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}${next}` : undefined;

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(next);
    });
  }, [next, router]);

  async function oauth(provider: "google" | "github") {
    if (!isSupabaseConfigured) {
      setStatus("Supabase env is missing.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : undefined,
      },
    });
    if (error) setStatus(error.message);
  }

  async function emailPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setStatus("Supabase env is missing.");
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { full_name: name, name },
        },
      });
      if (!error && data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: name,
          gmail: email,
          updated_at: new Date().toISOString(),
        });
      }
      setStatus(error ? error.message : "Verification email sent. Confirm your email, then sign in.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(error.message);
      return;
    }
    router.replace(next);
  }

  async function emailOtp(event: React.FormEvent) {
    event.preventDefault();
    await sendEmailLink();
  }

  async function sendEmailLink() {
    if (!isSupabaseConfigured) {
      setStatus("Supabase env is missing.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
        data: name ? { full_name: name, name } : undefined,
      },
    });
    setStatus(error ? error.message : "Secure sign-in link sent. Check your email.");
  }

  return (
    <main className="surface-grid grid min-h-dvh place-items-center bg-[#07080d] p-4 text-white">
      <Card className="w-full max-w-md p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-200/18 bg-cyan-200/10 text-cyan-100 shadow-[0_0_38px_rgba(103,232,249,.16)]">
            <Sparkles size={20} />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Sign in to Moonstack</h1>
          <p className="mt-2 text-sm leading-6 text-white/46">Use one account to sync your planner, roadmaps, code practice, notes, and settings.</p>

          <div className="mt-6 grid gap-3">
            <Button onClick={() => oauth("google")} className="w-full justify-center py-3">Continue with Google</Button>
            <Button onClick={() => oauth("github")} className="w-full justify-center py-3"><Github size={16} /> Continue with GitHub</Button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/30">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.035] p-1">
            <button type="button" onClick={() => setMode("login")} className={`rounded-xl px-3 py-2 text-sm transition ${mode === "login" ? "bg-white/[0.09] text-white" : "text-white/45"}`}>Login</button>
            <button type="button" onClick={() => setMode("signup")} className={`rounded-xl px-3 py-2 text-sm transition ${mode === "signup" ? "bg-white/[0.09] text-white" : "text-white/45"}`}>Create account</button>
          </div>

          <form onSubmit={emailPassword} className="grid gap-3">
            {mode === "signup" && (
              <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-cyan-200/35" placeholder="Your name" />
            )}
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-cyan-200/35" placeholder="you@example.com" />
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={6} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-cyan-200/35" placeholder="Password" />
            <PrimaryButton type="submit" className="w-full py-3"><Mail size={16} /> {mode === "login" ? "Login with email" : "Create account"}</PrimaryButton>
          </form>

          <button type="button" onClick={sendEmailLink} disabled={!email} className="mt-3 w-full rounded-xl px-3 py-2 text-sm text-white/45 transition hover:bg-white/[0.04] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40">
            Send secure email link instead
          </button>

          {status && <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 text-sm text-white/58">{status}</div>}
        </motion.div>
      </Card>
    </main>
  );
}
