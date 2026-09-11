---
name: astra-ui-ux
description: Art-directed, production-grade UI/UX design and frontend build. Use for ANY task that creates, redesigns, reviews, or polishes an interface: landing pages, portfolios, web apps, dashboards, mobile screens, components, design systems, HTML decks, or requests like "make it look better", "make it pop", "redesign this", "audit this UX", "check accessibility". Use it even when the user only asks for "a page" or "a site" without saying "design". Goal: gallery-grade one-shot output that looks art-directed by a top studio, never template-generated.
---

# Astra UI/UX: Art Direction Edition

## Contents
1. Prime Directive
2. One-Shot Protocol
3. Design Intent
4. Expression Dials
5. Signature Moment
6. Art Directions (12 recipes)
7. Typography
8. Color
9. Composition
10. Build Rules
11. Motion
12. Craft Details
13. Anti-Slop Bans
14. UX Writing
15. Preflight Checklist
16. Output Contract
17. DESIGN.md Template
18. Sources & Attribution

---

## 1. Prime Directive
Every interface must pass two tests at once:
1. GALLERY TEST: a senior designer would screenshot it for inspiration.
2. PRODUCT TEST: a real user completes the primary task without thinking.

Beauty that breaks usability fails. Usability with no point of view also fails.

---

## 2. One-Shot Protocol (run silently, every time)
The user sees ONE output. All iteration happens before it.

1. Read the brief → write the Design Intent block (Section 3).
2. Generate 3 genuinely different concepts internally, each from a different direction in Section 6. Score each against the brief. Pick the one that is most RIGHT, not the safest.
3. Lock the system: type (Section 7), color (Section 8), spacing and shape (Section 10).
4. Build (Sections 9–12).
5. Render if any render tool exists (screenshot at 375px and 1440px, plus dark mode if supported). Judge the screenshot, not the code. If no render tool exists, do a written mental render top to bottom at 375px describing what a user actually sees.
6. Run the Preflight Checklist (Section 15). Fix every failure.
7. Output.

Never ship the first idea. The first idea is the average of the training data.

---

## 3. Design Intent (always write it before code)
- Product + audience
- Register: BRAND (expressive) / PRODUCT (calm, fast) / HYBRID (brand shell, product core)
- Primary action: the one thing this screen must get done
- Concept: one sentence the whole design expresses ("a field journal", "mission control for your money", "a record store at 2am")
- Direction: one named direction from Section 6 + 2 deliberate twists
- Signature moment: the ONE thing people remember (Section 5)
- Dials: VARIANCE / MOTION / DENSITY / DRAMA (1–10 each, Section 4)

Rules
- If DESIGN.md exists in the project, it is law. Read it first. Extend it, never reinvent it.
- If the work spans more than one screen and no DESIGN.md exists, create one from Section 17 before building, so every later screen stays on-system.
- A thin brief is not permission to go generic. Infer from product type and audience. A daycare site, a trading terminal, and a horror game menu must look nothing alike.

---

## 4. Expression Dials
- VARIANCE: 1 strict symmetric grid → 10 broken grid, overlaps, asymmetry
- MOTION: 1 state feedback only → 10 choreographed scroll narrative
- DENSITY: 1 gallery whitespace → 10 cockpit
- DRAMA: 1 quiet → 10 theatrical scale and color contrast

Defaults
- BRAND: 7 / 6 / 3 / 7
- PRODUCT: 3 / 3 / 6 / 3
- HYBRID: brand dials above the fold, product dials below

---

## 5. Signature Moment (required for BRAND and HYBRID)
Pick exactly ONE. Execute it flawlessly. Keep everything around it quieter so it can breathe.
- Kinetic headline: split-text reveal or variable-font weight/width sweep
- Hero object: SVG/CSS/WebGL piece that responds to cursor or scroll
- Scroll-pinned narrative: the product assembles or transforms as you scroll
- Typographic composition: type IS the image
- Bespoke data visualization as the hero
- Interactive toy: drag, draw, or tune a parameter that demonstrates the product's value
- Texture world: grain, paper, halftone, film light, or CRT glow that sets the entire mood
- Unexpected navigation: index-style, horizontal chapters, radial

One moment done perfectly beats five effects done competently.

---

## 6. Art Directions (12 recipes)
Each recipe is a starting point. Always add 2 twists so the output isn't a stereotype of the style. Font suggestions are free (Google Fonts / Fontshare).

