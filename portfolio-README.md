# Portfolio site

Source for https://fizzwizzledazzle.github.io - a pixel/retro developer
portfolio built with TypeScript and Vite. Dark CRT theme, no runtime
dependencies, projects loaded from a JSON file.

## Develop

```bash
npm install
npm run dev      # vite dev server on http://localhost:3000
npm run build    # type-check + bundle to dist/
npm run preview  # serve the production build
```

Deployment is automated: pushing to `main` builds the site and publishes
`dist/` to GitHub Pages (see `.github/workflows/deploy.yml`).

## Editing projects

Projects live in `public/projects.json`. Each entry:

```json
{
  "name": "Lumen",
  "kind": "framework",
  "tagline": "One-line summary shown on the card.",
  "description": "Longer description (not currently rendered).",
  "stack": ["Rust", "wgpu"],
  "links": { "site": "https://...", "repo": "https://..." }
}
```

`kind` sets the accent color and can be `framework`, `platform`, `library`,
or `engine`. Set `site` or `repo` to `null` to hide that link.

## Files

```
index.html              markup and intro window
styles.css              pixel/CRT theme
src/script.ts           renders project cards, typewriter intro
public/projects.json    project data (served at /projects.json)
```

## Customize

- Colors and fonts: CSS variables in `:root` (`styles.css`).
- Intro text and links: the `.hero` block in `index.html`.
- Card layout and typewriter role: `src/script.ts`.
