# ourosmaterials.com

One-page Astro site for Ouros Materials. Static output, no backend.

## Edit

Each section is one file in `src/components/`, in page order:

| File | Section |
|---|---|
| `00-Hero.astro` | Hero video + headline + nav |
| `01-Statement.astro` | "Every era of American progress…" |
| `02-MissingMiddle.astro` | Missing-middle line-art diagram |
| `03-LowTemp.astro` | Kiln + 1,300°C → 250°C counter |
| `04-PowderToPart.astro` | Powder-to-part motion graphic |
| `05-Composites.astro` | Composite composer (Polymer / Metal alloy toggle) |
| `06-Foundry.astro` | FOUNDRY mini line + stages |
| `07-UseCases.astro` | Energy / Defense / Aerospace / Infrastructure |
| `08-HowWeWork.astro` | Commercial model + logo strip |
| `09-Team.astro` | Co-founders + advisors |
| `10-Footer.astro` | Closing line + contact |

Copy is plain HTML inside each file: edit the text directly. Media lives in `public/media/`, fonts in `public/fonts/`. Site-wide behavior (scroll-triggered animation, lazy video, composer toggle, mobile rules) is in `src/layouts/Base.astro` and `src/styles/site.css`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
```

## Deploy (Vercel)

1. Create a GitHub repo (e.g. `ouros-materials/website`, private) and push this folder.
2. In Vercel: **Add New → Project → Import** the repo. Framework preset: **Astro**. No settings to change.
3. Every push to `main` deploys; every branch/PR gets its own preview URL to share for feedback.

## Move the domain off Framer

1. Vercel → Project → **Settings → Domains** → add `ourosmaterials.com` and `www.ourosmaterials.com`.
2. At your DNS provider, change **only the website records** Vercel shows you (usually an `A` record for the apex and a `CNAME` for `www`).
3. **Do not touch MX, TXT/SPF, DKIM or DMARC records.** Those run Google Workspace email.
4. Wait for Vercel to show the domain as valid (minutes to a few hours), check the live site, then cancel Framer.
5. Old Framer URLs `/press` and `/contact` redirect via `vercel.json`.

## Investor deck (`/deck`)

`ourosmaterials.com/deck` shows a gate asking for email + a shared passcode, then serves the deck.
This repo is public, so the deck is committed **encrypted** (`api/_deck-data.js`); the plaintext
lives only in `deck-src/index.html`, which is gitignored. `api/deck.js` decrypts it server-side
after a correct login. Logins set a 30-day cookie; changing the passcode signs everyone out.

**Vercel env vars** (Project → Settings → Environment Variables, Production + Preview, then redeploy):

| Name | Value |
|---|---|
| `DECK_PASSWORD` | the passcode you give investors (use something not guessable) |
| `DECK_KEY` | the base64 key the deck was encrypted with |
| `DECK_WEBHOOK_URL` | optional: Slack incoming webhook (or Zapier) pinged on every login |
| `ATTIO_API_KEY` | optional: on login, finds/creates the person in Attio and adds an "Opened investor deck" note |

Every login and wrong passcode is also written to Vercel's runtime logs (`deck: "login"`).

**Update the deck:** put the new HTML at `deck-src/index.html`, then
`DECK_KEY=... node scripts/encrypt-deck.mjs`, commit `api/_deck-data.js`, push.

**Rotate the key:** generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
re-run the encrypt script with it, update `DECK_KEY` in Vercel, push.

Log out (for testing): `/deck/logout`.

## Before launch

- [ ] **Font license.** Neue Haas Grotesk Display is a commercial font. Confirm a web license (included with Adobe Fonts / Creative Cloud), or swap to Inter Display in `src/styles/global.css`.
- [ ] **Imagery.** All stock-style footage is AI-generated placeholder; only the CNC clip is real. Replace with real or licensed footage.
- [ ] **Team headshots** (`09-Team.astro`) and **cleared logos** (`08-HowWeWork.astro`).
- [ ] **Contact emails** in `10-Footer.astro` (`hello@` and investor contact).
- [ ] **Claim wording:** "3× stronger" comparison, "patented" vs "proprietary", ceramic–metal status.
- [ ] Optional: analytics (Vercel Analytics or Plausible) and a contact form (Formspree).
