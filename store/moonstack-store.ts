import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppSettings, DsaProblem, HealthLog, Note, Project, Roadmap, Task, ViewId } from "@/lib/types";

type MoonstackState = {
  activeView: ViewId;
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  commandOpen: boolean;
  tasks: Task[];
  roadmaps: Roadmap[];
  dsaProblems: DsaProblem[];
  projects: Project[];
  notes: Note[];
  healthLogs: HealthLog[];
  settings: AppSettings;
  selectedTaskIds: string[];
  xp: number;
  streak: number;
  setActiveView: (view: ViewId) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  addRoadmap: (roadmap: Roadmap) => void;
  createRoadmapFromInput: (input: string) => void;
  addRoadmapTasksToPlanner: (roadmapId: string) => void;
  addTask: (title?: string) => void;
  toggleTask: (id: string) => void;
  toggleTaskSelection: (id: string) => void;
  selectAllTasks: () => void;
  deleteSelectedTasks: () => void;
  toggleDsaStatus: (id: string) => void;
  updateDsaProblem: (id: string, problem: Partial<DsaProblem>) => void;
  commitDsaProblem: (id: string) => Promise<void>;
  addDsaProblem: () => void;
  importDsaSheet: (sheet: "striver" | "blind75" | "leetcode") => void;
  addProject: () => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  addNote: (folder?: string) => string;
  updateNote: (id: string, note: Partial<Note>) => void;
  addHealthLog: (log: Omit<HealthLog, "id">) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  exportSnapshot: () => object;
  importSnapshot: (snapshot: Partial<Pick<MoonstackState, "tasks" | "roadmaps" | "dsaProblems" | "projects" | "notes" | "healthLogs" | "settings" | "xp" | "streak">>) => void;
};

const today = new Date().toISOString().slice(0, 10);

const initialTasks: Task[] = [
  { id: "task-1", title: "Review roadmap phase 1 and choose today's module", tag: "Roadmap", priority: "high", date: today, done: false },
  { id: "task-2", title: "Solve one medium DSA problem and write mistakes", tag: "DSA", priority: "high", date: today, done: false },
  { id: "task-3", title: "Commit one proof-of-work note to GitHub", tag: "GitHub", priority: "medium", date: today, done: false },
];

const initialRoadmaps: Roadmap[] = [
  {
    id: "ai-engineer",
    title: "AI Engineer Career Roadmap",
    source: "roadmap.sh + custom AI builder track",
    mode: "timeline",
    phases: [
      {
        id: "phase-foundation",
        title: "Phase 1 - Foundations",
        description: "Python, Git, SQL, web basics, and daily execution habit.",
        duration: "Weeks 1-4",
        progress: 38,
        modules: [
          {
            id: "python-core",
            title: "Python Core",
            tasks: [
              { id: "py-1", title: "Complete syntax and data structures", type: "study", done: true, resources: ["https://docs.python.org/3/tutorial/"] },
              { id: "py-2", title: "Build a CLI habit tracker", type: "project", done: false, resources: ["https://github.com/"] },
            ],
          },
          {
            id: "git-proof",
            title: "GitHub Proof",
            tasks: [
              { id: "git-1", title: "Create daily commit system", type: "github", done: false, resources: ["https://docs.github.com/"] },
            ],
          },
        ],
      },
      {
        id: "phase-interview",
        title: "Phase 2 - Interview Systems",
        description: "DSA patterns, revision loops, and written explanations.",
        duration: "Weeks 5-10",
        progress: 18,
        modules: [
          {
            id: "dsa-patterns",
            title: "DSA Patterns",
            tasks: [
              { id: "dsa-1", title: "Arrays, hashing, two pointers", type: "dsa", done: false, resources: ["https://takeuforward.org/"] },
              { id: "dsa-2", title: "Schedule first revision cycle", type: "revision", done: false, resources: [] },
            ],
          },
        ],
      },
    ],
  },
];

