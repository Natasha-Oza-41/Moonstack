# Deployment

## Vercel Deployment

1. Push the project to GitHub.
2. Open Vercel.
3. Import the GitHub repository.
4. Framework preset: Next.js.
5. Build command:

```bash
npm run build
```

6. Add environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GITHUB_TOKEN=...
```

Only `NEXT_PUBLIC_*` variables are exposed to the browser. `GITHUB_TOKEN` must stay server-side in Vercel environment variables or `.env.local`.

7. Deploy.

## Netlify Deployment

Build command:

```bash
npm run build
```

For a standard Next.js app on Netlify, use the Netlify Next.js runtime. Vercel is the recommended deployment target.

## Local Development

```bash
npm install
npm run dev
```

## Supabase Setup

Run:

```sql
supabase_moonstack_upgrade.sql
```

The current app persists the client state to `public.moonstack_state`. If Settings shows a table error or the REST endpoint returns 404, run `supabase_moonstack_upgrade.sql` in the Supabase SQL editor for the connected project, then refresh the app.

Deploy the GitHub function:

```bash
npx supabase functions deploy github-commit
```

Set the GitHub secret:

```bash
npx supabase secrets set GITHUB_TOKEN=github_pat_xxx
```

## Free-Tier Notes

- Vercel free plan is enough for the frontend.
- Supabase free plan is enough for early usage.
- Keep GitHub commits in server routes or Edge Functions.
- Avoid storing large files in Postgres.
