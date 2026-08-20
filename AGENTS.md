# Repository Guidelines

## Project Structure & Module Organization

This is the Vue 3/Vite frontend for Perjadin. Application entry files are in `resources/js/`; feature pages and routes belong under `resources/js/contexts/perjadin/`. Shared layouts, components, composables, and menu data are in `resources/js/shared/`. API access is centralized in `resources/js/services/perjadinApi.js`; pages must not call `fetch` directly.

Styles and design tokens are in `resources/css/app.css` and `tailwind.config.js`. The visual foundation was migrated from `sikkepo-v4-ui`; keep it generic and use Perjadin-specific wording, navigation, and data only. Environment examples belong in `.env.example`.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies.
- `npm run dev` starts Vite at `http://localhost:5175`.
- `npm run build` produces the production bundle in `dist/`.
- `node tools/contrast-check.mjs` verifies documented color-token contrast pairs.

Run `npm run build` before submitting changes. There is no automated UI test runner yet; manually check the affected desktop and mobile routes, loading/error/empty states, and browser console.

## Coding Style & Naming Conventions

Use four-space indentation, Vue 3 `<script setup>`, Composition API, ES modules, and single quotes in JavaScript. Name components in PascalCase (`SptDetail.vue`), composables with `use` (`useAuth.js`), and context directories in lowercase. Keep identifiers in English; use Bahasa Indonesia for UI text.

Use Tailwind token classes rather than new hex literals in templates. Inputs require visible labels; icon-only controls require `aria-label`; interactive controls must remain at least `min-h-10`.

## API, Commits, and Pull Requests

The UI consumes only the Perjadin API through `VITE_PERJADIN_API_URL`; it never calls SIKKEPO directly or stores employee master data. Preserve Sanctum token handling and API error messages. Do not commit credentials or generated `dist/`.

Use short, imperative Indonesian commit subjects. PRs should state affected routes, backend contract dependencies, validation performed, and include screenshots or recordings for visual changes.
