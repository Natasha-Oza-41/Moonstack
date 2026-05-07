import { NextResponse } from "next/server";

type CommitBody = {
  repo: string;
  branch?: string;
  path: string;
  content: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing GITHUB_TOKEN in .env.local or Vercel environment variables." }, { status: 400 });
    }

    const { repo, branch = "main", path, content, message } = await request.json() as CommitBody;
    if (!repo || !path || !content || !message) {
      return NextResponse.json({ ok: false, error: "repo, path, content, and message are required." }, { status: 400 });
    }

    const fileApi = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path).replaceAll("%2F", "/")}`;
    const current = await fetch(`${fileApi}?ref=${branch}`, { headers: githubHeaders(token), cache: "no-store" });
    const existing = current.ok ? await current.json() : null;

    const save = await fetch(fileApi, {
      method: "PUT",
      headers: githubHeaders(token),
      body: JSON.stringify({
        message,
        content: Buffer.from(content, "utf8").toString("base64"),
        branch,
        sha: existing?.sha,
      }),
    });

    const result = await save.json();
    if (!save.ok) {
      return NextResponse.json({ ok: false, error: result?.message || "GitHub commit failed." }, { status: save.status });
    }

    return NextResponse.json({ ok: true, commitUrl: result.commit?.html_url, contentUrl: result.content?.html_url });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "GitHub commit failed." }, { status: 500 });
  }
}

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}
