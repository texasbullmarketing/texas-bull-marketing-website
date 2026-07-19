# Client site demos

Live demo sites for leads. Served as static folders under `public/demo/`.

## Current demos

| Company | URL | Folder |
|---------|-----|--------|
| 2 Rivers Heating & Air Conditioning | `/demo/TwoRiversHeatingAC/` | `public/demo/TwoRiversHeatingAC/` |
| Enterprise Flooring Solutions | `/demo/EnterpriseFlooringSolutions/` | `public/demo/EnterpriseFlooringSolutions/` |
| HVAC Pros Heating & A/C | `/demo/HVACProsHeatingAC/` | `public/demo/HVACProsHeatingAC/` |
| Iron Roots Services | `/demo/IronRootsServices/` | `public/demo/IronRootsServices/` |
| La Enchiladita | `/demo/LaEnchiladita/` | `public/demo/LaEnchiladita/` |
| Michoacana Premium | `/demo/MichoacanaPremium/` | `public/demo/MichoacanaPremium/` |
| Pape HVAC | `/demo/PapeHVAC/` | `public/demo/PapeHVAC/` |
| Taqueria Atotonilco | `/demo/TaqueriaAtotonilco/` | `public/demo/TaqueriaAtotonilco/` |
| The 1908 Restaurant + Bar | `/demo/The1908RestaurantBar/` | `public/demo/The1908RestaurantBar/` |
| The Blackdoor Steakhouse | `/demo/TheBlackdoorSteakhouse/` | `public/demo/TheBlackdoorSteakhouse/` |
| Wave Finders Electronics | `/demo/WaveFindersElectronics/` | `public/demo/WaveFindersElectronics/` |
| V2TBM (TBM redesign sandbox) | `/demo/v2tbm/` | `public/demo/v2tbm/` |

Hub page: `/demo/` → `public/demo/index.html`

Live:

- https://texasbullmarketing.com/demo/TwoRiversHeatingAC/
- https://texasbullmarketing.com/demo/EnterpriseFlooringSolutions/
- https://texasbullmarketing.com/demo/HVACProsHeatingAC/
- https://texasbullmarketing.com/demo/IronRootsServices/
- https://texasbullmarketing.com/demo/LaEnchiladita/
- https://texasbullmarketing.com/demo/MichoacanaPremium/
- https://texasbullmarketing.com/demo/PapeHVAC/
- https://texasbullmarketing.com/demo/TaqueriaAtotonilco/
- https://texasbullmarketing.com/demo/The1908RestaurantBar/
- https://texasbullmarketing.com/demo/TheBlackdoorSteakhouse/
- https://texasbullmarketing.com/demo/WaveFindersElectronics/
- https://texasbullmarketing.com/demo/

Old short slugs (`/demo/efs/`, `/demo/ench/`, `/demo/wave/`, `/demo/irs/`) redirect to the full-name URLs.

## How to add a new demo later

1. Create a folder with the **full company name as the URL slug** (PascalCase, no spaces/town):
   - Example: `public/demo/MariasTacos/`
2. Put the full site inside that folder. Required:
   - `index.html` at the folder root
   - Any images/css/js next to it (or in subfolders)
3. Use **relative paths** in the HTML:
   - Good: `src="logo.jpg"`, `src="images/hero.jpg"`, `hx-get="partials/nav.html"`
   - Bad: `src="/logo.jpg"` (that looks at the site root, not the demo folder)
4. Add a card on `public/demo/index.html` linking to `/demo/YourCompanyName/`
   - Card title = full company name (not an abbreviation)
   - No town name needed on the card
5. Commit and push — no Next.js code changes needed for a new folder.
   - Clean URLs already work via `next.config.mjs`:
     - `/demo/your-slug` → redirects to `/demo/your-slug/`
     - `/demo/your-slug/` → serves `index.html`

### Quick copy example (Windows)

```text
Desktop\my-new-demo\   →   copy entire folder into
texas-bull-marketing-website\public\demo\CompanyName\
```

Then open locally: `http://localhost:3000/demo/CompanyName/`

### Naming tips for leads

- Folder/slug = full company name in PascalCase: `EnterpriseFlooringSolutions`
- No spaces, no town, no abbreviations in the URL
- One folder = one shareable link
- Hub card shows the full company name

## Notes

- Demos are static HTML inside `public/` (not React pages)
- WaveFindersElectronics uses HTMX partials under `partials/` — keep that folder with the demo
- Trailing slash matters for relative assets; redirects handle bare `/demo/slug`
- **Not indexed by Google:** everything under `/demo/` is blocked automatically via
  `public/robots.txt` + `X-Robots-Tag: noindex, nofollow` headers on `/demo/*`.
  New demos you drop in `public/demo/` inherit this — no extra step per demo.
  Optional: add `<meta name="robots" content="noindex, nofollow" />` in the HTML head
  as a backup (already on existing demos/hub).