const initialDsa: DsaProblem[] = [
  {
    id: "two-sum",
    topic: "Arrays",
    subtopic: "Hashing",
    name: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    platform: "LeetCode",
    difficulty: "Easy",
    status: "solved",
    confidence: 4,
    revisionCount: 2,
    nextRevision: today,
    approach: "Use a hash map to remember complements while scanning once.",
    complexity: "O(n) time, O(n) space",
    mistakes: "Initially forgot duplicate value cases.",
    favorite: true,
  },
  {
    id: "merge-intervals",
    topic: "Intervals",
    subtopic: "Sorting",
    name: "Merge Intervals",
    url: "https://leetcode.com/problems/merge-intervals/",
    platform: "LeetCode",
    difficulty: "Medium",
    status: "review",
    confidence: 3,
    revisionCount: 1,
    nextRevision: today,
    approach: "Sort by start, merge with last interval.",
    complexity: "O(n log n) time, O(n) output",
    mistakes: "Need cleaner boundary explanation.",
  },
];

const initialProjects: Project[] = [
  {
    id: "moonstack",
    name: "Moonstack",
    status: "Building",
    progress: 64,
    stack: ["Next.js", "TypeScript", "Supabase", "Framer Motion"],
    repo: "https://github.com/yourname/moonstack",
    deploy: "Vercel",
    architecture: "App shell, feature modules, Supabase data layer, GitHub commit API route.",
    nextMilestone: "Ship Supabase persistence and real AI planning.",
    readme: "# Moonstack\n\nA personal operating system for builders.",
    notes: "Track architecture decisions, bugs, and launch notes here.",
  },
];

const initialNotes: Note[] = [
  {
    id: "note-rag-basics",
    folder: "AI Engineering",
    title: "RAG Basics",
    content: "# Retrieval Augmented Generation\n\n- Chunk documents with semantic boundaries.\n- Embed chunks and store vectors.\n- Retrieve relevant context before generation.\n- Evaluate hallucination and answer quality.",
    tags: ["ai", "rag"],
    pinned: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-url-shortener",
    folder: "System Design",
    title: "URL Shortener",
    content: "# URL Shortener\n\n## Core flow\nLong URL -> short code -> redirect lookup.\n\n## Tables\n- links\n- click_events\n- users",
    tags: ["system-design"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "note-python-ds",
    folder: "Python",
    title: "Data Structures",
    content: "# Python Data Structures\n\nLists, dicts, sets, tuples, heaps, queues.",
    tags: ["python"],
    updatedAt: new Date().toISOString(),
  },
];

const initialHealthLogs: HealthLog[] = [
  {
    id: "health-today",
    date: today,
    mood: "Focused",
    sleepHours: 7.2,
    waterGlasses: 6,
    activities: "Walk, deep work, DSA practice",
    notes: "Good focus. Keep evening workload lighter.",
  },
];

function slug(value: string) {
  return value.toLowerCase().trim().replace(/https?:\/\//, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `item-${Date.now()}`;
}

function repoFullNameFromUrl(value: string) {
  const cleaned = value.trim().replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\.git$/, "");
  const [owner, repo] = cleaned.split("/");
  return owner && repo ? `${owner}/${repo}` : "";
}

function extractUrls(value: string) {
  return Array.from(new Set(value.match(/https?:\/\/[^\s)]+/g) ?? []));
}

