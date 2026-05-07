# API Documentation

## Supabase Client Calls

The frontend currently calls Supabase directly for:

- auth
- profiles
- tasks
- projects
- notes
- dsa problems
- health logs
- roadmap progress
- roadmap sources

## Edge Functions

### `github-commit`

Path:

```text
supabase/functions/github-commit/index.ts
```

Purpose:

- commits generated markdown to GitHub using a private `GITHUB_TOKEN`
- used by project README commits
- used by DSA solution commits

Request:

```json
{
  "repo": "username/repo",
  "branch": "main",
  "path": "dsa/arrays/two-sum.md",
  "content": "# Two Sum...",
  "message": "dsa: add two sum solution"
}
```

Response:

```json
{
  "ok": true,
  "commit": "https://github.com/..."
}
```

## Future API Layer

Move direct database logic behind:

- `/api/roadmaps`
- `/api/tasks`
- `/api/dsa`
- `/api/projects`
- `/api/github/commit`
- `/api/ai/roadmap`