### 6.1 Editorial Magazine
- Use: media, journals, portfolios, premium content, nonprofits with stories
- Type: high-contrast serif display (Fraunces, Instrument Serif, Newsreader) + clean grotesk text
- Color: paper off-white, ink near-black, ONE spot color (vermilion, cobalt, or forest)
- Layout: multi-column grid, drop caps, pull quotes, captions, asymmetric image crops
- Motion: restrained; soft fades, text-mask reveals on headlines
- Details: rules/hairlines, issue-number styling, folio page numbers
- Avoid: centered hero, rounded cards

### 6.2 Swiss International
- Use: agencies, architecture, confident B2B, events
- Type: neo-grotesk (Switzer, Satoshi, Hanken Grotesk), huge numerals
- Color: white/black + signal red or one primary
- Layout: strict modular grid, flush-left ragged-right, extreme scale contrast, lots of air
- Motion: precise, short, no bounce
- Details: visible grid logic, numbered sections, tight negative tracking on display

### 6.3 Neo-Brutalist
- Use: creative tools, indie products, music, youth brands
- Type: chunky grotesk (Archivo Black, Familjen Grotesk) + mono (Space Mono, JetBrains Mono)
- Color: raw saturated fields (acid yellow, electric blue) on off-white
- Layout: thick 2–3px borders, hard offset shadows, exposed structure, stickers
- Motion: snappy, instant state changes, no blur
- Avoid for: healthcare, finance, anything trust-first

### 6.4 Dark Cinematic Luxury
- Use: fashion, hospitality, premium products, film, automotive
- Type: thin elegant serif (Cormorant, Gambetta) or wide sans (Clash Display)
- Color: warm near-black, cream, one metallic accent (champagne/gold)
- Layout: huge imagery, deep negative space, slow vertical rhythm
- Motion: slow reveals (600–900ms), mask wipes, subtle film grain
- Details: letter-spaced small-caps labels, hairline dividers

### 6.5 Technical / Terminal
- Use: devtools, security, trading, data platforms, AI infra
- Type: mono (JetBrains Mono, IBM Plex Mono) + precise grotesk
- Color: graphite/charcoal, phosphor green OR amber accent; semantic colors earn their place
- Layout: dense panels, command palette, keyboard hints, status bars
- Motion: minimal; cursor blink and typed text used once, never everywhere
- Details: tabular numerals, ASCII accents, live-looking data

### 6.6 Organic / Natural
- Use: wellness, food, sustainability, outdoor, craft
- Type: humanist serif (Fraunces soft axis, Erode) + soft sans (Manrope)
- Color: earth tones (sage, clay, oat, moss), low saturation
- Layout: flowing curves, hand-drawn SVG lines, overlapping organic crops
- Motion: gentle springs, slow drift
- Details: paper texture, botanical line art, rounded-but-not-bubbly shapes

### 6.7 Retro-Futurism / Chrome
- Use: music, gaming, events, streetwear, launches
- Type: wide/expanded display (Unbounded, Syne) + mono
- Color: deep space black, chrome gradients, holographic accents, one neon
- Layout: bold centered-then-broken compositions, big type lockups
- Motion: energetic, scroll-scrubbed, reflective highlights sweeping across chrome
- Details: star fields, pixel accents, lens flares used ONCE

### 6.8 Playful Toy
- Use: kids, casual consumer, onboarding, games
- Type: rounded geometric (Fredoka, Baloo 2)
- Color: saturated pastels + one deep anchor color for text contrast
- Layout: chunky shapes, sticker-like cards, big friendly buttons
- Motion: springy with bounce (allowed HERE only), squash on press
- Details: mascots built from simple shapes, confetti on real wins only

### 6.9 Kinetic Typographic
- Use: agencies, portfolios, launches, manifestos
- Type: variable font with weight/width axes (Big Shoulders Display, Archivo)
- Color: monochrome + one accent
- Layout: type fills the viewport, words as layout blocks, marquee lines
- Motion: scroll-linked axis animation, split-letter reveals, velocity-reactive marquees
- Rule: type is the hero; imagery is secondary or absent

### 6.10 Calm Product Minimal
- Use: SaaS product surfaces, productivity apps, dashboards
- Type: neutral precise grotesk (Hanken Grotesk, Satoshi), tabular numerals
- Color: cool tinted grays, ONE vivid accent, semantic colors muted until needed
- Layout: tight grid, clear hierarchy, sidebars that recede
- Motion: 120–200ms micro-interactions, no decorative motion
- Details: layered soft shadows, 1px hairlines at 8–12% opacity, keyboard-first

