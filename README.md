# jdud.media

Static photography & content-creation portfolio for **jdud.media**, built with [Tailwind CSS](https://tailwindcss.com) (v4) and deployed to GitHub Pages via GitHub Actions.

Single-page site with sections: Portfolio, Packages & Pricing, About, and Availability (Calendly inline embed).

## Project structure

```
portfolio/
  .github/workflows/deploy.yml   # build + deploy workflow
  src/input.css                  # Tailwind entry + theme tokens
  dist/output.css                # built CSS (gitignored; produced by build)
  images/                        # site photos (optional)
  index.html                     # the site
  package.json                   # deps + scripts
  CNAME                          # custom domain (jdud.media)
```

## Local development

Requires [Node.js](https://nodejs.org) 20+.

```bash
npm install          # install dependencies (first time only)
npm run watch:css    # rebuild dist/output.css on every change
```

Then open `index.html` in a browser, or serve the folder:

To build the CSS once (minified):

```bash
npm run build:css
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs deps,
builds the CSS, assembles the static site (including `CNAME`), and deploys to
GitHub Pages. Deploys are atomic — the live site stays up during a build, and a
failed build is not published.

**One-time setup:** In the repo, go to **Settings → Pages → Source** and select
**"GitHub Actions"**.

> `package-lock.json` must be committed so the workflow's `npm ci` step works.

## Customizing

- **Brand colors / fonts** — edit the `@theme` block in `src/input.css`.
- **Photos** — replace the `picsum.photos` placeholders in `index.html`; drop
  real images in `images/` (the workflow copies that folder automatically).
- **Calendly** — set the real booking link in `index.html` by replacing the
  `data-url` on the `.calendly-inline-widget` element.
- **Pricing / copy** — edit the relevant sections directly in `index.html`.
