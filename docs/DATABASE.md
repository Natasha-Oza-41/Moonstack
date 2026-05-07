# Database

## Current Tables

```mermaid
erDiagram
  profiles ||--o{ tasks : owns
  profiles ||--o{ projects : owns
  profiles ||--o{ notes : owns
  profiles ||--o{ dsa_problems : owns
  profiles ||--o{ roadmap_progress : owns
  profiles ||--o{ roadmap_sources : owns
  profiles ||--o{ health_logs : owns
```

## Tables

- `profiles`: user profile, links, targets.
- `tasks`: daily planner and calendar tasks.
- `projects`: builder/project documentation.
- `notes`: second brain notes.
- `dsa_problems`: DSA practice and solution notes.
- `roadmap_progress`: built-in roadmap checkbox state.
- `roadmap_sources`: generated/imported roadmap plans.
- `health_logs`: mood, sleep, water, activities.

## Important Migration

Run:

```sql
supabase_moonstack_upgrade.sql
```

This adds project fields, DSA solution fields, health logs, and roadmap persistence.

## Future Normalized Schema

Roadmaps should become:

```mermaid
flowchart TD
  A[roadmaps] --> B[roadmap_phases]
  B --> C[roadmap_modules]
  C --> D[roadmap_tasks]
  D --> E[resources]
  D --> F[notes]
  D --> G[planner_sessions]
```

DSA should become:

```mermaid
flowchart TD
  A[dsa_sheets] --> B[dsa_topics]
  B --> C[dsa_subtopics]
  C --> D[dsa_problems]
  D --> E[dsa_solutions]
  D --> F[dsa_revisions]
```

