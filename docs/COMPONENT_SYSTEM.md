# Component System

## Current Components

Current reusable components include:

- `GlassCard`
- `Badge`
- `ProgressBar`
- `Input`
- `TextArea`
- `Toast`
- `Spinner`
- `MoonstackLogo`

## Problems

- Components are defined inside `App.jsx`.
- Variants are hardcoded.
- No design tokens.
- No typed props.
- No shared layout primitives.

## Target Component Library

```text
components/
  app-shell/
  cards/
  charts/
  command/
  forms/
  navigation/
  overlays/
  typography/
```

## Design Principles

- Dense but readable.
- Avoid nested cards.
- Use depth sparingly.
- Navigation should feel fast and alive.
- Controls should be obvious and keyboard-friendly.
- Every page should have one clear primary action.

