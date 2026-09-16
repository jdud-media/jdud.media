# jdud.media

Static photography & content-creation portfolio for **jdud.media**, built with [Tailwind CSS](https://tailwindcss.com) (v4) and deployed to GitHub Pages via GitHub Actions.

Single-page site with sections: Portfolio, Packages & Pricing, About, and Availability (Calendly inline embed).

## Project structure

```
portfolio/
  .github/workflows/deploy.yml   # build + deploy workflow
  src/input.css                  # Tailwind entry + theme tokens
  dist/output.css                # built CSS (gitignored; produced by build)
  images/                        # compressed site photos (committed & served)
  images/originals/              # full-size sources (gitignored)
  scripts/compress-images.js     # the image compression step
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

## Images

Photos are committed to the repo in already-compressed WebP form. Full-size
originals stay out of git — only what's in `images/` gets deployed.

**The workflow:**

1. Drop your edited exports in **`images/originals/`** (JPG, PNG, WebP, TIFF or
   HEIC). This folder is gitignored, so file size doesn't matter here.
2. Run the compression step:
   ```bash
   npm run compress:images
   ```
   Every source is resized and re-encoded to WebP in **`images/`**, keeping its
   filename (`brownTheatre_hero.jpg` → `brownTheatre_hero.webp`).
3. Reference the result from the **`images/` root** in `index.html`:
   ```html
   <img src="images/brownTheatre_hero.webp" alt="...">
   ```
4. Commit the new files in `images/`. Nothing in `images/originals/` is
   committed, so if the compressed file isn't committed it won't be on the
   live site.

Sources and output live in separate directories on purpose: the script only
reads `images/originals/`, so re-running it never re-compresses its own output.
(Compressing an already-compressed file costs quality for almost no size
saving.) Keep your originals backed up elsewhere — a fresh clone won't have
them.

### Naming controls the compression settings

The script picks its settings from substrings in the filename
(case-insensitive). No suffix is needed for ordinary gallery shots:

| Filename contains | Width  | Quality | Use for |
| ----------------- | ------ | ------- | ------- |
| *(nothing)*       | 800px  | 87      | Gallery / portfolio thumbnails |
| `_about`          | 900px  | 87      | The About section portrait |
| `_hero`           | 1920px | 83      | Full-width hero images |
| `_hq`             | ≥1600px | 92     | Add-on — see below |

`_hq` is an **override you combine with the others** (`brick_hq.jpg`,
`theatre_hero_hq.jpg`). Fine textures — brick, fur, fabric, foliage — tend to go
mushy, and most of that loss comes from *downscaling* rather than the encoder.
So `_hq` raises the floor on both: width to at least 1600px, quality to 92, plus
a light sharpen to restore crispness lost on resize. Reach for it when a photo
looks soft after a normal pass; it produces noticeably bigger files, so it isn't
the default.

Images are never upscaled — a source narrower than the target keeps its own
width. Output is logged with the size change, and a line marked `!` instead of
`✓` means the WebP came out *larger* than its source (usually an already-
optimized file, or a small image pushed through `_hq`). That's a hint to
re-export from the original rather than a failure.

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
- **Photos** — see [Images](#images) above; drop originals in
  `images/originals/`, run `npm run compress:images`, reference `images/*.webp`.
- **Calendly** — set the real booking link in `index.html` by replacing the
  `data-url` on the `.calendly-inline-widget` element.
- **Pricing / copy** — edit the relevant sections directly in `index.html`.
