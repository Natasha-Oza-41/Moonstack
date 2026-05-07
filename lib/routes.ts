import type { ViewId } from "@/lib/types";

export const viewRoutes: Record<ViewId, string> = {
  dashboard: "/dashboard",
  planner: "/planner",
  calendar: "/calendar",
  roadmaps: "/roadmaps",
  projects: "/projects",
  dsa: "/dsa",
  notes: "/notes",
  health: "/health",
  analytics: "/analytics",
  settings: "/settings",
};

export const routeViews = Object.fromEntries(
  Object.entries(viewRoutes).map(([view, route]) => [route, view]),
) as Record<string, ViewId>;

export const viewIds = Object.keys(viewRoutes) as ViewId[];

export function viewFromPathname(pathname: string): ViewId {
  const cleanPath = pathname.replace(/\/$/, "") || "/dashboard";
  return routeViews[cleanPath] || "dashboard";
}