function headingTitle(value: string, fallback: string) {
  return value.replace(/^#+\s*/, "").replace(/^[-*\d.\s]+/, "").trim().slice(0, 80) || fallback;
}

function roadmapTitleFromSource(source: string) {
  const urls = extractUrls(source);
  const primary = urls[0] || source;
  const base = primary.includes("roadmap.sh") ? primary.split("/").filter(Boolean).pop() || "Custom" : primary.slice(0, 48);
  return `${base.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase())} Roadmap`;
}

function roadmapPhasesFromInput(id: string, title: string, source: string) {
  const urls = extractUrls(source);
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const headings = lines.filter((line) => /^(#{1,3}\s+|phase\s+\d+|week\s+\d+|[-*]\s+)/i.test(line)).slice(0, 6);
  const seeds = headings.length ? headings : ["Foundations", "Build and Practice", "Revision and Proof"];

  return seeds.slice(0, 5).map((seed, index) => {
    const phase = index + 1;
    const phaseUrls = urls.filter((url) => source.indexOf(url) >= 0);
    return {
      id: `${id}-phase-${phase}`,
      title: `Phase ${phase} - ${headingTitle(seed, phase === 1 ? "Foundations" : phase === 2 ? "Build and Practice" : "Revision and Proof")}`,
      description: phase === 1 ? "Map the concepts, collect trusted resources, and create the first execution loop." : phase === seeds.length ? "Revise, publish proof-of-work, and convert learning into interview-ready explanations." : "Convert learning into tasks, notes, projects, and measurable progress.",
      duration: `Week ${(phase - 1) * 2 + 1}-${phase * 2}`,
      progress: 0,
      resources: phaseUrls,
      modules: [
        {
          id: `${id}-module-${phase}`,
          title: phase === 1 ? "Learning Sprint" : phase === seeds.length ? "Proof Sprint" : "Execution Sprint",
          tasks: [
            { id: `${id}-task-${phase}-study`, title: `Study ${headingTitle(seed, title)} for 45 minutes`, type: "study" as const, done: false, resources: phaseUrls },
            { id: `${id}-task-${phase}-note`, title: `Write one note for ${headingTitle(seed, title)}`, type: "revision" as const, done: false, resources: [] },
            { id: `${id}-task-${phase}-proof`, title: `Create one GitHub proof item for ${headingTitle(seed, title)}`, type: "github" as const, done: false, resources: phaseUrls.slice(0, 1) },
          ],
        },
      ],
    };
  });
}

function dsaMarkdown(problem: DsaProblem) {
  return `# ${problem.name}

- Platform: ${problem.platform}
- Topic: ${problem.topic} / ${problem.subtopic}
- Difficulty: ${problem.difficulty}
- Problem: ${problem.url}

## Approach
${problem.approach}

## Complexity
${problem.complexity}

## Mistakes / Takeaways
${problem.mistakes || "Add mistakes after the next revision."}

## Revision
- Confidence: ${problem.confidence}/5
- Revision count: ${problem.revisionCount}
- Next revision: ${problem.nextRevision}
`;
}

export const useMoonstackStore = create<MoonstackState>()(
  persist(
    (set, get) => ({
      activeView: "dashboard",
      sidebarOpen: true,
      mobileSidebarOpen: false,
      commandOpen: false,
      tasks: initialTasks,
      roadmaps: initialRoadmaps,
      dsaProblems: initialDsa,
      projects: initialProjects,
      notes: initialNotes,
      healthLogs: initialHealthLogs,
      selectedTaskIds: [],
      settings: {
        displayName: "",
        linkedinUrl: "",
        gmail: "",
        theme: "dark",
        githubProfile: "",
        dsaRepoUrl: "",
        dsaRepoFullName: "",
        dsaBranch: "main",
        openAiModel: "gpt-4.1-mini",
      },
      xp: 245,
      streak: 14,
      setActiveView: (view) => set({ activeView: view }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      setCommandOpen: (open) => set({ commandOpen: open }),
      addRoadmap: (roadmap) => set((state) => state.roadmaps.some((item) => item.id === roadmap.id) ? state : { roadmaps: [roadmap, ...state.roadmaps] }),
      createRoadmapFromInput: (input) => {
        const source = input.trim() || "Custom roadmap";
        const id = `roadmap-${slug(source)}`;
        const title = roadmapTitleFromSource(source);
        const roadmap: Roadmap = {
          id,
          title,
          source,
          mode: "timeline",
          phases: roadmapPhasesFromInput(id, title, source),
        };
        set((state) => state.roadmaps.some((item) => item.id === id) ? state : { roadmaps: [roadmap, ...state.roadmaps], activeView: "roadmaps" });
      },
      addRoadmapTasksToPlanner: (roadmapId) => {
        const roadmap = get().roadmaps.find((item) => item.id === roadmapId);
        if (!roadmap) return;
        const existing = new Set(get().tasks.map((task) => `${task.source || ""}:${task.title}`.toLowerCase()));
        const tasks = roadmap.phases.flatMap((phase) =>
          phase.modules.flatMap((module) =>
            module.tasks.map((task) => ({
              id: `${roadmap.id}-${task.id}`,
              title: task.title,
              tag: phase.title.split("-")[0].trim(),
              priority: task.type === "dsa" || task.type === "project" ? "high" as const : "medium" as const,
              date: today,
              done: task.done,
              source: roadmap.title,
            })),
          ),
        ).filter((task) => !existing.has(`${task.source || ""}:${task.title}`.toLowerCase()));
        set((state) => ({ tasks: [...tasks, ...state.tasks] }));
      },
      addTask: (title) => set((state) => ({
        tasks: [{
          id: `task-${Date.now()}`,
          title: title?.trim() || "New focused task",
          tag: "Manual",
          priority: "medium",
          date: today,
          done: false,
        }, ...state.tasks],
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task),
        xp: state.xp + 10,
      })),
      toggleTaskSelection: (id) => set((state) => ({
        selectedTaskIds: state.selectedTaskIds.includes(id) ? state.selectedTaskIds.filter((item) => item !== id) : [...state.selectedTaskIds, id],
      })),
      selectAllTasks: () => set((state) => ({
        selectedTaskIds: state.selectedTaskIds.length === state.tasks.length ? [] : state.tasks.map((task) => task.id),
      })),
      deleteSelectedTasks: () => set((state) => ({
        tasks: state.tasks.filter((task) => !state.selectedTaskIds.includes(task.id)),
        selectedTaskIds: [],
      })),
      toggleDsaStatus: (id) => set((state) => ({
        dsaProblems: state.dsaProblems.map((problem) => problem.id === id ? {
          ...problem,
          status: problem.status === "solved" ? "review" : "solved",
        } : problem),
        xp: state.xp + 25,
      })),
      updateDsaProblem: (id, problem) => set((state) => ({
        dsaProblems: state.dsaProblems.map((item) => item.id === id ? { ...item, ...problem } : item),
      })),
      commitDsaProblem: async (id) => {
        const problem = get().dsaProblems.find((item) => item.id === id);
        const { dsaRepoFullName, dsaBranch } = get().settings;
        const targetRepo = problem?.repoOverride || dsaRepoFullName;
        if (!problem) return;
        if (!targetRepo) {
          set((state) => ({ dsaProblems: state.dsaProblems.map((item) => item.id === id ? { ...item, commitStatus: "error", commitError: "Add your DSA repository in Settings first." } : item) }));
          return;
        }
        set((state) => ({ dsaProblems: state.dsaProblems.map((item) => item.id === id ? { ...item, commitStatus: "committing", commitError: undefined } : item) }));
        try {
          const response = await fetch("/api/github/commit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              repo: targetRepo,
              branch: dsaBranch || "main",
              path: `DSA/${problem.topic}/${problem.id}.md`,
              content: dsaMarkdown(problem),
              message: `Add DSA solution: ${problem.name}`,
            }),
          });
          const data = await response.json();
          if (!response.ok || !data.ok) throw new Error(data.error || "Commit failed");
          set((state) => ({ dsaProblems: state.dsaProblems.map((item) => item.id === id ? { ...item, commitStatus: "committed", commitUrl: data.commitUrl || data.commit } : item), xp: state.xp + 30 }));
        } catch (error) {
          set((state) => ({ dsaProblems: state.dsaProblems.map((item) => item.id === id ? { ...item, commitStatus: "error", commitError: error instanceof Error ? error.message : "Commit failed" } : item) }));
        }
      },
      addDsaProblem: () => set((state) => ({
        dsaProblems: [{
          id: `problem-${Date.now()}`,
          topic: "Custom",
          subtopic: "Practice",
          name: "New DSA Problem",
          url: "https://leetcode.com/problemset/",
          platform: "LeetCode",
          difficulty: "Medium",
          status: "unsolved",
          confidence: 1,
          revisionCount: 0,
          nextRevision: today,
          approach: "Write your approach here.",
          complexity: "Add time and space complexity.",
          mistakes: "",
        }, ...state.dsaProblems],
      })),
      importDsaSheet: (sheet) => set((state) => {
        const banks = {
          striver: [
            ["Arrays", "Hashing", "Two Sum", "https://leetcode.com/problems/two-sum/", "Easy"],
            ["Arrays", "Kadane", "Maximum Subarray", "https://leetcode.com/problems/maximum-subarray/", "Medium"],
            ["Linked List", "Pointers", "Reverse Linked List", "https://leetcode.com/problems/reverse-linked-list/", "Easy"],
          ],
          blind75: [
            ["Arrays", "Product", "Product of Array Except Self", "https://leetcode.com/problems/product-of-array-except-self/", "Medium"],
            ["Trees", "DFS", "Invert Binary Tree", "https://leetcode.com/problems/invert-binary-tree/", "Easy"],
            ["Graphs", "BFS", "Number of Islands", "https://leetcode.com/problems/number-of-islands/", "Medium"],
          ],
          leetcode: [
            ["Stack", "Monotonic", "Daily Temperatures", "https://leetcode.com/problems/daily-temperatures/", "Medium"],
            ["Binary Search", "Intervals", "Search in Rotated Sorted Array", "https://leetcode.com/problems/search-in-rotated-sorted-array/", "Medium"],
            ["Dynamic Programming", "1D DP", "Climbing Stairs", "https://leetcode.com/problems/climbing-stairs/", "Easy"],
          ],
        } as const;
        const existing = new Set(state.dsaProblems.map((problem) => problem.url));
        const imported = banks[sheet].filter((item) => !existing.has(item[3])).map(([topic, subtopic, name, url, difficulty]) => ({
          id: slug(name),
          topic,
          subtopic,
          name,
          url,
          platform: "LeetCode",
          difficulty: difficulty as DsaProblem["difficulty"],
          status: "unsolved" as const,
          confidence: 1,
          revisionCount: 0,
          nextRevision: today,
          approach: "Add approach after solving.",
          complexity: "Add time and space complexity.",
          mistakes: "",
        }));
        return { dsaProblems: [...imported, ...state.dsaProblems] };
      }),
      addProject: () => set((state) => ({
        projects: [{
          id: `project-${Date.now()}`,
          name: "New Builder Project",
          status: "Planning",
          progress: 5,
          stack: ["Next.js"],
          repo: state.settings.githubProfile ? `${state.settings.githubProfile}/new-project` : "https://github.com/yourusername/new-project",
          deploy: "Vercel",
          architecture: "Add architecture notes, APIs, database schema, and design decisions here.",
          nextMilestone: "Define MVP scope and first proof-of-work commit.",
          readme: "# New Builder Project\n\n## Problem\n\n## Stack\n\n## Architecture\n",
          notes: "Add bug logs, build journal, screenshots, and deployment notes.",
        }, ...state.projects],
      })),
      updateProject: (id, project) => set((state) => ({
        projects: state.projects.map((item) => item.id === id ? { ...item, ...project } : item),
      })),
      addNote: (folder = "General") => {
        const id = `note-${Date.now()}`;
        const title = `New Note ${Date.now().toString().slice(-4)}`;
        set((state) => ({
          notes: [{
            id,
            folder,
            title,
            content: `# ${title}\n\nStart writing here.`,
            tags: [],
            updatedAt: new Date().toISOString(),
          }, ...state.notes],
        }));
        return id;
      },
      updateNote: (id, note) => set((state) => ({
        notes: state.notes.map((item) => item.id === id ? { ...item, ...note, updatedAt: new Date().toISOString() } : item),
      })),
      addHealthLog: (log) => set((state) => {
        const next: HealthLog = { ...log, id: `health-${log.date}` };
        return {
          healthLogs: [next, ...state.healthLogs.filter((item) => item.date !== log.date)],
        };
      }),
      updateSettings: (settings) => set((state) => {
        const dsaRepoUrl = settings.dsaRepoUrl ?? state.settings.dsaRepoUrl;
        return {
          settings: {
            ...state.settings,
            ...settings,
            dsaRepoFullName: settings.dsaRepoFullName ?? repoFullNameFromUrl(dsaRepoUrl),
          },
        };
      }),
      exportSnapshot: () => {
        const state = get();
        return {
          tasks: state.tasks,
          roadmaps: state.roadmaps,
          dsaProblems: state.dsaProblems,
          projects: state.projects,
          notes: state.notes,
          healthLogs: state.healthLogs,
          settings: state.settings,
          xp: state.xp,
          streak: state.streak,
        };
      },
      importSnapshot: (snapshot) => set((state) => ({
        tasks: snapshot.tasks ?? state.tasks,
        roadmaps: snapshot.roadmaps ?? state.roadmaps,
        dsaProblems: snapshot.dsaProblems ?? state.dsaProblems,
        projects: snapshot.projects ?? state.projects,
        notes: (snapshot as Partial<Pick<MoonstackState, "notes">>).notes ?? state.notes,
        healthLogs: (snapshot as Partial<Pick<MoonstackState, "healthLogs">>).healthLogs ?? state.healthLogs,
        settings: snapshot.settings ?? state.settings,
        xp: snapshot.xp ?? state.xp,
        streak: snapshot.streak ?? state.streak,
      })),
    }),
    {
      name: "moonstack-state",
      version: 1,
      partialize: (state) => ({
        tasks: state.tasks,
        roadmaps: state.roadmaps,
        dsaProblems: state.dsaProblems,
        projects: state.projects,
        notes: state.notes,
        healthLogs: state.healthLogs,
        settings: state.settings,
        xp: state.xp,
        streak: state.streak,
      }),
    },
  ),
);
