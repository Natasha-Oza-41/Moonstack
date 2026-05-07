"use client";

import { BookOpen, CalendarClock, ExternalLink, GitCommitHorizontal, Kanban, Layers3, Loader2, Plus, Rows3, Search, Star, Table2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Badge, Button, Card, PrimaryButton, Progress } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";
import type { DsaProblem } from "@/lib/types";

const resources = [
  {
    label: "Striver A2Z",
    href: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
    importKey: "striver" as const,
  },
  {
    label: "Blind 75",
    href: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions",
    importKey: "blind75" as const,
  },
  {
    label: "LeetCode",
    href: "https://leetcode.com/problemset/",
    importKey: "leetcode" as const,
  },
];

export function DsaView() {
  const { dsaProblems, settings, toggleDsaStatus, updateDsaProblem, commitDsaProblem, addDsaProblem, importDsaSheet, updateSettings } = useMoonstackStore();
  const [repoUrl, setRepoUrl] = useState(settings.dsaRepoUrl);
  const [branch, setBranch] = useState(settings.dsaBranch);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [status, setStatus] = useState("All");
  const [confidence, setConfidence] = useState("All");
  const [viewMode, setViewMode] = useState<"roadmap" | "table" | "kanban">("roadmap");
  const [activeTopic, setActiveTopic] = useState("All");

  const topics = useMemo(() => Array.from(new Set(dsaProblems.map((problem) => problem.topic))).sort(), [dsaProblems]);
  const solved = dsaProblems.filter((problem) => problem.status === "solved").length;
  const review = dsaProblems.filter((problem) => problem.status === "review").length;
  const avgConfidence = Math.round(dsaProblems.reduce((sum, problem) => sum + problem.confidence, 0) / Math.max(1, dsaProblems.length));
  const readiness = Math.round(((solved / Math.max(1, dsaProblems.length)) * 70) + (avgConfidence * 6));

  const visibleProblems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dsaProblems.filter((problem) => {
      const matchesQuery = !needle || [problem.name, problem.topic, problem.subtopic, problem.platform].join(" ").toLowerCase().includes(needle);
      const matchesDifficulty = difficulty === "All" || problem.difficulty === difficulty;
      const matchesStatus = status === "All" || problem.status === status;
      const matchesConfidence = confidence === "All" || problem.confidence >= Number(confidence);
      const matchesTopic = activeTopic === "All" || problem.topic === activeTopic;
      return matchesQuery && matchesDifficulty && matchesStatus && matchesConfidence && matchesTopic;
    });
  }, [activeTopic, confidence, difficulty, dsaProblems, query, status]);

  const weakProblem = useMemo(() => {
    return [...dsaProblems].sort((a, b) => a.confidence - b.confidence || a.revisionCount - b.revisionCount)[0];
  }, [dsaProblems]);

  const revisionDays = useMemo(() => {
    return Array.from({ length: 28 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (27 - index));
      const key = date.toISOString().slice(0, 10);
      const count = dsaProblems.filter((problem) => problem.nextRevision === key || (problem.status === "solved" && index % 6 === 0)).length;
      return { key, count };
    });
  }, [dsaProblems]);

  function saveRepo(event: React.FormEvent) {
    event.preventDefault();
    updateSettings({ dsaRepoUrl: repoUrl, dsaBranch: branch || "main" });
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card className="relative overflow-hidden p-6">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-amber-300/12 blur-3xl" />
          <div className="absolute bottom-0 left-20 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative">
            <Badge tone="blue">Interview Preparation OS</Badge>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">Practice with proof, not clutter.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/48">
              Open trusted sheets, import starter sets, track confidence, schedule revision, and commit polished explanations to GitHub.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {resources.map((resource) => (
                <motion.div key={resource.label} whileHover={{ y: -3 }} className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 premium-ring">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{resource.label}</div>
                      <div className="mt-1 text-xs text-white/36">open sheet or import starter set</div>
                    </div>
                    <a href={resource.href} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 p-2 text-white/45 transition hover:bg-white/[0.06] hover:text-white">
                      <ExternalLink size={15} />
                    </a>
                  </div>
                  <Button onClick={() => importDsaSheet(resource.importKey)} className="mt-4 w-full justify-center px-3 py-2">
                    <Upload size={14} /> Import
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Readiness</h3>
              <p className="text-sm text-white/38">solved + confidence</p>
            </div>
            <div className="text-3xl font-bold text-cyan-100">{Math.min(100, readiness)}%</div>
          </div>
          <div className="mt-5 space-y-4">
            <Metric label="Solved" value={`${solved}/${dsaProblems.length}`} progress={(solved / Math.max(1, dsaProblems.length)) * 100} color="var(--cyan)" />
            <Metric label="Review queue" value={String(review)} progress={(review / Math.max(1, dsaProblems.length)) * 100} color="var(--violet)" />
            <Metric label="Confidence" value={`${avgConfidence}/5`} progress={avgConfidence * 20} color="var(--mint)" />
          </div>
        </Card>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-200/18 bg-cyan-200/10 text-cyan-100">
              <Layers3 size={18} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold">Smart recommendation</div>
              <p className="mt-1 text-sm leading-6 text-white/50">
                {weakProblem ? `Revise ${weakProblem.name} next. It has confidence ${weakProblem.confidence}/5 and belongs to ${weakProblem.topic}.` : "Add problems to generate recommendations."}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">Revision heatmap</div>
              <div className="text-xs text-white/36">next revisions and solved cadence</div>
            </div>
            <Badge tone="mint">{revisionDays.reduce((sum, day) => sum + day.count, 0)} signals</Badge>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
            {revisionDays.map((day) => (
              <div key={day.key} title={`${day.key}: ${day.count}`} className={day.count > 1 ? "h-5 rounded-md bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,.35)]" : day.count === 1 ? "h-5 rounded-md bg-cyan-200/45" : "h-5 rounded-md bg-white/[0.055]"} />
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <form onSubmit={saveRepo} className="grid gap-3 lg:grid-cols-[1fr_150px_auto]">
          <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-amber-300/35" placeholder="GitHub repo for DSA commits, e.g. https://github.com/you/dsa-solutions" />
          <input value={branch} onChange={(event) => setBranch(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-amber-300/35" placeholder="main" />
          <PrimaryButton type="submit">Save target</PrimaryButton>
        </form>
        <div className="mt-3 text-xs text-white/36">Current target: <span className="text-emerald-200">{settings.dsaRepoFullName || "not configured"}</span></div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Topics</h3>
            <Badge tone="muted">{topics.length}</Badge>
          </div>
          <div className="space-y-2">
            {["All", ...topics].map((topic) => {
              const topicProblems = topic === "All" ? dsaProblems : dsaProblems.filter((problem) => problem.topic === topic);
              const progress = Math.round((topicProblems.filter((problem) => problem.status === "solved").length / Math.max(1, topicProblems.length)) * 100);
              return (
                <button key={topic} onClick={() => setActiveTopic(topic)} className={activeTopic === topic ? "w-full rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-4 text-left" : "w-full rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left transition hover:bg-white/[0.05]"}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="font-medium">{topic}</span>
                    <span className="text-white/38">{progress}%</span>
                  </div>
                  <Progress value={progress} color="var(--cyan)" />
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-white/[0.07] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <Search size={15} className="text-white/35" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-white/28" placeholder="Search problems, topics, platforms..." />
              </div>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b0d14] px-3 py-2 text-sm text-white/70 outline-none">
                {["All", "Easy", "Medium", "Hard"].map((item) => <option key={item}>{item}</option>)}
              </select>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b0d14] px-3 py-2 text-sm text-white/70 outline-none">
                {["All", "unsolved", "review", "solved"].map((item) => <option key={item}>{item}</option>)}
              </select>
              <select value={confidence} onChange={(event) => setConfidence(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b0d14] px-3 py-2 text-sm text-white/70 outline-none">
                {["All", "2", "3", "4", "5"].map((item) => <option key={item} value={item}>{item === "All" ? "All confidence" : `${item}+ confidence`}</option>)}
              </select>
              <div className="flex rounded-xl border border-white/10 bg-white/[0.035] p-1">
                {[
                  ["roadmap", Rows3],
                  ["table", Table2],
                  ["kanban", Kanban],
                ].map(([mode, Icon]) => (
                  <button key={String(mode)} onClick={() => setViewMode(mode as "roadmap" | "table" | "kanban")} className={viewMode === mode ? "rounded-lg bg-cyan-200/12 px-3 py-1.5 text-cyan-100" : "rounded-lg px-3 py-1.5 text-white/38 hover:text-white"}>
                    <Icon size={15} />
                  </button>
                ))}
              </div>
              <PrimaryButton onClick={addDsaProblem}><Plus size={15} /> Add</PrimaryButton>
            </div>
          </div>

          {viewMode === "kanban" ? <KanbanProblems problems={visibleProblems} /> : viewMode === "table" ? <TableProblems problems={visibleProblems} /> : <div className="divide-y divide-white/[0.05]">
            {visibleProblems.map((problem, index) => (
              <motion.div key={problem.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.2) }} className="grid gap-4 p-4 transition hover:bg-white/[0.025] lg:grid-cols-[1fr_220px_190px]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {problem.favorite && <Star size={14} className="fill-amber-200 text-amber-200" />}
                    <input value={problem.name} onChange={(event) => updateDsaProblem(problem.id, { name: event.target.value })} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none focus:text-amber-100" />
                    <Badge tone={problem.difficulty === "Easy" ? "mint" : problem.difficulty === "Medium" ? "amber" : "rose"}>{problem.difficulty}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <input value={problem.topic} onChange={(event) => updateDsaProblem(problem.id, { topic: event.target.value })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs outline-none" />
                    <input value={problem.subtopic} onChange={(event) => updateDsaProblem(problem.id, { subtopic: event.target.value })} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs outline-none" />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a href={problem.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-blue-300/14 bg-blue-300/8 px-2 py-1 text-xs text-blue-100/75">
                      <BookOpen size={12} /> Open problem
                    </a>
                    <input value={problem.url} onChange={(event) => updateDsaProblem(problem.id, { url: event.target.value })} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/42 outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <button onClick={() => toggleDsaStatus(problem.id)} className="w-full text-left">
                    <Badge tone={problem.status === "solved" ? "mint" : problem.status === "review" ? "amber" : "muted"}>{problem.status}</Badge>
                  </button>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs text-white/38"><CalendarClock size={13} /> Next revision</div>
                    <input type="date" value={problem.nextRevision} onChange={(event) => updateDsaProblem(problem.id, { nextRevision: event.target.value })} className="w-full rounded-xl border border-white/10 bg-[#0b0d14] px-3 py-2 text-xs text-white/60 outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-2 text-xs text-white/38">Confidence</div>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <button key={dot} onClick={() => updateDsaProblem(problem.id, { confidence: dot })} className={dot <= problem.confidence ? "h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,.45)]" : "h-3 w-3 rounded-full bg-white/10"} />
                      ))}
                    </div>
                  </div>
                  {problem.commitUrl ? (
                    <a href={problem.commitUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm text-emerald-200">Committed</a>
                  ) : (
                    <Button onClick={() => commitDsaProblem(problem.id)} disabled={problem.commitStatus === "committing"} className="w-full px-3 py-2">
                      {problem.commitStatus === "committing" ? <Loader2 size={14} className="animate-spin" /> : <GitCommitHorizontal size={14} />}
                      Commit
                    </Button>
                  )}
                  {problem.commitStatus === "error" && <div className="rounded-xl border border-rose-300/14 bg-rose-300/8 p-2 text-xs text-rose-100/80">{problem.commitError}</div>}
                </div>
              </motion.div>
            ))}

            {visibleProblems.length === 0 && (
              <div className="p-8 text-center text-sm text-white/42">No problems match these filters.</div>
            )}
          </div>}
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, progress, color = "var(--amber)" }: { label: string; value: string; progress: number; color?: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-white/48">{label}</span>
        <span>{value}</span>
      </div>
      <Progress value={progress} color={color} />
    </div>
  );
}

function TableProblems({ problems }: { problems: DsaProblem[] }) {
  if (!problems.length) return <div className="p-8 text-center text-sm text-white/42">No problems match these filters.</div>;

  return (
    <div className="quiet-scroll overflow-x-auto">
      <div className="min-w-[820px]">
        <div className="grid grid-cols-[1.4fr_.8fr_.6fr_.7fr_.7fr] border-b border-white/[0.07] px-5 py-3 text-xs uppercase tracking-[0.16em] text-white/32">
          <div>Problem</div>
          <div>Topic</div>
          <div>Difficulty</div>
          <div>Status</div>
          <div>Confidence</div>
        </div>
        {problems.map((problem) => (
          <div key={problem.id} className="grid grid-cols-[1.4fr_.8fr_.6fr_.7fr_.7fr] items-center border-b border-white/[0.045] px-5 py-4 text-sm">
            <div>
              <a href={problem.url} target="_blank" rel="noreferrer" className="font-medium text-white/82 hover:text-cyan-100">{problem.name}</a>
              <div className="mt-1 text-xs text-white/36">{problem.platform}</div>
            </div>
            <div className="text-white/56">{problem.topic}</div>
            <div><Badge tone={problem.difficulty === "Easy" ? "mint" : problem.difficulty === "Medium" ? "amber" : "rose"}>{problem.difficulty}</Badge></div>
            <div><Badge tone={problem.status === "solved" ? "mint" : problem.status === "review" ? "violet" : "muted"}>{problem.status}</Badge></div>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((dot) => <span key={dot} className={dot <= problem.confidence ? "h-2.5 w-2.5 rounded-full bg-cyan-200" : "h-2.5 w-2.5 rounded-full bg-white/10"} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanProblems({ problems }: { problems: DsaProblem[] }) {
  const columns = [
    ["Unsolved", problems.filter((problem) => problem.status === "unsolved")],
    ["Review", problems.filter((problem) => problem.status === "review")],
    ["Solved", problems.filter((problem) => problem.status === "solved")],
  ] as const;

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-3">
      {columns.map(([title, items]) => (
        <div key={title} className="rounded-2xl border border-white/[0.06] bg-black/18 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <Badge tone="muted">{items.length}</Badge>
          </div>
          <div className="space-y-3">
            {items.map((problem) => (
              <motion.a
                key={problem.id}
                href={problem.url}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -2 }}
                className="block rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4 transition hover:border-cyan-200/16 hover:bg-cyan-200/[0.055]"
              >
                <div className="font-medium text-white/82">{problem.name}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={problem.difficulty === "Easy" ? "mint" : problem.difficulty === "Medium" ? "amber" : "rose"}>{problem.difficulty}</Badge>
                  <Badge tone="blue">{problem.topic}</Badge>
                </div>
                <div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((dot) => <span key={dot} className={dot <= problem.confidence ? "h-2 w-2 rounded-full bg-cyan-200" : "h-2 w-2 rounded-full bg-white/10"} />)}</div>
              </motion.a>
            ))}
            {!items.length && <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 text-sm text-white/35">Nothing here.</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
