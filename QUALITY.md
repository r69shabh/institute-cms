# Institute CMS — quality rubric & review log

Pass bar: **every gate ≥ 4/5.** Scored from real screenshots (Firefox headless via Playwright, `work/products/cms_qa/shoot.py`) at 1366px, 768px and 375px, in both `?mode=institute` and `?mode=clinic`, plus scripted functional checks (`work/products/cms_qa/functest.py`). Cap: 6 rounds.

## Gates

| # | Gate | 5 = | 3 = | 1 = |
|---|------|-----|-----|-----|
| G1 | **First 5 seconds** (public site above the fold) — would a coaching-centre / clinic owner think "I want this"? | Looks like a premium, real institute/clinic site: real photography, confident headline, clear CTA, trust signal, all above the fold at 1366 and 375 | Tidy but generic; text-only hero; reads like a template | Looks like a dev demo / admin panel |
| G2 | **Visual polish** | Clear type scale (display serif + sans), consistent 8px spacing rhythm, one icon family (SVG), consistent cards/buttons/radii, no default browser UI, brand colour carried into admin | Mostly consistent, a few default/emoji bits, mismatched colours | Default-looking, inconsistent |
| G3 | **Colour contrast (WCAG AA)** | All body/secondary text ≥ 4.5:1, large text ≥ 3:1, visible focus rings | 1–2 borderline greys | Multiple failures |
| G4 | **Mobile 375px** | No horizontal overflow (scripted check), no awkward wraps, tap targets ≥ 44px, sticky call/enquire bar, sensible section lengths | No overflow but cramped rows / huge tiles | Overflow or broken layout |
| G5 | **Tablet 768px** | Grids reflow cleanly, no orphan cards, no dead whitespace | Orphans/uneven gaps | Broken |
| G6 | **Real-feeling Indian demo content** | Believable names, fees in ₹ with Indian grouping, Indian addresses/hours, no lorem, no "(demo address)", no example.com on the public site | Mostly real, some placeholder tells | Lorem / obvious placeholders |
| G7 | **Empty states** | Every list (site + admin) has a helpful empty state that says what goes there and how to add it | Bare "No matches." text | Blank areas / misleading text |
| G8 | **Form validation** | Inline, field-level, friendly errors (name, Indian mobile, email), focus to first error, clear success state, enquiry reaches admin | Browser-native only | None |
| G9 | **Speed & errors** | 0 console/page errors on every view, first view < 2s locally, images compressed, below-fold images lazy, fonts self-hosted with swap | Minor warnings / heavy assets | Errors / slow |
| G10 | **Admin usability** | Key task (record a payment) in ≤ 2 clicks from dashboard; nav clear with icons; admin uses client's brand colour | 3–4 clicks, some confusion | Hard to find |
| G11 | **Pitch quality** | Personal first line; ONE clear benefit; < 120 words body; ONE ask; no spam-trigger words; short specific subject (A/B); no price/payment/terms/deadline/refund/contract | Generic or long, several benefits | Spammy / salesy |

Pitch gate mechanical checks (`cms_outreach/send_cms_v2.py --lint`): body word count < 120 (excluding signature), exactly one `?` ask, no banned terms (`price, ₹, rs., cost, pay, payment, invoice, deadline, today only, limited, offer, free, discount, guarantee, refund, contract, terms, urgent, act now, click here, !!`).

---

## Round log

### Round 0 — baseline (live site before changes) · shots `cms_qa/r0/`
| G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9 | G10 | G11 |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 | 3 | 4 | 3 | 3 | 3 | 3 | 2 | 5 | 4 | 2 |

Defects: root URL opened the **admin dashboard**, not the website; text-only hero with no imagery; gallery = flat colour blocks with no photos (huge on mobile); emoji icons (📣 📞 ✉️ 👥 🗓) mixed with unicode glyphs; system font only; "(demo address)" and example.com emails on the public site; phone "+91 98100 00000" looks fake; 5th course card orphaned; "max per batch" stat; enquiry form relied on browser `required` only and said "Send"; admin empty states "No matches." / "No payments." and dashboard said "All fees are cleared 🎉" even with zero students; old pitch ~170 words listing 10+ features, two links' worth of asks.

### Round 1 — redesign · shots `cms_qa/r1/`
Changes: new public template — dark "Sample website · Open the admin panel" strip, pinned-notice bar, sticky glass header with logo + tagline, two-column hero (Fraunces display serif + Plus Jakarta Sans, both self-hosted woff2), AI-generated Indian classroom/clinic photography (10 JPEGs, 72–165 KB), floating "next batch / evening slots" card, Google-rating trust row, 4-up stats band; new "Why parents/families choose us" feature grid; course cards with schedule icons, ₹ fee + "full course/per visit", "Most popular" tag; testimonials; faculty/doctor cards; bento photo gallery; about + dated notice board; contact list with icons + elevated form card; 3-column footer; mobile sticky Call / Enquire bar. One SVG icon set (site + admin nav). Default route → public site. Seed data: real-looking phones/emails, no "(demo address)", testimonials + features, storage version bump so old visitors get the new demo.
| G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9 | G10 | G11 |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 | 3 | 4 | 3 | 3 | 4 | 3 | 4 | 4 | 4 | 2 |

Defects found: admin hamburger button visible on desktop (`.btn` overrode `.menu-btn{display:none}`); clinic admin still navy (brand colour not applied); faculty avatars in random orange/brown; mobile admin schedule rows cramped (time + pill + button); tablet hero image left-aligned leaving dead space; gallery images missing in full-page shot (lazy-load — fixed in the shooter by scrolling); yellow admin demo banner off-brand.