### 6.11 Japanese Minimal (Ma)
- Use: craft brands, tea/food, architecture, meditative products
- Type: refined mincho feel (Shippori Mincho) + clean gothic (Zen Kaku Gothic)
- Color: muted naturals + vermilion accent
- Layout: extreme negative space, vertical text accents, asymmetric balance
- Motion: very slow, very few
- Details: thin lines, seal/stamp motifs, paper grain

### 6.12 Analog Signal / VHS
- Use: horror, music, gaming, nostalgia, streaming channels
- Type: mono or pixel (VT323, Space Mono) + condensed sans headlines
- Color: CRT black, washed phosphor, chroma-shifted red/cyan
- Layout: broadcast overlays, timestamps, channel numbers, tracking bars
- Motion: glitch bursts on interaction only, scanline drift, signal-loss transitions
- Details: SVG noise, chromatic aberration on hover, "REC" indicators
- Rule: real content must stay legible through the effect; prefers-reduced-motion turns effects off

---

## 7. Typography
Pairing logic: contrast in STRUCTURE (serif + grotesk, or one family with extreme weight range). Never two similar sans-serifs.

Scale
- Product: ~1.2 ratio
- Brand: 1.333–1.5 ratio
- Hero display: 5–10× body size on brand pages

Display craft
- Negative tracking at large sizes: −0.02em to −0.04em
- ALL-CAPS labels: small size, +0.06em to +0.12em tracking
- text-wrap: balance on headings; text-wrap: pretty on paragraphs
- Display line-height 0.9–1.1; body 1.45–1.6
- Hanging punctuation on large quotes; optical sizing where the font supports it

Body
- ≥16px (17–18px for reading-heavy pages)
- Measure 45–75ch; cap text containers with max-width in ch
- Tabular numerals (font-variant-numeric: tabular-nums) for data, prices, tables, timers

Loading
- Max 2 families, ≤4 weights total
- font-display: swap with size-adjusted fallbacks to prevent layout shift

---

## 8. Color
- Build every ramp in OKLCH so lightness steps look perceptually even.
- Structure: one neutral ramp (9–11 steps) + one dominant + ONE sharp accent + semantic colors (success/warning/danger/info).
- Proportion: 60 dominant / 30 secondary / 10 accent. Brave brand pages can commit the dominant to a full color field instead of white.
- Tint neutrals 1–3% toward the brand hue so grays feel related.
- Hierarchy comes from size, weight, and space first. Color carries meaning.
- Gradients need a logic (a light source, a material). Add 3–6% grain over large gradients to kill banding and add richness.
- Dark mode is its own palette: raise surfaces with lightness steps, not shadows; desaturate accents ~10%; never pure #000 behind body text.
- Contrast (WCAG 2.2 AA): 4.5:1 body text, 3:1 large text and UI boundaries. Check every text/background pair, including text on images (use scrims). Verify numerically; never eyeball.

---

## 9. Composition
- Establish the grid (12-col desktop / 4-col mobile), then break it deliberately 1–2 times per page. Breaking it everywhere means there is no grid.
- Scale contrast creates drama: one element dramatically larger than everything near it.
- Asymmetry with balance: offset the heavy element; counterweight with space or a small dense cluster.
- Layering: type over image, elements crossing section boundaries, overlapping depth planes.
- Negative space is an element. Give the signature moment room.
- Rhythm: vary section heights and densities (airy → dense → full-bleed → airy). Identical sections read as a template.
- One focal point per section. If you squint and see two, demote one.
- At least one full-bleed moment on brand pages.
- Mobile gets its own composition, not a stacked desktop.

---

## 10. Build Rules
Structure
- Semantic HTML: landmarks (header/nav/main/footer), one h1, no skipped heading levels, <button> for actions, <a> for navigation.
- Mobile-first. Check 375 / 768 / 1280 / 1440+. No horizontal scroll at 320px.
- Real, plausible content: realistic names, numbers, and copy lengths. Lorem ipsum hides layout bugs and kills mood.

Space & shape
- 4px base, 8px rhythm. Spacing tokens only; no magic numbers.
- Related items sit closer than unrelated ones; let proximity do the work borders usually do.
- ONE radius system per product. Nested radius = outer radius − padding.
- 2–3 elevation levels built from soft layered shadows, not hard borders.

Every interactive component ships ALL relevant states:
default · hover · focus-visible · active · disabled · loading · empty · error · success
Missing states are the #1 difference between a demo and a product.

Interaction
- Touch targets ≥44×44px. One primary action per view; secondary actions look secondary.
- Destructive actions get confirmation or undo.
- Optimistic UI when success is likely, with visible rollback on failure.
- Skeletons for known layouts, spinners only for short unknown waits, never a blank screen.
- Forms: visible labels (placeholders are not labels), validate on blur, errors state what happened + how to fix, input preserved on error.

