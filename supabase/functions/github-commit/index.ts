// Supabase Edge Function: github-commit
// Deploy with: supabase functions deploy github-commit
// Secret: supabase secrets set GITHUB_TOKEN=github_pat_xxx

type CommitBody = {
  repo: string;
  branch?: string;
  path: string;
  content: string;
  message: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  try {
    const token = Deno.env.get("GITHUB_TOKEN");
    if (!token) throw new Error("Missing GITHUB_TOKEN secret");

    const { repo, branch = "main", path, content, message } = await req.json() as CommitBody;
    if (!repo || !path || !content || !message) throw new Error("repo, path, content, and message are required");

    const api = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path).replaceAll("%2F", "/")}`;
    const current = await fetch(`${api}?ref=${branch}`, {
      headers: githubHeaders(token),
    });
    const existing = current.ok ? await current.json() : null;

    const save = await fetch(api, {
      method: "PUT",
      headers: githubHeaders(token),
      body: JSON.stringify({
        message,
        content: toBase64(content),
        branch,
        sha: existing?.sha,
      }),
    });

    const result = await save.json();
    if (!save.ok) throw new Error(result?.message || "GitHub commit failed");

    return json({ ok: true, commit: result.commit?.html_url });
  } catch (error) {
    return json({ ok: false, error: String(error?.message || error) }, 400);
  }
});

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}
