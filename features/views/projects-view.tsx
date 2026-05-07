"use client";

import { ExternalLink, GitCommitHorizontal, Rocket, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Card, PrimaryButton, Progress } from "@/components/ui/primitives";
import { useMoonstackStore } from "@/store/moonstack-store";

export function ProjectsView() {
  const { projects, addProject, updateProject } = useMoonstackStore();
  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id || "");
  const activeProject = projects.find((project) => project.id === activeProjectId) || projects[0];

  useEffect(() => {
    if (!activeProjectId && projects[0]) setActiveProjectId(projects[0].id);
  }, [activeProjectId, projects]);

  function createProject() {
    addProject();
    window.setTimeout(() => {
      const next = useMoonstackStore.getState().projects[0];
      if (next) setActiveProjectId(next.id);
    }, 0);
  }

  function copyReadme() {
    if (!activeProject) return;
    const readme = activeProject.readme || `# ${activeProject.name}\n\n${activeProject.architecture}\n\n## Stack\n${activeProject.stack.map((item) => `- ${item}`).join("\n")}`;
    navigator.clipboard.writeText(readme);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="mint">Builder OS</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Turn projects into portfolio proof.</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/42">Architecture, stack, docs, README generation, bug logs, deployment state, and GitHub proof in one system.</p>
          </div>
          <PrimaryButton onClick={createProject}><Rocket size={16} /> New project</PrimaryButton>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[340px_1fr]">
        <Card className="p-4">
          <h3 className="px-1 font-semibold">Projects</h3>
          <div className="mt-4 space-y-2">
            {projects.map((project) => (
              <button key={project.id} onClick={() => setActiveProjectId(project.id)} className={project.id === activeProject?.id ? "w-full rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-left" : "w-full rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left hover:bg-white/[0.05]"}>
                <div className="font-medium">{project.name}</div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone="blue">{project.status}</Badge>
                  <span className="text-xs text-white/36">{project.progress}%</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {activeProject && (
          <Card className="p-5">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <input value={activeProject.name} onChange={(event) => updateProject(activeProject.id, { name: event.target.value })} className="w-full bg-transparent text-2xl font-semibold outline-none focus:text-emerald-100" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <select value={activeProject.status} onChange={(event) => updateProject(activeProject.id, { status: event.target.value as typeof activeProject.status })} className="rounded-xl border border-white/10 bg-[#0b0d14] px-3 py-2 text-sm text-white/70 outline-none">
                    {["Planning", "Building", "Testing", "Shipped"].map((status) => <option key={status}>{status}</option>)}
                  </select>
                  <input value={activeProject.deploy} onChange={(event) => updateProject(activeProject.id, { deploy: event.target.value })} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none" placeholder="Vercel" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyReadme}><GitCommitHorizontal size={15} /> Copy README</Button>
                <a href={activeProject.repo} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 p-2 text-white/50 hover:text-white"><ExternalLink size={16} /></a>
              </div>
            </div>

            <label className="space-y-2">
              <div className="flex justify-between text-sm text-white/50"><span>Progress</span><span>{activeProject.progress}%</span></div>
              <input type="range" min={0} max={100} value={activeProject.progress} onChange={(event) => updateProject(activeProject.id, { progress: Number(event.target.value) })} className="w-full" />
              <Progress value={activeProject.progress} />
            </label>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-white/50">Repository URL</span>
                <input value={activeProject.repo} onChange={(event) => updateProject(activeProject.id, { repo: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-emerald-300/35" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-white/50">Stack, comma separated</span>
                <input value={activeProject.stack.join(", ")} onChange={(event) => updateProject(activeProject.id, { stack: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-emerald-300/35" />
              </label>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-white/50">Architecture</span>
                <textarea value={activeProject.architecture} onChange={(event) => updateProject(activeProject.id, { architecture: event.target.value })} className="min-h-[180px] w-full rounded-3xl border border-white/[0.06] bg-black/20 p-4 text-sm leading-6 text-white/70 outline-none focus:border-emerald-300/25" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-white/50">README / Portfolio case study</span>
                <textarea value={activeProject.readme || ""} onChange={(event) => updateProject(activeProject.id, { readme: event.target.value })} className="min-h-[180px] w-full rounded-3xl border border-white/[0.06] bg-black/20 p-4 font-mono text-sm leading-6 text-white/70 outline-none focus:border-emerald-300/25" />
              </label>
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm text-white/50">Next milestone</span>
              <input value={activeProject.nextMilestone} onChange={(event) => updateProject(activeProject.id, { nextMilestone: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-emerald-300/35" />
            </label>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/38"><Save size={14} /> Saved in Moonstack state. Use Settings sync after Supabase migration is applied.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
