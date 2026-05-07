import { notFound } from "next/navigation";
import { MoonstackRouteApp } from "@/features/shell/moonstack-route-app";
import { viewIds } from "@/lib/routes";
import type { ViewId } from "@/lib/types";

type ViewPageProps = {
  params: Promise<{ view: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return viewIds.map((view) => ({ view }));
}

export default async function ViewPage({ params, searchParams }: ViewPageProps) {
  const { view } = await params;
  const resolvedSearchParams = await searchParams;

  if (!viewIds.includes(view as ViewId)) {
    notFound();
  }

  return <MoonstackRouteApp view={view as ViewId} searchParams={resolvedSearchParams} />;
}
