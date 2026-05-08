"use client";

import { BookOpen, Code2, ExternalLink, GitCommitHorizontal, Loader2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button, PrimaryButton, Progress } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";
import type { DsaProblem } from "@/lib/types";

const sheets = [
  { label: "Striver A2Z", key: "striver" as const, href: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/" },
  { label: "Blind 75", key: "blind75" as const, href: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions" },
  { label: "LeetCode", key: "leetcode" as const, href: "https://leetcode.com/problemset/" },
];

export function DsaView() {
  const { dsaProblems, settings, toggleDsaStatus, updateDsaProblem, commitDsaProblem, addDsaProblem, importDsaSheet, updateSettings } = useMoonstackStore();
  const [repoUrl, setRepoUrl] = useState(settings.dsaRepoUrl);
  const [branch, setBranch] = useState(settings.dsaBranch);
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeId, setActiveId] = useState(dsaProblems[0]?.id || "");
  const [toast, setToast] = useState("");

  const topics = useMemo(() => Array.from(new Set(dsaProblems.map((problem) => problem.topic))).sort(), [dsaProblems]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dsaProblems.filter((problem) => {
      const matchesTopic = activeTopic === "All" || problem.topic === activeTopic;
      const matchesQuery = !needle || [problem.name, problem.topic, problem.subtopic, problem.platform].join(" ").toLowerCase().includes(needle);
      return matchesTopic && matchesQuery;
    });
  }, [activeTopic, dsaProblems, query]);
  const active = dsaProblems.find((problem) => problem.id === activeId) || visible[0] || dsaProblems[0];
  const solved = dsaProblems.filter((problem) => problem.status === "solved").length;

  function saveRepo(event: React.FormEvent) {
    event.preventDefault();
    updateSettings({ dsaRepoUrl: repoUrl, dsaBranch: branch || "main" });
    setToast("DSA commit target saved.");
  }

  function importSheet(sheet: "striver" | "blind75" | "leetcode") {
    importDsaSheet(sheet);
    setToast("Sheet imported. Topics and problem links are visible below.");
  }

  return (
    <div className="space-y-5">
      {toast && <div className="toast-pop fixed right-5 top-5 z-50 rounded-2xl border border-cyan-300/20 bg-cyan-300/12 px-4 py-3 text-sm text-cyan-100 shadow-2xl">{toast}</div>}
      <section className="pastel-panel rounded-[1.35rem] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="blue">Code Arena</Badge>
            <h2 className="mt-3 text-3xl font-semibold">DSA hierarchy</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/42">Topic to problem to statement, approach, code and source. No extra boxes.</p>
          </div>
          <div className="min-w-[220px]">
            <div className="mb-2 flex justify-between text-sm"><span className="text-white/50">Solved</span><span>{solved}/{dsaProblems.length}</span></div>
            <Progress value={(solved / Math.max(1, dsaProblems.length)) * 100} color="var(--cyan)" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <aside className="pastel-panel rounded-[1.35rem] p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <Search size={15} className="text-white/35" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-white/28" placeholder="Search" />
          </div>
          <div className="mt-4 space-y-2">
            {["All", ...topics].map((topic) => {
              const topicProblems = topic === "All" ? dsaProblems : dsaProblems.filter((problem) => problem.topic === topic);
              const progress = Math.round((topicProblems.filter((problem) => problem.status === "solved").length / Math.max(1, topicProblems.length)) * 100);
              return (
                <button key={topic} onClick={() => setActiveTopic(topic)} className={activeTopic === topic ? "w-full rounded-2xl border border-cyan-200/24 bg-cyan-200/12 p-3 text-left" : "w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 text-left hover:bg-white/[0.06]"}>
                  <div className="mb-2 flex justify-between text-sm"><span>{topic}</span><span className="text-white/38">{topicProblems.length}</span></div>
                  <Progress value={progress} color="var(--cyan)" />
                </button>
              );
            })}
          </div>
          <div className="mt-5 border-t border-white/[0.07] pt-4">
            <h3 className="text-sm font-semibold">Import sheet</h3>
            <div className="mt-3 space-y-2">
              {sheets.map((sheet) => (
                <div key={sheet.key} className="flex items-center gap-2">
                  <Button onClick={() => importSheet(sheet.key)} className="flex-1 justify-start px-3 py-2">{sheet.label}</Button>
                  <a href={sheet.href} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 p-2 text-white/48 hover:text-white"><ExternalLink size={15} /></a>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="grid gap-5 xl:grid-cols-[320px_1fr]">
          <div className="pastel-panel quiet-scroll max-h-[760px] overflow-y-auto rounded-[1.35rem] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Problems</h3>
              <PrimaryButton onClick={() => {
                addDsaProblem();
                setToast("Problem created.");
              }}><Plus size={15} /> Open problem</PrimaryButton>
            </div>
            <div className="space-y-2">
              {visible.map((problem) => (
                <button key={problem.id} onClick={() => setActiveId(problem.id)} className={active?.id === problem.id ? "w-full rounded-2xl border border-amber-300/25 bg-amber-300/12 p-4 text-left" : "w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-left hover:bg-white/[0.06]"}>
                  <div className="font-medium">{problem.topic} - {problem.name}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone={problem.difficulty === "Easy" ? "mint" : problem.difficulty === "Medium" ? "amber" : "rose"}>{problem.difficulty}</Badge>
                    <Badge tone={problem.status === "solved" ? "mint" : problem.status === "review" ? "violet" : "muted"}>{problem.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {active && <ProblemPanel problem={active} updateDsaProblem={updateDsaProblem} toggleDsaStatus={toggleDsaStatus} commitDsaProblem={commitDsaProblem} />}
        </main>
      </section>

      <form onSubmit={saveRepo} className="pastel-panel grid gap-3 rounded-[1.35rem] p-4 lg:grid-cols-[1fr_150px_auto]">
        <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} className="soft-input rounded-2xl px-4 py-3 text-sm outline-none" placeholder="GitHub repo for DSA commits" />
        <input value={branch} onChange={(event) => setBranch(event.target.value)} className="soft-input rounded-2xl px-4 py-3 text-sm outline-none" placeholder="main" />
        <PrimaryButton type="submit">Save target</PrimaryButton>
      </form>
    </div>
  );
}

function ProblemPanel({ problem, updateDsaProblem, toggleDsaStatus, commitDsaProblem }: {
  problem: DsaProblem;
  updateDsaProblem: (id: string, problem: Partial<DsaProblem>) => void;
  toggleDsaStatus: (id: string) => void;
  commitDsaProblem: (id: string) => Promise<void>;
}) {
  return (
    <section className="pastel-panel rounded-[1.35rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge tone="blue">{problem.topic} - {problem.subtopic}</Badge>
          <input value={problem.name} onChange={(event) => updateDsaProblem(problem.id, { name: event.target.value })} className="mt-3 w-full bg-transparent text-3xl font-semibold outline-none focus:text-cyan-100" />
        </div>
        <Button onClick={() => toggleDsaStatus(problem.id)}>{problem.status === "solved" ? "Mark review" : "Mark solved"}</Button>
      </div>

      <div className="mt-5 grid gap-4">
        <Section title="Problem Statement" icon={<BookOpen size={16} />}>
          <a href={problem.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-blue-300/16 bg-blue-300/8 px-3 py-2 text-sm text-blue-100/80">
            Open problem <ExternalLink size={14} />
          </a>
          <input value={problem.url} onChange={(event) => updateDsaProblem(problem.id, { url: event.target.value })} className="soft-input mt-3 w-full rounded-xl px-3 py-2 text-sm outline-none" />
        </Section>
        <Section title="Solution Approach">
          <textarea value={problem.approach} onChange={(event) => updateDsaProblem(problem.id, { approach: event.target.value })} className="soft-input min-h-[120px] w-full rounded-2xl p-4 text-sm leading-6 outline-none" />
          <input value={problem.complexity} onChange={(event) => updateDsaProblem(problem.id, { complexity: event.target.value })} className="soft-input mt-3 w-full rounded-xl px-3 py-2 text-sm outline-none" placeholder="Time and space complexity" />
        </Section>
        <Section title="Code" icon={<Code2 size={16} />}>
          <textarea value={problem.solutionCode || ""} onChange={(event) => updateDsaProblem(problem.id, { solutionCode: event.target.value })} className="soft-input min-h-[170px] w-full rounded-2xl p-4 font-mono text-sm leading-6 outline-none" placeholder="// Add solution code here" />
        </Section>
        <Section title="Question From">
          <div className="grid gap-3 md:grid-cols-3">
            <input value={problem.platform} onChange={(event) => updateDsaProblem(problem.id, { platform: event.target.value })} className="soft-input rounded-xl px-3 py-2 text-sm outline-none" />
            <select value={problem.difficulty} onChange={(event) => updateDsaProblem(problem.id, { difficulty: event.target.value as DsaProblem["difficulty"] })} className="soft-input rounded-xl px-3 py-2 text-sm outline-none">
              {["Easy", "Medium", "Hard"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <input type="date" value={problem.nextRevision} onChange={(event) => updateDsaProblem(problem.id, { nextRevision: event.target.value })} className="soft-input rounded-xl px-3 py-2 text-sm outline-none" />
          </div>
        </Section>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {problem.commitUrl ? <a href={problem.commitUrl} target="_blank" rel="noreferrer" className="text-sm text-emerald-200">Committed to GitHub</a> : (
          <Button onClick={() => commitDsaProblem(problem.id)} disabled={problem.commitStatus === "committing"}>
            {problem.commitStatus === "committing" ? <Loader2 size={14} className="animate-spin" /> : <GitCommitHorizontal size={14} />}
            Commit solution
          </Button>
        )}
        {problem.commitStatus === "error" && <span className="text-sm text-rose-200">{problem.commitError}</span>}
      </div>
    </section>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/72">{icon}{title}</div>
      {children}
    </div>
  );
}
