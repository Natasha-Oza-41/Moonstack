"use client";

import { CheckCircle2, KeyRound, Save, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, PrimaryButton } from "@/components/ui/primitives";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useMoonstackStore } from "@/store/moonstack-store";

export function SettingsView() {
  const { settings, updateSettings } = useMoonstackStore();
  const [displayName, setDisplayName] = useState(settings.displayName || "");
  const [linkedinUrl, setLinkedinUrl] = useState(settings.linkedinUrl || "");
  const [gmail, setGmail] = useState(settings.gmail || "");
  const [newPassword, setNewPassword] = useState("");
  const [githubProfile, setGithubProfile] = useState(settings.githubProfile);
  const [dsaRepoUrl, setDsaRepoUrl] = useState(settings.dsaRepoUrl);
  const [dsaBranch, setDsaBranch] = useState(settings.dsaBranch);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, linkedin_url, gmail")
        .eq("id", user.id)
        .maybeSingle();

      const nextName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || settings.displayName || "";
      const nextLinkedin = profile?.linkedin_url || settings.linkedinUrl || "";
      const nextGmail = profile?.gmail || user.email || settings.gmail || "";
      setDisplayName(nextName);
      setLinkedinUrl(nextLinkedin);
      setGmail(nextGmail);
      updateSettings({ displayName: nextName, linkedinUrl: nextLinkedin, gmail: nextGmail });
    });
  }, [settings.displayName, settings.gmail, settings.linkedinUrl, updateSettings]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    updateSettings({ displayName, linkedinUrl, gmail });

    if (!isSupabaseConfigured) {
      setStatus("Profile saved locally. Supabase env is missing.");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setStatus(userError?.message || "Sign in before saving profile.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: userData.user.id,
      full_name: displayName,
      linkedin_url: linkedinUrl,
      gmail,
      updated_at: new Date().toISOString(),
    });

    if (!error && gmail && gmail !== userData.user.email) {
      const { error: emailError } = await supabase.auth.updateUser(
        { email: gmail, data: { full_name: displayName, name: displayName } },
        { emailRedirectTo: `${window.location.origin}/settings` },
      );
      setStatus(emailError ? emailError.message : "Profile saved. Check the new email address to confirm the email change.");
      return;
    }

    setStatus(error ? error.message : "Profile saved to Supabase.");
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setStatus("Supabase env is missing.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setStatus(error ? error.message : "Password updated.");
    if (!error) setNewPassword("");
  }

  async function sendPasswordLink() {
    if (!isSupabaseConfigured || !gmail) {
      setStatus("Add your email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(gmail, {
      redirectTo: `${window.location.origin}/settings`,
    });
    setStatus(error ? error.message : "Password reset link sent to your email.");
  }

  function saveGitHub(event: React.FormEvent) {
    event.preventDefault();
    updateSettings({ githubProfile, dsaRepoUrl, dsaBranch });
    setStatus("Repository target saved. The GitHub token stays server-side as GITHUB_TOKEN.");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Card className="p-5">
        <h2 className="text-2xl font-semibold">Account Profile</h2>
        <p className="mt-2 text-sm text-white/42">
          Profile details are saved in Supabase and also included in your synced app settings.
        </p>
        <form onSubmit={saveProfile} className="mt-6 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm text-white/50">Name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-emerald-300/35" placeholder="Your name" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-white/50">LinkedIn URL</span>
            <input value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-emerald-300/35" placeholder="https://www.linkedin.com/in/yourname" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-white/50">Gmail / account email</span>
            <input value={gmail} onChange={(event) => setGmail(event.target.value)} type="email" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-emerald-300/35" placeholder="you@gmail.com" />
          </label>
          <PrimaryButton className="w-fit" type="submit"><Save size={16} /> Save profile</PrimaryButton>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="text-2xl font-semibold">Password</h2>
        <form onSubmit={changePassword} className="mt-6 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm text-white/50">New password</span>
            <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" minLength={6} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-emerald-300/35" placeholder="At least 6 characters" />
          </label>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton className="w-fit" type="submit" disabled={!newPassword}><KeyRound size={16} /> Change password</PrimaryButton>
            <button type="button" onClick={sendPasswordLink} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/75 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-white">
              <Send size={16} /> Send reset link
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="text-2xl font-semibold">GitHub Commit Target</h2>
        <p className="mt-2 text-sm text-white/42">
          This is only the repository destination. The actual GitHub token is never entered here and must stay on the backend.
        </p>
        <form onSubmit={saveGitHub} className="mt-6 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm text-white/50">GitHub Profile</span>
            <input value={githubProfile} onChange={(event) => setGithubProfile(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-emerald-300/35" placeholder="https://github.com/yourusername" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-white/50">Default DSA Repository URL</span>
            <input value={dsaRepoUrl} onChange={(event) => setDsaRepoUrl(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-emerald-300/35" placeholder="https://github.com/yourusername/dsa-solutions" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-white/50">Default Branch</span>
            <input value={dsaBranch} onChange={(event) => setDsaBranch(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 outline-none focus:border-emerald-300/35" placeholder="main" />
          </label>
          <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-sm text-white/55">
            Parsed repo: <span className="text-emerald-200">{settings.dsaRepoFullName || "Save a GitHub repo URL first"}</span>
          </div>
          <PrimaryButton className="w-fit" type="submit"><CheckCircle2 size={16} /> Save repository target</PrimaryButton>
        </form>
      </Card>

      {status && (
        <Card className="p-4 text-sm text-white/64">
          {status}
        </Card>
      )}
    </div>
  );
}
