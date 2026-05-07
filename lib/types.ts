export type ViewId =
  | "dashboard"
  | "planner"
  | "calendar"
  | "roadmaps"
  | "projects"
  | "dsa"
  | "notes"
  | "health"
  | "analytics"
  | "settings";

export type Task = {
  id: string;
  title: string;
  tag: string;
  priority: "low" | "medium" | "high";
  date: string;
  done: boolean;
  source?: string;
};

export type AppSettings = {
  displayName?: string;
  linkedinUrl?: string;
  gmail?: string;
  githubProfile: string;
  dsaRepoUrl: string;
  dsaRepoFullName: string;
  dsaBranch: string;
  openAiModel?: string;
};

export type RoadmapTask = {
  id: string;
  title: string;
  type: "study" | "project" | "dsa" | "revision" | "github";
  done: boolean;
  resources: string[];
  notes?: string;
};

export type RoadmapModule = {
  id: string;
  title: string;
  tasks: RoadmapTask[];
};

export type RoadmapPhase = {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  modules: RoadmapModule[];
  resources?: string[];
};

export type Roadmap = {
  id: string;
  title: string;
  source: string;
  mode: "timeline" | "graph" | "kanban";
  phases: RoadmapPhase[];
};

export type DsaProblem = {
  id: string;
  topic: string;
  subtopic: string;
  name: string;
  url: string;
  platform: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "unsolved" | "solved" | "review";
  confidence: number;
  revisionCount: number;
  nextRevision: string;
  approach: string;
  complexity: string;
  mistakes: string;
  commitUrl?: string;
  commitStatus?: "idle" | "committing" | "committed" | "error";
  commitError?: string;
  favorite?: boolean;
  solutionCode?: string;
  repoOverride?: string;
};

export type Project = {
  id: string;
  name: string;
  status: "Planning" | "Building" | "Testing" | "Shipped";
  progress: number;
  stack: string[];
  repo: string;
  deploy: string;
  architecture: string;
  nextMilestone: string;
  readme?: string;
  notes?: string;
};

export type Note = {
  id: string;
  folder: string;
  title: string;
  content: string;
  tags: string[];
  pinned?: boolean;
  updatedAt: string;
};

export type HealthLog = {
  id: string;
  date: string;
  mood: string;
  sleepHours: number;
  waterGlasses: number;
  activities: string;
  notes: string;
};