Imagery (never gray boxes)
- Fill image slots with art: generative SVG patterns, CSS gradient meshes with grain, duotone treatments, typographic compositions, or illustrated shapes built for the concept.
- If a real photo is truly needed, mark it:
  <!-- ASSET NEEDED: 1600x900, subject + lighting + mood -->
- Icons: one set, one stroke weight, optically aligned to text. No emoji as UI icons.
- Texture: subtle grain (SVG feTurbulence at 3–6% opacity) on large flat brand surfaces.

Libraries by job (pin versions; verify the API exists in that version before using it)
- Scroll choreography: GSAP + ScrollTrigger
- React UI transitions: Motion
- Smooth scroll: Lenis, only when MOTION ≥7
- 3D hero: Three.js / React Three Fiber
- Nothing else unless it earns its bytes. Don't import a library for what a few lines of CSS can do.
- If a library fails to load, the page must still render something useful.

Performance is part of the art: LCP under 2.5s, zero layout shift, 60fps animation.

---

## 11. Motion
### Should it animate at all?
Animate only to: show a state change, explain a spatial relationship, or mark a moment that matters.
Frequency rule: the more often an interaction happens, the less it animates. Keyboard-triggered actions and command palettes: instant or ≤100ms.

### Pick the lens by context
- RESTRAINT (productivity, dashboards, tools): fast, minimal, invisible
- POLISH (consumer apps, SaaS marketing): subtle, refined, noticed only when missing
- PLAY (kids, portfolios, games, launches): expressive, surprising, still purposeful

### Easing
- Enter: ease-out. Exit: ease-in at ~70% of the enter duration. On-screen movement: ease-in-out.
- Never the CSS default "ease" for UI. Linear only for continuous loops and scroll-scrub.
- Strong ease-out: cubic-bezier(0.22, 1, 0.36, 1)
- Expo-style out for dramatic brand reveals: cubic-bezier(0.16, 1, 0.3, 1)
- Springs for gesture-driven UI (drag, sheets, swipes). No bounce in product UI; small bounce allowed in PLAY.

### Durations
- Micro feedback (press, toggle): 100–160ms
- Small UI (dropdown, tooltip): 160–220ms
- Modal / sheet enter: 240–320ms
- Brand scroll reveals: 500–900ms
- Stagger: 30–60ms per item, total stagger ≤400ms

### Craft rules
- Never scale from 0. Start at 0.92–0.97 with opacity 0.
- Transform-origin at the trigger: a dropdown grows from its button.
- Interruptible: toggles must retarget mid-animation, never queue.
- Reveal once, not every time the element re-enters the viewport.
- Reveal groups, not individual paragraphs. No fade-up on every element.
- Pin sparingly (max 1–2 pinned sections per page). Scrub only for real storytelling.
- Animate transform and opacity only. Avoid animating blur, box-shadow, or width/height on large areas.
- Clean up: kill ScrollTriggers / revert GSAP contexts on unmount (useGSAP or gsap.context).
- Active press: scale(0.97) for physical feel.
- Hover effects only on hover-capable devices: @media (hover: hover).

### Accessibility
prefers-reduced-motion: replace movement with opacity or instant change. Disable parallax, marquees, autoplay, and glitch effects. Never convey information through motion alone.

---

## 12. Craft Details (what separates art from output)
- Optical alignment: icons, play triangles, and quote marks nudged to LOOK centered
- Hairlines at 8–12% opacity instead of solid gray borders
- Layered shadows: 2–3 soft stacked shadows beat one hard shadow
- Designed focus rings that match the brand (visible, ≥3:1 contrast)
- ::selection colored to the palette
- Kerning checked on display type
- Footer, 404, and empty states designed with the same care as the hero

---

## 13. Anti-Slop Bans (unless the brief explicitly demands it)
Visual
- Purple-to-blue "tech" gradients · abstract blob backgrounds · floating glass 3D shapes
- The default font of the moment as display face (Inter, Roboto, Poppins, Montserrat, system-ui)
- Cards nested in cards · gray text on colored backgrounds · colored left-border accent cards
- Rounded icon tile above every heading · three identical feature cards as the page's middle
- Glow + glass + blur stacked on every surface · decorative grid/dot backgrounds on empty space
- Rainbow of accent colors · emoji bullets · "AI sparkle" iconography
- Floating device mockups at angles that don't show the real product