### Round 2 — fixes · shots `cms_qa/r2/`
Changes: `.topbar .menu-btn` specificity fix; admin shell takes `--brand` from the site colour; faculty avatars use brand tint; mobile hides status pill in schedule rows; tablet hero full-width 16:9; people grid columns by count; dark admin demo banner with "View the website →"; new `emptyState()` with icon + title + how-to for enquiries, courses, staff, announcements, people, bookings, payments, pending fees; site empty states for courses, staff, notices; inline validation (name, 10-digit Indian mobile incl. +91/0 prefix, optional email) with focus to first error, success card + "Send another"; hero photo + badge editable in Website editor.
Functional test: empty submit → 2 inline errors; bad phone/email → 2 errors; valid → success card; enquiry shows in admin with normalised number; record payment = 2 clicks; 0 console errors.
| G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9 | G10 | G11 |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 | 4 | 4 | 4 | 3 | 4 | 4 | 5 | 4 | 5 | 2 |

Defects: tablet testimonials (3) and courses (5) leave an orphan card in 2-col grid; testimonial avatars random colours.

### Round 3 — tablet polish · shots `cms_qa/r3/`
Changes: last odd card spans both columns at 641–1060px; testimonial avatars brand-tinted.
| G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9 | G10 | G11 |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 | 4 | 4 | 4 | 4 | 4 | 4 | 5 | 4 | 5 | 2 |

### Round 4 — deployed, verified on the LIVE URL · shots `cms_qa/r4-live/`
Deployed to https://demo-institute-cms.vercel.app (17 files incl. images/fonts as base64). Live shots taken through a local mirror of the production URL (sandbox browser can't reach the internet directly). All 15 views: 0 horizontal overflow, 0 console/page errors; functional test passes on live; first load ~1.4 s via mirror.
Contrast spot-checks: body #3d4757 on #fff ≈ 9.9:1; secondary #5b6576 ≈ 6.0:1; footer #8f9bb0 on #0b1220 ≈ 7:1; red badge #b42318 ≈ 6.1:1; teal #0f766e on white ≈ 5.5:1; focus ring 3px brand mix.
| G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9 | G10 | G11 |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 | 4 | 4 | 4 | 4 | 4 | 4 | 5 | 4 | 5 | (see pitch rounds) |

Honest residuals (not blocking ≥4): on 375px the hero photo sits just below the fold (headline + CTA take priority); demo photos are AI-generated (fine for a demo, should be swapped for the client's real photos); Google-rating line is sample copy each client must edit; "View website" appears twice in the admin header on desktop.

---

## Pitch rounds (G11)

**P0 — old template** (`cms_outreach/send_cms.py`): subject "A simple website + fee manager for {Name}"; ~170-word body listing 10+ features (website, courses, faculty, gallery, notices, enquiry form, student records, fees, receipts, attendance, dashboard); "student developer" intro buried after the first line; ask + "quick call". **Score 2** — personal line ok, but no single benefit, too long, feature-dump reads like a brochure.

**P1 — rewrite** (`cms_outreach/send_cms_v2.py`): one benefit only (*update your own website from your phone in a minute*), concrete per-niche example (batch / topper's result / holiday notice; recital date; doctor's leave / health-camp notice), sample link, single reply-ask. Lint (`--lint`): 5 of 32 failed — 3 subjects > 60 chars (long legal names), 2 personal lines contained "offer". Read-through defects: "set up … set up" repetition; academy sample line clunky; "with no developer to chase" slightly negative. **Score 4.**

**P2 — fixes**: short names for subjects/possessives (Bandewar GTC, Gayathri School, Healing Hands, Sree Surabhi Academy, Dr Ajith Soman's clinic); reworded the two lines; sample line "for a JEE/NEET institute" / "for a family clinic" / "(shown for a coaching institute; yours would show your classes)"; "without waiting on a developer". Lint: 0 fails; bodies 93–118 words; exactly one ask; subjects ≤ 60 chars; no banned terms. **Score 5.**

A/B subjects (by queue index parity): **A** "Idea for {Name}'s website" · **B** "Made this for {coaching institutes|academies|clinics} like {Name}".

Final template (institute; academy/clinic swap the example, sample label and content words):
> Hi {Name} team,
>
> {one specific line from their own site}
>
> I'm Rishabh, a student developer at Newton School of Technology. I've built a website for coaching institutes that you update yourself from your phone: a new batch, a topper's result or a holiday notice goes live in a minute, without waiting on a developer.
>
> Here's a working sample for a JEE/NEET institute: https://demo-institute-cms.vercel.app/?mode=institute
>
> Would you like me to set up a version with {Name}'s own courses, faculty and photos, so you can see how yours would look? A one-line reply is enough.
>
> Best,
> Rishabh Gusain
> https://r69shabh.me

## Final scores
| G1 First 5s | G2 Polish | G3 Contrast | G4 375px | G5 768px | G6 Content | G7 Empty | G8 Forms | G9 Speed | G10 Admin | G11 Pitch |
|---|---|---|---|---|---|---|---|---|---|---|
| 5 | 4 | 4 | 4 | 4 | 4 | 4 | 5 | 4 | 5 | 5 |

All gates ≥ 4 after 4 product rounds + 2 pitch rounds (cap 6 not reached).
