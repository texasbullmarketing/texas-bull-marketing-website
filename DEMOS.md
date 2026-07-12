# Client site demos

Live demo sites for leads. Served as static folders under `public/demo/`.

## Current demos

| Slug | URL | Folder |
|------|-----|--------|
| efs | `/demo/efs/` | `public/demo/efs/` |
| ench | `/demo/ench/` | `public/demo/ench/` |
| wave | `/demo/wave/` | `public/demo/wave/` |

Hub page: `/demo/` → `public/demo/index.html`

After the domain is live:

- https://texasbullmarketing.com/demo/efs/
- https://texasbullmarketing.com/demo/ench/
- https://texasbullmarketing.com/demo/wave/
- https://texasbullmarketing.com/demo/

## How to add a new demo later

1. Create a folder with a **short URL slug** (lowercase, no spaces):
   - Example: `public/demo/joes-pizza/`
2. Put the full site inside that folder. Required:
   - `index.html` at the folder root
   - Any images/css/js next to it (or in subfolders)
3. Use **relative paths** in the HTML (already how efs/ench/wave work):
   - Good: `src="logo.jpg"`, `src="images/hero.jpg"`, `hx-get="partials/nav.html"`
   - Bad: `src="/logo.jpg"` (that looks at the site root, not the demo folder)
4. Optionally add a card on `public/demo/index.html` linking to `/demo/your-slug/`
5. Commit and push — no Next.js code changes needed.
   - Clean URLs already work via `next.config.mjs`:
     - `/demo/your-slug` → redirects to `/demo/your-slug/`
     - `/demo/your-slug/` → serves `index.html`

### Quick copy example (Windows)

```text
Desktop\my-new-demo\   →   copy entire folder into
texas-bull-marketing-website\public\demo\my-new-demo\
```

Then open locally: `http://localhost:3000/demo/my-new-demo/`

### Naming tips for leads

- Keep slugs short: `efs`, `ench`, `wave`, `marias-tacos`
- One folder = one shareable link
- Do not put spaces or uppercase letters in the folder name

## Notes

- Demos are static HTML inside `public/` (not React pages)
- Wave uses HTMX partials under `partials/` — keep that folder with the demo
- Trailing slash matters for relative assets; redirects handle bare `/demo/slug`