Layout & motion
- Everything centered · every section the same height and rhythm
- Fade-up on every element · parallax that fights the scroll · bounce easing in product UI

Copy
- Hero = vague headline + "Get Started" / "Learn More"
- Stats bar of fake metrics ("10x faster · 99.9% uptime · 24/7 support")
- Fake logos or testimonials on a real product

---

## 14. UX Writing
- Headlines are specific enough that a competitor couldn't use them.
- Buttons name the outcome: "Create invoice", not "Submit".
- Sentence case for UI text. Numerals for counts ("8 files").
- Errors explain what happened + how to fix. Never blame the user.
- Empty states say what goes here + the action that fills it.
- Cut every word that doesn't change what the user does.

---

## 15. Preflight Checklist (run before every output)
### Fast tests
- SQUINT: blur your eyes. Is there one clear focal point per section?
- SWAP: could a competitor's logo replace ours with nothing feeling wrong? If yes, it's not distinctive enough.
- SCREENSHOT: would the 375px screenshot hold up posted on its own?
- CLOSE-THE-TAB: can you describe the signature moment in one sentence?
- TAB-THROUGH: is focus visible and in logical order across the whole page?
- SLOP SCAN: check every item in Section 13. Any hit = fix.

### Score 1–5
1. Concept: every choice traces back to the one-sentence concept
2. Hierarchy: primary action obvious in under 3 seconds
3. Composition: grid established and broken with intent; varied rhythm
4. Typography: distinctive pairing, dramatic but controlled scale, comfortable measure
5. Color & contrast: disciplined palette, all pairs pass AA
6. Motion: purposeful, correct easing, reduced-motion handled
7. State coverage: every component, every relevant state
8. Responsiveness: mobile has its own composition
9. Accessibility: semantic, keyboard-complete, labeled
10. Copy: specific, verb-led, zero filler
11. Performance: no layout shift, 60fps, fast first paint
12. Memorability: the signature moment lands
13. Craft: optical alignment, shadows, focus rings, footer/empty/404 designed

Ship bar: nothing below 4. Accessibility, Concept, and Craft must be 5.
If it fails: fix the 3 lowest-scoring issues, re-render, re-score. Max 3 silent loops, then ship with trade-off notes.

---

## 16. Output Contract
Every UI deliverable returns:
1. Design Intent (7 lines, including dials)
2. Tokens (or "using DESIGN.md")
3. Code (single file unless told otherwise)
4. Preflight scores + one line on the signature moment + known trade-offs

---

## 17. DESIGN.md Template
Create this in the project root when the work spans more than one screen.

```
# DESIGN.md

## Product
What it is · Who uses it · Register: brand | product | hybrid

## Concept & Personality
One-sentence concept · 3 adjectives · Anti-references (what this must NOT look like)
Direction: [Section 6 recipe] + twists · Dials: V / M / D / Dr

## Color (OKLCH)
--neutral-0 … --neutral-950
--dominant · --accent · --accent-hover · --accent-contrast
--success · --warning · --danger · --info
Dark mode overrides:

## Typography
Display: [family] · Text: [family] · Mono: [family]
Scale ratio: [1.2 | 1.25 | 1.333 | 1.5] · Steps: xs sm base lg xl 2xl 3xl display
Body size / line-height / max measure:

## Space & Shape
Base: 4px · Space tokens: 1–16
Radius: sm / md / lg · Elevation: 1–3 (shadow recipes)

## Motion
Lens: restraint | polish | play
Durations · Easings · Reduced-motion policy

## Signature Moment
What it is · Where it lives · How it degrades on mobile / reduced motion

## Components
Button · Input · Select · Card · Nav · Table · Modal · Toast
For each: anatomy, states, do / don't

## Voice
Tone · Button verb style · Error message pattern · Empty state pattern
```

---

## 18. Sources & Attribution
Concepts in this skill were synthesized from the following open-source work. Credit them when redistributing:
- anthropics/skills (frontend-design): concept-before-code, distinctive aesthetic direction
- Leonxlnx/taste-skill (MIT): brief inference and the dial approach to design expression
- pbakaus/impeccable (Apache-2.0): named AI-slop anti-patterns
- emilkowalski/skills: motion rules on easing, origin, and restraint
- kylezantos/design-motion-principles: weighting multiple motion lenses by context
- greensock/gsap-skills: correct GSAP / ScrollTrigger usage
- VoltAgent/awesome-design-md and VoltAgent/awesome-claude-design (MIT): DESIGN.md format and brand references
- DavidHDev/react-bits (MIT + Commons Clause): signature-moment component reference; check the license before reselling its components
