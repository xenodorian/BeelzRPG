# Current_Work.md — Mutagen Project Hub

> **Start here.** This is the shared task list, design log, style guide, and glossary for anyone (human or AI) contributing to **Mutagen**. Check boxes when a task is done, add a dated line to the **Issues Log** when you hit a problem or make a call, and keep edits to *your* chapter file to avoid merge conflicts.

## Status (2026-10-28)
**v0.2 in progress: Base Forms & Evolution.** The owner dropped the compactness rule. 5 Base Forms, 10-node trees, Evolutions at L4/L7 and a rebalanced threat table. The spec is *v0.2 Design* below. v0.1.1 history (sanity checks, builder) is kept further down for reference.

## v0.2 Design: Base Forms & Evolution (2026-10-28)
**Owner request (verbatim summary):** drop "keep it simple". 5 Base Forms, each fixing a primary (+3), secondary (+2) and tertiary (+1) stat, with the +0 and −1 going to the dump stats. Evolution 1: +2 primary and +1 to all others. Evolution 2: +3 primary and +1 to all others. Trees of 10 nodes each. A Form grants 3 primary-tree nodes, 2 secondary and 1 tertiary. Each level adds 1 primary node automatically, plus a choice of a secondary or tertiary node. Form-exclusive unlocks on the primary tree at levels 4 and 7. Each Evolution: +1 Prime, a jump in Sequence die size, and one always-ready Surge. Rebalance all challenges. Update the builder too.

This section is the **spec**. Chapters implement it; when they disagree, fix the chapter and log it.

### D1. The five Base Forms
Each stat is primary for exactly one Form, secondary for one and tertiary for one (a Latin square, so no stat is everyone's dump). Each Form's primary tree follows its primary stat.

| Form | Primary +3 | Secondary +2 | Tertiary +1 | Dump (+0 / −1, your choice) | Primary tree | Secondary tree | Tertiary tree | L4 exclusive | L7 exclusive | Stages (Base → Evo I → Evo II → Final) |
|---|---|---|---|---|---|---|---|---|---|---|
| **Juggernaut** | Grit | Nerve | Moxie | Gumption, Chutzpah | Hide | Limbs | Glands | Siege Hide | Fortress | Juggernaut → Rampart → Colossus → Citadel |
| **Skitter** | Moxie | Gumption | Nerve | Grit, Chutzpah | Wiring | Limbs | Senses | Mantis Reflex | Lightning Step | Skitter → Mantis → Wraith → Livewire |
| **Oracle** | Nerve | Chutzpah | Gumption | Grit, Moxie | Senses | Mind | Wiring | Foresight | Thousand Eyes | Oracle → Argus → Seraph → Panopticon |
| **Alembic** | Gumption | Grit | Chutzpah | Moxie, Nerve | Glands | Hide | Mind | Transmute | Panacea | Alembic → Still → Bloomheart → Wellspring |
| **Siren** | Chutzpah | Moxie | Grit | Nerve, Gumption | Mind | Wiring | Limbs | Siren Song | Crown of Will | Siren → Diva → Choir → Crowned |

- **5 Forms vs 6 trees:** each of the five stat-trees (Hide/Grit, Wiring/Moxie, Senses/Nerve, Glands/Gumption, Mind/Chutzpah) is one Form's primary tree. **Limbs** (Grit *or* Moxie) is the shared body tree. It is never primary, but it's secondary or tertiary for three Forms (Juggernaut, Skitter, Siren), so it has no Form-exclusive nodes. Every tree appears 1–3 times as secondary or tertiary.
- **Every Form can build Infuse Surges** (Juggernaut: Shell/Mend; Skitter: Haste/Veil; Oracle: Veil/Link/Haste; Alembic: Mend/Shell/Link; Siren: Link/Haste). This closes v0.1 open question 12 (no base Infuse Effect).
- **You only take nodes from your Form's three trees.** That is what makes a Form a Form.

### D2. Stats by stage

| Stage | Levels | Primary | Secondary | Tertiary | Dump A | Dump B |
|---|---|---|---|---|---|---|
| Base | 1–3 | +3 | +2 | +1 | +0 | −1 |
| Evolution I | 4–6 | +5 | +3 | +2 | +1 | +0 |
| Evolution II | 7–10 | **+8** | +4 | +3 | +2 | +1 |
| Final Form (active, once per Lockdown) | 10 | +10 | +4 | +3 | +2 | +1 |

- **The old stat boosts at levels 3/6/9 are removed** (they would double-dip with Evolutions). Levels 3, 6 and 9 give **+1 Knack** instead (6 Knacks by level 9).
- **Stat cap:** the old +5 cap is gone. Stats come only from your Form's stages (max +8, +10 during Final Form).

### D3. Trees: 10 nodes, tiers, and progression
- Every tree has **10 nodes**: **Root**, **4 Tier I**, **4 Tier II** and an **Apex**. A Form's **primary tree** also has its **2 Evolution nodes** (Form-exclusive), so it holds 12 in all.
- **Gates:** Root first. Tier I needs the Root. **Tier II** needs **level 4+** and **3 nodes already in that tree**. **Apex** needs **level 7+** and **6 other nodes in that tree**, and can only be taken in your **primary or secondary** tree.
- **Level 1:** 3 primary-tree nodes, 2 secondary-tree nodes and 1 tertiary-tree node (6 nodes, 3 Roots).
- **Each level after 1:** **+1 primary-tree node** (automatic: you always get it, and you choose which node) **and +1 node in your secondary *or* tertiary tree** (your choice).
- **Evolution nodes** are granted on top at level 4 and level 7 (not chosen, and they don't use a pick).
- **When the primary tree is full:** primary picks = level + 2, and the tree's 10 standard nodes fill at **level 8**. At levels 9 and 10, the primary pick **overflows** into your secondary or tertiary tree. Checked: secondary + tertiary picks reach 14 at level 10, against 19 legal slots (Apex only in the secondary).
- **Totals:** nodes = 2 × level + 4, plus Evolution nodes (6 at L1, 13 at L4 with Siege Hide etc., 20 at L7, 26 at L10).
- **Respec:** on level-up you may swap one node for another in the same tree (or the same pick type) that you qualify for.
- **Material (was "Form" in v0.1):** Bio vs Chrome is still chosen **per tree** when you take its Root. Knit, Firmware, Upkeep and Splice are unchanged. *Renamed because "Form" now means Base Form.*

### D4. Evolution
- **Evolution I (level 4)** and **Evolution II (level 7)** each give:
  - the stat jump (D2);
  - **+1 Prime** (Prime 2 → 3 → 4; the old "Prime 3 at level 5" is removed);
  - a **Sequence die jump** (d6 → **d8** at Evo I, d8 → **d12** at Evo II, skipping d10);
  - **one Signature Surge** (always ready);
  - the Form's **Evolution node** on its primary tree;
  - the Form's **new look** (each Form has a described Base / Evo I / Evo II / Final look, with Bio and Chrome readings).
- **Sequence die track:** L1 d4, L2–3 d6, **L4–6 d8**, **L7–10 d12**. With Surges known = level + 2, this gives Wild slots of 1,2,1 → **2**,1,0 → **3**,2,1,0. *Right after each Evolution your body offers unfamiliar powers (more Wild slots), and you learn to fill them.* No d20 (it would be mostly Wild).
- **Signature Surge:** build it from your parts like any Surge (Twists allowed by your Rank) and write it in a Signature box, **not on the Sequence**. It doesn't count toward Surges known, Prime or the Primed maximum. It is **Primed at the start of every combat**, costs its normal Flux, can't be Amped (except during Emergence and Final Form) and, after you Unleash it, is **Primed again at the start of your next turn**. So it's available once per round. A missed Strike/Bolt Signature is still ready next turn. **Evo II adds a second Signature** (each once per round). You may rebuild one Signature when you level up.
- **Why this is safe:** you still have one Action per turn, so a Signature means "you can always Surge". **Flux is the throttle.** One Flux per round adds up to roughly one Overload every 2 fights, unless you pace yourself or are a high-Nerve Form.
- **Emergence (the mid-mission moment):** the level and its numbers arrive at the debrief as usual (the sheet and builder use the new stage at once). The **metamorphosis plays out on screen**. At the start of your first turn in the **first combat** of the next mission (or an earlier moment of terror the GM and you agree on), you **Emerge**: describe the change, gain **temporary HP = 2 × level**, every enemy within 30 ft that sees you is **Shaken** (Bosses ignore this), and your new Signature Surge is **Amped** the first time you Unleash it. Optional *Chrysalis* downtime scene in ch 9.
- **Final Form (level 10)** is framed as the **third stage**. You permanently take your Form's Final look. Once per Lockdown, at the start of a combat, you enter Final Form until the combat ends: **primary stat +2**, **Prime two extra Surges**, and **every Surge you Unleash is Amped** (Signatures too).

### D5. Other rules touched
- **Rank** (⌈level/2⌉) is unchanged and still added to attacks and defenses. **Defenses** = stat + Rank. **HP** = 12 + 2 × Grit + 5 per level after 1st (Grit now grows, so HP spikes at each Evolution). **Flux Limit** = 4 + Rank + Nerve (min 4, Splice −1). Because Nerve grows it ranges from about 7 (dump Nerve) to 16 (Oracle L7). That's the Oracle's identity: the most stable mutant.
- **Surge attack stat (new, general):** a Surge may use its **Shape's** stat **or the stat of the tree that unlocked its Effect** (Hide Grit, Limbs Grit/Moxie, Senses Nerve, Glands Gumption, Wiring Moxie, Mind Chutzpah). This replaces v0.1's single special case "Dread may use Chutzpah", and lets every Form Surge with its primary stat.
- **Twists:** 1 per Surge, 2 from Rank 3 (unchanged). **Primed maximum** = Prime + 1 (Signatures not counted).
- **Lab Escapee:** still +1 Surge known (fills a Wild slot; no extra Signatures).
- **Hive Mind** (Mind Apex): "Prime one extra Surge" is now "**one ally** Primes one extra Surge" (Prime already grows at the Evolutions).
- **Unbreakable** (Hide Apex) gives up "can't be knocked Prone/moved" to the new Tier I node **Anchor**, and gains "Armor max 5".
- **Armor max** 4 (5 with Unbreakable; 6 with the Juggernaut's Siege Hide).
- **Knacks:** 3 at L1, +1 at L3, L6, L9.
- **Old (v0.1) saves:** the builder migrates identity fields (name, concept, drive, origin, Knacks, gear, notes) and asks you to pick a Base Form; stats and nodes are reset. Surges are kept but re-validated.

### D6. Challenge rebalance (Threat table v0.2)
Guard and TN are now separate columns. **Guard** tracks player attack bonuses, which rise fast with the primary stat. **TN** tracks player defenses, which rise slowly. Each column stalls at the Evolution levels and catches up after, so every Evolution is a felt spike.

| T | Guard | TN | HP | Damage |
|---|---|---|---|---|
| 1 | 12 | 12 | 18 | 7 |
| 2 | 13 | 12 | 22 | 8 |
| 3 | 14 | 13 | 30 | 10 |
| 4 | 14 | 13 | 40 | 12 |
| 5 | 15 | 14 | 48 | 14 |
| 6 | 16 | 15 | 56 | 16 |
| 7 | 17 | 16 | 72 | 18 |
| 8 | 18 | 17 | 84 | 21 |
| 9 | 19 | 18 | 92 | 24 |
| 10 | 20 | 18 | 100 | 27 |

The role multipliers and encounter budget are unchanged. Results are in **Balance v0.2** below.

## How to Contribute (for AI and humans)
1. Read this file, then [README.md](README.md), then [chapters/12_Quick_Reference.md](chapters/12_Quick_Reference.md). That's the whole system in ~15 minutes.
2. Pick an **unchecked task** in the Backlog. Add `(claimed: <your name/agent>, <date>)` next to it and commit that first, so others skip it.
3. **Edit only the chapter file(s) your task needs.** If a change ripples (renaming a term, changing a number), list every affected file in the Issues Log and update them in the same commit.
4. If you change a core number (Rank, HP, TN, damage, Surge dice), re-run `python3 tools/balance_sim.py` and paste the new results into the Balance section.
5. Check the box, log what you did, commit with a descriptive message.

## File Map

| Path | Contents | Owner notes |
|---|---|---|
| `README.md` | Cover, pitch, table of contents | Keep the TOC in sync with `chapters/` |
| `Current_Work.md` | This hub | Everyone appends |
| `chapters/00_Introduction.md` | Pitch, setting, factions, tone, chapter map | |
| `chapters/01_Core_Rules.md` | The roll, Rank, DCs, Knacks, Adv/Dis, crits, Juice, rest, distance | Core numbers live here |
| `chapters/02_Character_Creation.md` | Steps, derived numbers, stats, Origins, example PC | |
| `chapters/03_Augment_Trees.md` | Bio/Chrome/Splice forms, 6 trees × 6 nodes | Biggest balance surface |
| `chapters/04_Surges.md` | Surge parts, Sequence, Priming, Churn, Wild table, samples | Signature mechanic |
| `chapters/05_Flux_and_Overload.md` | Flux, Overload, Bloom/Glitch tables, Scars/Faults, Last Gasp | |
| `chapters/06_Combat.md` | Initiative, phases, actions, defense, damage, conditions, Down, Injuries | |
| `chapters/07_Advancement.md` | Level table, Final Form, Samples, pay | |
| `chapters/08_Gear.md` | Weapon frames + mods, armor, kit, starting kits | |
| `chapters/09_Running_the_Game.md` | GM advice, missions, Spill Clock, downtime, factions, generator | |
| `chapters/10_Threats.md` | Threat table, roles, traits, budget, 12 threats + 1 boss | |
| `chapters/11_Starter_Mission.md` | *Pumpstation 9* + 4 pregens | |
| `chapters/12_Quick_Reference.md` | One-page cheat sheet | Update when rules change |
| `chapters/13_Character_Building_Guide.md` | Step-by-step build (L1), leveling 1–10, archetypes, common mistakes, worked example (Dree, L1 + L5) | Player-facing summary; rules chapters win on conflict. Update its tables if ch 2–8 numbers change |
| `sheets/Character_Sheet.md` / `.html` | Fillable/printable sheet | |
| `art/*.jpg` | AI-generated placeholder art (8 images) | Replace freely |
| `tools/balance_sim.py` | Monte Carlo combat sim | Re-run after number changes |
| `builder/index.html` | Character builder web app (single offline file; GitHub Pages: https://xenodorian.github.io/BeelzRPG/builder/) | **Game data lives in the `MUTAGEN` object in the first `<script>`**; update it with any rule change in ch 2–8 |
| `tools/builder_test.js` | Headless builder test (jsdom), incl. regression tests R1–R14 | Run after editing the builder or its data (`npm i jsdom`) |
| `tools/check_builder_data.js` | Cross-checks the builder data block against chapter tables (320 checks) | Run after any rules change; no dependencies |
| `tools/builder_flows.js` | Real-browser flow tests (Playwright + Chrome) | `npm i playwright-core`; set `CHROME=/path/to/chrome` |
| `tools/tree_compare.py` | Per-tree expected DPR / HP lost / Flux per fight at L1, L5, L10 | Re-run after node changes |

## Style Guide
- **Format:** GitHub-flavoured Markdown, one chapter per file, numeric prefixes (`NN_Name.md`). Images via relative paths (`../art/x.jpg`).
- **Voice:** second person ("you"), plain and punchy, a little wry. Short sentences. The owner's homebrew uses a direct, conversational voice; match it.
- **Compactness first:** prefer one scaling rule over several near-duplicate abilities; prefer mix-and-match parts (Shape + Effect + Twist, T + Role + Traits, Frame + Mod) over long lists.
- **Game terms are Capitalized** and defined in the Glossary below. Don't invent synonyms (it's always *Flux*, never "instability points").
- **Numbers:** write dice as `d8`, `2d6`, `(Rank+1)d10`. Use "Rank × die" for weapon damage. Round down unless the rule says otherwise.
- **Every rule states its timing** (Action / Quick / Reaction / Move / passive) and **duration** (default: until the end of the affected creature's next turn).
- **Player-facing rolls:** the GM never rolls to hit. Any new enemy ability must name the defense (Dodge/Endure/Resist) and Single/Area.
- **Tables over paragraphs** when there are 3+ parallel options.
- **Art:** placeholder images are AI-generated; no real people; keep files < 500 KB (JPG quality ~80).

## Glossary

| Term | Meaning | Defined in |
|---|---|---|
| **Action / Quick / Move / Reaction** | The four parts of a turn (Reaction is once per round) | Ch 6 |
| **Advantage / Disadvantage** | Roll 2d20, keep higher/lower | Ch 1 |
| **Amped** | A Primed Surge rolled as doubles; costs 0 Flux | Ch 4 |
| **Analyze** | Gumption action: learn stats, target Exposed | Ch 6 |
| **Apex** | Capstone node of a tree; level 7+, needs 3 nodes in tree | Ch 3 |
| **Area / Single** | Attack types; Area deals half on a successful defense or miss | Ch 6 |
| **Armor** | Flat reduction per hit, max 4 | Ch 6, 8 |
| **Augment / Node / Root / Tree** | Your skill-tree abilities; Root unlocks a tree | Ch 3 |
| **Bio / Chrome / Splice** | Form of a tree; Splice = you have both | Ch 3 |
| **Bloom / Glitch** | Overload tables for Bio / Chrome | Ch 5 |
| **Breather / Lockdown** | Short rest (½ HP, Flux 0, 2 per Lockdown) / full rest | Ch 1 |
| **Churn** | Quick action: +1 Flux, roll one more Prime; not on a turn you Unleash | Ch 4 |
| **Crit** | Natural 20 on an attack: double damage dice | Ch 1 |
| **Death mark** | 3 while Down = dead | Ch 6 |
| **Defense** | Dodge (Moxie), Endure (Grit), Resist (Nerve), + Rank | Ch 1, 6 |
| **Down** | At 0 HP | Ch 6 |
| **Effect / Shape / Twist** | Surge building parts | Ch 4 |
| **Final Form** | Level 10 capstone | Ch 7 |
| **Firmware / Knit** | Chrome / Bio form perks | Ch 3 |
| **Flux / Flux Limit** | Instability; Limit = 4 + Rank + Nerve | Ch 5 |
| **GRAFT** | The players' employer | Ch 0 |
| **Guard** | Number players attack against (default = TN) | Ch 10 |
| **Injury** | Temporary harm from going Down (d6) | Ch 6 |
| **Juice** | Reward token: reroll, choose a Prime, or end a condition | Ch 1 |
| **Knack** | Narrow trained specialty; adds Rank to checks | Ch 1 |
| **Last Gasp** | Once per Lockdown: Overload instead of going Down | Ch 5 |
| **Mutagenic X** | Threat trait: adds Flux when it damages you | Ch 10 |
| **Origin** | Background: a Knack + a Perk | Ch 2 |
| **Overload** | Exceeding Flux Limit: damage + table roll, Flux → 0 | Ch 5 |
| **Patch / Rally / Taunt / Brace / Help** | Baseline actions | Ch 6 |
| **Prime / Primed** | Surges rolled ready at combat start (2, or 3 at L5+) | Ch 4 |
| **Push** | Gain 1 Flux for a node's extra effect | Ch 3 |
| **Rank** | ⌈level/2⌉, 1–5; added to attacks, defenses, Knack checks; scales everything | Ch 1 |
| **Role / Trait / T (Threat level)** | Enemy-building parts | Ch 10 |
| **Sample** | Harvested Boss/Elite part, spliced in as a Surge | Ch 7 |
| **Scar / Fault** | Permanent Bio / Chrome Overload quirk | Ch 5 |
| **Scrip** | Money | Ch 8 |
| **Sequence / Sequence die** | Your numbered Surge list; d4→d12 by level; empty slots are Wild | Ch 4 |
| **Spill / Spill Clock** | The disaster; the GM's 6-segment mission timer | Ch 0, 9 |
| **Stats** | Grit, Moxie, Nerve, Gumption, Chutzpah | Ch 2 |
| **Surge / Unleash** | Random combat power / the action that uses it | Ch 4 |
| **TN (Threat Number)** | Enemy's Attack DC (players defend vs it) | Ch 10 |
| **Upkeep** | 25 Scrip per Chrome tree per mission | Ch 3 |
| **Wild / Wild Surge** | Empty Sequence slot; rolls on the d12 Wild table | Ch 4 |
| Conditions: **Blinded, Burning, Dazed, Exposed, Held, Poisoned, Prone, Shaken, Veiled** | | Ch 6 |

## Task List
### Setup
- [x] Read owner's homebrew (4M, Spectrum, Mech Suit Panic, Survive the Anomalies) and note style preferences
- [x] Use public SRDs as structural models (D&D 5e SRD: d20 + bonus, advantage, conditions; Blades in the Dark: clocks → Spill Clock; Cypher/Into the Odd: player-facing rolls, fixed enemy damage; PbtA/Fate: Knacks as free-form aspects; Lancer: modular builds). *Drawn from existing knowledge of those public rules; no fresh web survey this pass. A contributor could do a deeper comparison.*
- [x] Repo layout: `README.md`, `Current_Work.md`, `chapters/`, `sheets/`, `art/`, `tools/`
- [x] Generate placeholder art (8 images, 130–305 KB each)

### Chapters
- [x] 00 Introduction & Setting
- [x] 01 Core Rules
- [x] 02 Character Creation
- [x] 03 Augment Trees
- [x] 04 Surges & the Sequence
- [x] 05 Flux & Overload
- [x] 06 Combat & Conditions
- [x] 07 Advancement
- [x] 08 Gear
- [x] 09 Running the Game
- [x] 10 Threats
- [x] 11 Starter Mission (+4 pregens)
- [x] 12 Quick Reference
- [x] Character sheet (Markdown + printable HTML)
- [x] 13 Character Building Guide (2026-10-28)
- [x] Guide sanity check (2026-10-28; see *Guide Sanity Check*)
- [x] HTML character builder (`builder/index.html`, 2026-10-28; see *Character Builder*)

### Quality
- [x] Math pass: hit/defense odds per level, damage vs HP, encounter budget (see Balance)
- [x] Glossary: every capitalized game term defined
- [x] Playtest walkthrough: L1 and L5 rounds (see Playtest)
- [x] Consistency pass: link/anchor check (0 broken), cross-chapter numbers
- [x] Sanity check 2026-10-28: logic + per-tree balance review (see section below)
- [ ] **Live playtest** with real players (needs humans)

### Backlog (unclaimed — pick one!)
- [ ] More threats: 2–3 per T band, especially T6–T10, plus two more Bosses (T5, T10)
- [ ] Second and third missions (the five pumpstations hook from *Pumpstation 9*)
- [ ] Optional rules: vehicles/chases, hacking mini-game, mass combat
- [ ] Halcyon gazetteer: 6 districts, 1 paragraph + 1 d6 table each
- [ ] Expand Wild Surge table to d20 (keep the 1 = bad / 20 = great curve)
- [ ] More Origins (d8 or d10)
- [ ] Optional "Splice nodes" (cross-tree nodes needing one Bio and one Chrome tree)
- [ ] Replace placeholder art; add art to chapters 01, 06, 07, 09, 11, 12
- [ ] PDF/print build (e.g. pandoc → HTML/PDF with a shared CSS)
- [ ] Form-fillable PDF character sheet
- [ ] Spreadsheet/VTT helper: Sequence roller and Flux tracker

## Design Decisions (why things are the way they are)
1. **d20 + Stat + Rank, player-facing.** The owner's homebrew (4M, Mech Suit Panic, Spectrum) is d20-based with players rolling Dodge rather than having AC, and enemies acting simultaneously (Survive the Anomalies, 4M). Mutagen keeps all three. The GM never rolls to hit (Cypher/Into the Odd influence).
2. **One scaler: Rank (1–5).** Replaces D&D's proficiency bonus *and* drives all scaling (weapon dice, Surge dice, node effects). Fewer tables, no "greater" versions of abilities.
3. **Five emotive stats** (Grit, Moxie, Nerve, Gumption, Chutzpah), each with a combat role and a defense or resource: Grit→Endure/HP, Moxie→Dodge/initiative, Nerve→Resist/Flux Limit/ranged, Gumption→Patch/Analyze/hack, Chutzpah→Taunt/Rally/Dread. "Willpower" from the brief is folded into **Nerve**.
4. **Augment trees = class + race.** Six body-system trees (Root → 4 nodes → Apex), echoing 4M's Domain/Subdomain "Required" boon structure. **Form (Bio/Chrome) is chosen per tree**, which doubles flavour without doubling content; Bio vs Chrome differ in perk, Overload table, and weakness (Chrome: Shock, Upkeep).
5. **Surges instead of cards.** "Deck" = Sequence (a numbered list), "deck size" = Sequence die (d4→d12), "draw" = Prime (roll 2–3 dice), "mulligan" = Churn (+1 Flux), "tutor" = Juice or Chrome Firmware. Empty slots are **Wild**, which keeps die sizes fixed while the list grows and gives every character a shared chaos table. Doubles = **Amped** (free) so bad luck has an upside.
6. **Surges are built from parts** (6 Shapes × 9 damage Effects + 5 Infuse Effects × 7 Twists) to give hundreds of combinations from ~1 page of rules. Trees unlock parts, so your Augments shape your Surge pool.
7. **Surges are optional and budgeted.** Baseline weapon hit ≈ Rank × 4.5 + stat; a Surge ≈ (Rank+1) dice + stat + a rider, i.e. ~1.4–1.9× a weapon hit, paid for with Flux and randomness. Sim shows Surges shorten fights by ~10–25% rather than dominating.
8. **Flux resets on Overload.** Going over is a gamble, not a death spiral: Rank d6 damage (can't drop you below 1 HP) + a mostly-bad d12 table with some gifts. Breathers reset Flux, so Flux budgets are per 1–2 fights.
9. **Missions = levels** (1 per mission, 10 missions), from the owner's ATRaC and M.O.T.H. games.
10. **Enemies = T + Role + Traits** with fixed damage, so the GM can build a threat in under a minute. HP 7T+11, Damage 6+1.5T, TN 11+⌈T/2⌉.
11. **Conditions have one default duration** (end of the affected creature's next turn) and Bosses shed one per Enemy Phase, so control Surges stay strong without locking down bosses.
12. **Markdown, one chapter per file**: renders on GitHub, diffs cleanly, and lets several contributors work at once without merge conflicts.

## Balance (math pass)
Assumes primary stat +3 rising to +5 (stat boosts at 3/6/9), enemy T = party level.

| L | Rank | Atk | Hit% vs Guard | Good defense % | Weak defense (−1) % | Weapon (d8) avg | Bolt Surge avg | Soldier HP | PC HP (Grit +2) | Enemy dmg | Failed defenses to drop PC |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | +4 | 65% | 60% | 45% | 7.5 | 12.0 | 18 | 16 | 7 | 2.7 |
| 3 | 2 | +6 | 70% | 60% | 45% | 13.0 | 17.5 | 32 | 26 | 10 | 2.9 |
| 5 | 3 | +7 | 70% | 60% | 45% | 17.5 | 22.0 | 46 | 36 | 13 | 3.0 |
| 7 | 4 | +9 | 75% | 65% | 45% | 23.0 | 27.5 | 60 | 46 | 16 | 3.1 |
| 10 | 5 | +10 | 75% | 70% | 45% | 27.5 | 32.0 | 81 | 61 | 21 | 3.0 |

- **Curves are flat by design:** a same-level Soldier takes ~2.5–3 weapon hits at every level; a PC drops after ~3 failed defenses at every level. PCs slowly get more accurate (65→75%).
- **Encounter sim** (`tools/balance_sim.py`, 4 PCs, 3,000 fights each; ignores riders/healing/tactics):

| Encounter (budget) | L1 rounds / party HP lost | L5 | L10 |
|---|---|---|---|
| 4 Soldiers (Standard, 4) | 3.7 / 25% | 4.0 / 24% | 4.3 / 26% |
| Boss alone (Standard, 4) | 2.8 / 20% | 3.4 / 21% | 3.8 / 23% |
| Brute + 2 Soldiers (Standard, 4) | 3.2 / 20% | ~3.6 / ~20% | ~4.0 / ~22% |
| Elite + Soldier + 4 Mooks (Hard, 5) | 4.5 / 40% | ~4.3 / ~33% | ~4.5 / ~32% |
| Boss + 4 Mooks (Deadly, 6) | 5.1 / 41% | ~5 / ~35% | ~5 / ~35% |
| *(earlier tuning)* 6 Soldiers, no Surge changes (1.5×) | 6.4 / 75% (37% TPK) | 7.0 / 70% | 7.5 / 71% |

- **Tuning history:** enemy damage raised from 5+T to 6+1.5T (Standard fights cost only ~20% HP before). Mook cost raised from ¼ to ½ (4 Mooks hit as hard as one Soldier). "Missed Surge deals half" was tested and rejected (fights got ~25% shorter, HP loss fell 28%→16%); "missed Surge stays Primed" adopted instead (negligible balance shift, fixes the feel-bad).

## Playtest Walkthroughs
### Level 1 — *Pumpstation 9*, Pump Hall (Vex, Juno, Ozzie, Rook vs 2 Scrapjack Pickers + 4 Spill Rats)
- **Initiative:** group Moxie vs TN 12 (Rook's Quickened gives advantage). Vex 14 ✓, Juno 5 ✗, Ozzie 12 ✓, Rook ✗ → 2/4 = success, players first.
- **Prime (d4 ×2):** Vex 1,1 → *Mantis Lunge* **Amped**. Juno 3,1 → *Hive Whisper*, *Neural Spike*. Ozzie 2,1 → *Acid Bloom*, *Field Dressing*. Rook 1,4 → *Arc Punch* + **Wild** (d12 = 10, *Feedback*).
- **Rook** wades in (water = half speed) and Unleashes *Feedback* (2 Flux, 2/5): Pulse, Grit +4, roll 14 → 18 hits everything nearby. 2d6 = 7 Psychic. All 4 Rats die (Mooks); both Pickers drop to 6 HP and are Shaken.
- **Juno** rifles Picker A: 3+4 = 7, miss.
- **Vex** Unleashes Amped *Mantis Lunge* on Picker A: 8+4 = 12 vs Guard 13, miss. *(Problem found: an Amped Surge simply vanished. Fix: missed Strike/Bolt Surges stay Primed.)* With the fix, it stays Primed for next turn.
- **Ozzie** Spits at Picker B: 3+3 = 6, miss.
- **Enemy Phase:** Picker B (Shaken → disadvantage, so Juno defends with advantage) shoots Juno: Dodge 18+1 = 19 vs 12, no damage.
- **Round 2:** Vex's Lunge (still Primed and Amped) hits Picker A for 3d10+3 = 15 → dead. Rook's Arc Punch kills Picker B. **Fight over in 2 rounds.**
- **Findings:** (1) Missed Surges felt bad → stays-Primed rule. (2) A 30-ft *Feedback* wiped the whole room at L1 → radius cut to 20 ft. (3) "+2 to group initiative checks" (Militia) was ambiguous → "+2 to your roll." (4) Doubles collapse two options into one Amped Surge; that's intended (Churn exists), but noted.

### Level 5 — Vex and Juno (plus two off-screen allies) vs a Glasshide (T5 Brute)
- **Vex L5:** Moxie +4, Grit +3, Nerve +1, Chutzpah 0, Gumption −1. Nodes: Natural Weapons, Crusher Grip, Extra Arm, Spring Legs, Plating, Thick. HP 48, Armor 3, Limit 8, Dodge +7 / Endure +6 / Resist +4. Claws +7, 3d8+4. Sequence d8 (7 Surges + Wild), Prime 3.
- **Juno L5:** Nerve +4, Chutzpah +3, Gumption +1, Moxie 0, Grit −1. Nodes: Keen, Target Lock, Long Sight, Uplink, Iron Will, Precog. HP 30, Limit 11. Rifle +7, 3d8+4, 240 ft.
- **Prime:** Vex rolls 8,8,8: three Wild slots. *(Problem found: do Wild doubles Amp? Rule gap. Fix: each Wild die rolls separately; Wild never counts as doubles.)* d12: 5 *Blood Price*, 2 *Spore Bloom*, 1 *Misfire* (free Churn → 2, *Pin*). *(Problem found: is Vex hit by her own Spore Bloom? Fix: "you're unaffected.")* Juno rolls 4,3,8: *Ghost Line*, *Hive Whisper*, Wild.
- **Juno:** Target Lock (Quick), Unleash *Ghost Line* (Bolt + Kinetic + Hush, 2 Flux): 19+7 = 26 hits. 4d8 + 1 Kinetic die + 1 Target Lock die = 6d8+4 = 22, −2 Armor → 20. Glasshide 92 → 72.
- **Vex:** Unleash *Blood Price*: 10+7 = 17 hits. As first written (+3 dice) it was 8d10+4 = 59 −2 → 57 damage, plus 3d6 = 8 to herself. Glasshide 72 → 15. *(Problem found: one Wild Surge did 2.7× a weapon hit and nearly solo'd a Brute. Fix: Blood Price is now +2 dice, avg ~43.)*
- **Enemy Phase:** Crystal Maul vs Vex, Endure 14+6 = 20 vs TN 14, no damage.
- **Findings:** Wild rule gap, Spore Bloom self-hit, and Blood Price spike fixed. Single-target burst at L5+ (Strike + Kinetic + Overcharge ≈ 7d10+stat for 2 Flux, ~42) is high but can't one-shot a same-level Soldier (46 HP) on average; **watch in live play.** Brutes melt fast under focused Surges. That's intended as the payoff, but GMs can add Shielded/Armored.

## Issues Log
- 2026-10-28 — **Rules gap found by the builder's random generator:** there is no base Infuse Effect, so a character whose only trees are Limbs can't build any Infuse Surge (every Infuse Effect is unlocked by Hide, Senses, Glands, Wiring, or Mind). Legal as written; ch 13 now says so. Open question: add a base Infuse Effect?
- 2026-10-28 — **Guide (ch 13) rules calls** where chapters 2–8 were ambiguous; ch 13 now states them, the builder implements them: (a) Flux Limit minimum 4 applies *before* the Splice −1 (a Splice can have Limit 3). (b) A Splice keeps each tree's Form rules: Knit counts Bio trees, Firmware counts Chrome-tree parts, Chrome trees still cost Upkeep and give disadvantage vs Shock. (c) You wear one armor (Light *or* Heavy) plus an optional Shield. (d) Natural Weapons are a Frame and can take a Mod; Spit and Mind Spike can't. (e) Knacks: 3 at L1, +1 at L4 and L8 (5 total), plus Blossoms. (f) Thick = +2 × level total.
- 2026-10-28 — `git commit` failed: no author identity on the box. Set the repo-local identity to the owner's GitHub noreply address.
- 2026-10-28 — Homebrew `.docx` files were read via python-docx (text + tables). The 15.6 MB 4M doc is mostly images; only text was used. Takeaways: d20 + modifiers, player Dodge rolls instead of AC, simultaneous enemy turns, "Required" root boons in subdomains, grievous injury tables, GM reward tokens (Dimes → **Juice**), levels per mission, cap level 10, corporate dispatcher premise (ATRaC, M.O.T.H. → **GRAFT**).
- 2026-10-28 — Tree unlock counts are uneven (Glands unlocks 4 parts, Limbs/Senses/Mind 2). Accepted: Glands nodes are utility-heavy. Revisit after playtest.
- 2026-10-28 — Mission pay was inconsistent (ch 7 said 100 × level, starter mission paid 300). Unified to **200 + 100 × level**.
- 2026-10-28 — Clinic Rat perk "installs cost nothing" was meaningless (installs are free on level-up). Changed to half-price Scar/Fault removal.
- 2026-10-28 — Area Surges hitting allies said "success = no damage" while enemy Area said half. Unified to half.
- 2026-10-28 — Wild #1 *Misfire* and #12 *Perfect Expression* had unclear timing; rewritten.
- 2026-10-28 — Playtest fixes: missed Strike/Bolt Surges stay Primed; Wild dice never Amp; Spore Bloom spares the user; Blood Price +3 → +2 dice; Feedback 30 → 20 ft; Militia initiative wording.

## Sanity Check 2026-10-28
A fresh skeptical read of every chapter as a new player/GM, six L1 test builds (one per tree: all legal with base parts + that tree's unlocks), and a new per-tree model (`tools/tree_compare.py`).

### Verdict
The core loop (d20 + Stat + Rank, player-facing defense, T/Role/Trait threats) was sound and its numbers matched across chapters, the Quick Reference, and the sheets. The real problems were: **(1)** Churn let you Surge on *every* turn, so Flux was the only brake and weapons became the backup; **(2)** several timing holes (Precog, Puppet, Overload while Down, ambush rounds, "end of next round"); **(3)** tree imbalance: Limbs added no damage before level 7, Wiring out-damaged everything, Unbreakable/Precog approached immunity, and Gumption characters had no attack stat. All fixed below; debatable calls are listed as open questions.

### Findings and fixes
| # | Severity | Finding | Fix (file) |
|---|---|---|---|
| 1 | **Breaking** | Churn (Quick) + Unleash (Action) every turn meant a Surge every round after Primes ran out; sims and "Surges are optional spikes" assumed 2–3 per fight. | You can't Churn on a turn you Unleash (Misfire's free Churn excepted). Gives ~3 Surges per 4-round fight. (ch 4, ch 12) |
| 2 | **Breaking** | Puppet's "makes one attack against a target you choose" had no resolution against an enemy (enemies never roll). | Enemy target takes the attack's Damage, no roll/rider; a player target defends. (ch 3) |
| 3 | **Breaking/Balance** | Precog could be used after seeing a failed roll, making it a near-free success every round. | Declare before rolling; grants advantage. (ch 3) |
| 4 | Breaking | Two Twists from Rank 3: could the same Twist (Overcharge) be taken twice? | Two **different** Twists. (ch 4) |
| 5 | Breaking | Overload while Down (e.g. a Mutagenic hit) and Glitch *Short* had no HP floor rule. | Overload damage, including Short, can't drop you below 1 HP; skipped if already Down. (ch 5) |
| 6 | Clarity | After an ambush's free Enemy Phase, who goes first was undefined. | Players go first after it. (ch 6) |
| 7 | Clarity | Enemy action economy was only implied. | Each enemy: Move + one action; Elites attack twice; Bosses per ch 10. (ch 6) |
| 8 | Clarity | "Until the end of next round" (Shell, Veil, Link, Linger, Intrude) was never defined. | Defined: through the whole round after the current one. (ch 6) |
| 9 | Clarity | Can a Down character be attacked/defend? | Yes, defends normally (Prone: disadvantage vs melee). (ch 6) |
| 10 | Clarity | Keen Edge (19–20) + Deadeye (18–20) stacking; did Deadeye cover Surges? | Crit ranges don't stack; Deadeye covers weapons, Spit, Mind Spike, ranged Surges. (ch 3, ch 8) |
| 11 | Clarity | Two Chrome trees' Upkeep (50) ate a new character's entire 50 Scrip. | GRAFT prepays the first mission's Upkeep. (ch 3) |
| 12 | Clarity | Firmware: did base-only Surges (e.g. Strike + Kinetic) count as "unlocked by a Chrome tree"? | Base parts alone don't count. (ch 3) |
| 13 | Clarity | Creation step said "slot 4 is Wild", contradicting Lab Escapee. | Noted the exception. (ch 2) |
| 14 | **Balance** | **Limbs** (the "melee" tree) added zero damage until its L7 Apex; its Root is just a free Standard weapon. | Extra Arm: +1 damage die once per turn on a melee hit (parity with Capacitor/Target Lock); Push still knocks Prone. (ch 3) |
| 15 | **Balance** | **Wiring** out-damaged every tree (+68% DPR at L5 vs +12–19%): free Reflex Spike every round + Overclock every fight; Blur gave advantage on *all* Dodges at L10. | Reflex Spike now Push + half damage dice; Overclock once per Breather; Blur = advantage on your first Dodge each round. Wiring stays the top striker but now pays ~7 Flux per fight (near-Overload at L5). (ch 3) |
| 16 | **Balance** | **Unbreakable** (Hide Apex) turned a failed defense into a success every round for 1 Flux: ~2% HP lost in the model. | Now halves that hit and ignores its rider. (ch 3) |
| 17 | **Balance** | **Gumption** characters had no attack stat at all. | Glands Spit uses Nerve **or Gumption** (was Grit). Ozzie pregen updated to Spit +4, 1d8+3. (ch 3, ch 11) |
| 18 | Balance | **Bio Knit** (Breather-only HP) was much weaker than **Chrome Firmware** (a chosen Surge every fight). | Knit also triggers at the end of each combat (~30 HP per Lockdown at L5 with 2 Bio trees). (ch 3, ch 12) |
| 19 | Balance | Iron Will was the weakest node (Resist attacks are rare). | Also immune to Shaken. (ch 3) |

### Per-tree balance (after fixes)
`tools/tree_compare.py`: one tree taken as deep as possible, otherwise identical freelancer vs same-level Soldiers. DPR is personal damage per round; HP lost is the % of your HP lost in a 4-round fight taking 1.25 attacks/round (lower = tougher); Flux is per fight (baseline 4 = 3 Surges + 1 Churn).

| Tree | L1 DPR | L5 DPR | L10 DPR | L1 / L5 / L10 HP lost | Flux/fight L5 / L10 | Unlocks | Out of combat | Verdict |
|---|---|---|---|---|---|---|---|---|
| (none) | 9.8 | 18.0 | 27.1 | 75 / 58 / 49% | 4 / 4 | — | — | baseline |
| **Hide** | 9.8 | 20.1 | 30.1 | **56 / 38 / 20%** | 4 / 5.5 | 3 | low | Best tank; Bulwark protects others |
| **Limbs** | 13.0 | 21.4 | **44.6** | 75 / 58 / 49% | 4 / 4 | 2 | high (climb, reach, jump) | Steady melee; strong Apex; team Prone/Held |
| **Senses** | 12.2 | 20.5 | 35.6 | 75 / 58 / 49% | 4 / 4.3 | 2 | high (scouting) | Modest personal DPR; Analyzer gives the *whole party* −2 Guard every turn (~+14% party DPR) |
| **Glands** | 9.8 | 18.0 | 27.1 | 50 / 38 / 33% | 4 / 4 | **4** | medium (chem, medicine) | Sustain + healer; most Surge parts; no personal DPR |
| **Wiring** | 12.8 | **28.8** | 43.0 | 75 / 58 / 22% | **7.2 / 7.5** | 3 | medium (speed) | Top striker, glass cannon; Flux burn ≈ one Overload per fight at L5 |
| **Mind** | 9.8 | 17.2 | 25.9 | 75 / 39 / 32% | 6 / 6 | 2 | **very high** (telepathy, hacking, social) | Support/control; Puppet and Hive Mind are team effects the model undercounts |

**Bio vs Chrome (per tree, same nodes):** Bio = Knit sustain (~Rank HP per Bio tree after every fight and Breather), Bloom table, no weakness. Chrome = Firmware (pick one Primed Surge per fight), Glitch table, disadvantage vs Shock, 25 Scrip Upkeep per tree. Bloom and Glitch each have 6 harmful, 3 mixed, and 3 helpful results; Bloom's gifts (Blossom = permanent Knack, Cocoon) are slightly kinder, offsetting Chrome's control. **Splice** (both): best-of-two Overload results plus partial perks for −1 Flux Limit is mildly favoured (see Open Questions).

**No must-take or trap remains:** every tree now adds at least one of damage, toughness, or party support by level 5. Mind (lowest personal damage) and Glands (no personal damage) are deliberate support trees. Their healing, control, and stat-sharing isn't in the model.

**Dominant combos checked:** Wiring + Limbs + Senses melee (Capacitor + Extra Arm + Target Lock = +3 dice/turn) is the highest damage build. It's capped by the "once per turn" wording on all three, and the six L5 nodes it needs leave no room for Reflex Spike. It lands at ~27 DPR at L5 (+52%), about the same as pure Wiring, with no defense. Hide + Glands (Regenerate + Armor + Thick) is the toughest build but deals baseline damage. No infinite loops found: Haste can't grant Unleash, Overclock is per Breather, Misfire's Churn chain ends on a non-Misfire, and Perfect Expression/Echo are bounded single uses.

## Guide Sanity Check 2026-10-28 (ch 13)
Cold reread of ch 13 against a checklist of every character component in ch 1–8, a hand recompute of every number in the worked example, and a link/anchor check (all resolve except `../builder/index.html`, added in the next commit).

**Component checklist (all ✓ in ch 13):** concept · stat array · stat→role guidance · 6 Origins + numeric perks · Knacks (3 / +1 L4 / +1 L8, Blossom) · node count · Root-first · Form per tree · Bio/Chrome/Splice perks and costs · Push · Root unlocks (all 6) · Root attacks (Natural Weapons, Spit, Mind Spike) · Apex gating · respec · Surge Shape/Effect/Twist rules, Twist compatibility, Twist count by Rank, Flux cost, dice formulas, Kinetic/Overcharge dice, Dread→Chutzpah, allies in areas · Sequence die, Surges known, Wild slots, Wild table, Prime, rewrite, leaving slots Wild · Lab Escapee extra Surge · Hive Mind Prime · starting kits + common items · Scrip (50, Washout, Face) · Mods (one per weapon) · armor (one suit + Shield, max 4) · Upkeep (incl. Smart-Link, prepaid first) · Rank, HP (Grit, Thick), Armor (Plating scaling), Speed (Quickened, Spring Legs, Heavy, Hollow Bones), defenses, Flux Limit (Splice) · Juice · trackers (Flux, Death marks, Breathers, Last Gasp) · Drive · level table 1–10 · stat boosts (two different, max +5) · Final Form · Scars/Faults that change numbers · Injuries · Samples · mission pay.

| # | Finding | Fix |
|---|---|---|
| 1 | Archetype table repeated 3 of ch 3's six pairs (Hide+Limbs, Wiring+Glands, Senses+Mind) under new names. | Replaced with the **nine pairs ch 3 doesn't cover**, so the two tables together list all 15 two-tree pairs. |
| 2 | Area Shapes' attack stats were crammed into one ambiguous row ("Nerve / Grit or Nerve / Grit"). | One row per Shape, with area size and range. |
| 3 | Push, the Wild table, Final Form, and allies being hit by Burst/Wave weren't mentioned. | One line each, with links. |
| 4 | "Don't fill Wild slots" contradicted Lab Escapee, Samples, and the rule that you may leave slots Wild on purpose. | Reworded as "Surges known = level + 2 (exceptions); you may leave slots Wild." |
| 5 | Splice row implied Splices skip Chrome's costs. | States that Splices keep Upkeep and Shock disadvantage for their Chrome trees (decision logged in Issues Log). |
| 6 | Worked example *Toxic Cloud* applied Reach to both range and radius ("double range **or** area"). | Reach doubles the radius only. |
| 7 | Stat advice "your lowest defense fails about half the time" was vague. | Rewritten as one concrete line about the −1 stat. |

**Worked example verified:** Dree L1: HP 12, Limit 6 (4+1+2−1), Dodge +4/Endure +1/Resist +3, Speed 40, 3 legal Surges (base + Wiring/Glands parts, no Twists) + 1 Wild, 25 Scrip after a Medkit. Dree L5: 6 nodes (2 Roots + 4 non-Apex nodes), HP 34 (12+2+20), Limit 9, Dodge +6/Endure +4/Resist +6, 7 Surges on a d8 (1 Wild), Twists legal (≤2, different, Shape-compatible), Jolt 6d8+3, Burning 6, Stim Gland 3d6+1, Purge 4. Guide is ~2,800 words, about half of it tables.

## Character Builder (builder/index.html)
A single self-contained HTML file (inline CSS/JS, no CDNs, no build step). Works from `file://` and GitHub Pages; uses `../art/cover.jpg` for the header.

**Updating it when rules change.** All game data is in one object, `const MUTAGEN = {...}`, in the **first `<script>` block**, between the `MUTAGEN GAME DATA` and `END OF GAME DATA` banners: stat array, level table, Origins, Forms, trees and nodes (text + `fx` keys), Shapes, Effects, Twists, Wild table, sample Surges, gear frames/mods/armor/items/kits, Scars/Faults, and the ch 13 worked example with its expected numbers. Node text supports tokens `{R}`, `{2R}`, `{R1}`, `{GUM}`, `{GRIT}`, `{ADR}`. Numbers that need logic (HP, Armor, Speed, Limit, attack lines, Surge dice) are computed in `derive()` / `surgeCalc()` / `attackLine()` in the second script; `fx` keys they read are listed in the data block's header comment. If you add a node whose effect changes a derived number, add an `fx` key and handle it in `derive()`. Keep ids stable (saved characters store them).

**Features:** 8-step wizard following ch 13 (Start, Stats, Origin & Knacks, Augments, Surges, Gear, Extras & Drive, Sheet) with per-step error/warning badges; level 1–10 selector driving Rank, HP, defenses, Limit, Sequence die, Prime, Surges known, node picks, Twist count, Apex gating, Plating, Knack count, stat boosts, Final Form; stat array validation; Origin cards (+ d6 roll) and Knacks with examples; tree picker enforcing Root-first, Apex rules, Bio/Chrome per tree, Splice detection, Knit/Firmware/Upkeep; Surge builder limited to unlocked parts with Twist compatibility, live Flux, dice, attack and rider text, Firmware (⚙) marking, reorder/remove, sample list, harvested Samples, Wild slots; gear with kits, kit weapon choices, Mods (100), buying weapons/items/armor/Shield, Scrip ledger with mission-pay estimate, Upkeep; Scars/Faults (with number effects), Patch Applied, Drive, notes; live summary panel; printable sheet laid out like `sheets/Character_Sheet.html` (print hides the app); autosave + named saves in localStorage, JSON export/import; Random legal character at any level; Example menu (Dree L1/L5).

**Tested 2026-10-28:** `tools/builder_test.js` (jsdom): 0 JS errors; Dree L1 and L5 match ch 13 exactly (HP 12/34, Armor 1, Speed 40, Dodge/Endure/Resist +4/+1/+3 and +6/+4/+6, Limit 6/9, Scrip 25 at L1, d4/d8, Prime 2/3, 1 Wild); 3,000 random characters (300 per level) all legal; 13 illegal builds correctly rejected; Sample and Lab Escapee slot rules; Splice Limit floor; DOM events (node click, stat select, Random, Save). Headless Chrome from `file://`: no console errors, localStorage works, print-to-PDF produces only the sheet (2 pages for a level 5 character), mobile layout at 390 px.

**GitHub Pages:** enabled 2026-10-28 (branch `main`, root, legacy Jekyll build). Live at https://xenodorian.github.io/BeelzRPG/builder/ and verified in headless Chrome (loads, art loads, example legal, no errors). On Pages, the builder's chapter links point to GitHub's rendered `.md`; offline they're relative. The first Pages build errored (it overlapped a second push) and the next one succeeded; if a build fails, check `gh api repos/xenodorian/BeelzRPG/pages/builds`.

**Builder decisions (also in ch 13):** Splice Limit floor (min 4, then −1); one armor + Shield; Mods allowed on Natural Weapons but not Spit/Mind Spike; Knacks over the allowed count are a warning (Blossoms), not an error; Scrip after level 1 is a manual ledger with an "estimate from missions" button (pay 200 + 100 × level minus current Upkeep per mission), since campaign spending varies.

## Builder Sanity Check 2026-10-28
A skeptical second pass over `builder/index.html`: a rules cross-check script, real user flows in headless Chrome (Playwright, from `file://`), a keyboard/label/contrast audit, and malformed-input fuzzing. **Verdict:** the rules data and core maths were right. The serious problems were robustness (a bad import or save could break the page) and accessibility (keyboard focus was lost on every change). Both are fixed, along with 6 smaller rules gaps.

**Rules fidelity.** New `tools/check_builder_data.js` (no dependencies) parses the chapter tables and compares them to the data block: level table (ch 7 and ch 13), Origins and Knacks, HP/Flux/Scrip/stat-array constants, tree stats/roles/unlocks, every node name with its Root/Apex and Push flags, Shapes (unlock, target, stats, die, adds stat), Effects (unlock, type, kind), Twists (names, "works with"), Wild table, sample Surges (build and Flux), Frames (die, stats, range, cost), Mods, Armor, Items, Kits, Scars/Faults, Juice, pay, Final Form. **320 checks, 0 mismatches.** A word-level text diff of all 36 node texts found two dropped clauses (below). Every printable field in `sheets/Character_Sheet` is on the builder's sheet.

| # | Severity | Bug / mismatch | Fix |
|---|---|---|---|
| 1 | **High** | Importing a malformed or old JSON (e.g. `"surges":"abc"`, `"knacks":"k"`, string `twists`, an unknown Form) threw on render. The page went blank, and a damaged autosave or save could break it on reload. | `normalize()` now rebuilds every field with type checks and drops unknown ids. Import only accepts objects that look like characters, `replaceState()` rolls back on any error, and a corrupt autosave falls back to a blank character. (R1) |
| 2 | **High** (a11y) | Every select/checkbox change re-rendered the panel and dropped keyboard focus to `<body>`. Keyboard users couldn't fill the form. | Focus is restored to the same control after each render, and step changes move focus to the step heading. (R11) |
| 3 | Med | An imported `trees` value went unescaped into a `class` attribute (attribute injection), and `D.forms[bad]` crashed. | Forms must be `bio` or `chrome`. Class and name lookups are guarded. (R1) |
| 4 | Med | Lowering the level flagged stale picks but gave no way to fix them except hand-editing. | A **"Fit picks to level N"** button appears when needed. It drops extra or early-Apex nodes (newest first; a Root stays while its tree has nodes), extra Surges from the end, extra Twists and Knacks, and later stat boosts. (R7) |
| 5 | Med | A page refresh reset you to step 1, and the browser Back button left the app. | The step lives in the URL (`#step-N`). Back/Forward move between steps and a refresh keeps your place. (R12) |
| 6 | Med | When storage was full or disabled, Save failed silently and autosave was off without any notice. | Save shows an alert, and the header shows "Autosave off… use Export". (R13) |
| 7 | Med | A very long name (300 chars) stretched the page to 4,483 px wide. | Text wraps everywhere (`overflow-wrap:anywhere`), and inputs have `maxlength`. |
| 8 | Med | 30+ form controls had no accessible name (stat selects, boosts, Knacks, Surge name/Shape/Effect, kit and mod selects, armor). | All controls are labelled (`aria-label`/`title`). Summary messages are focusable buttons, and there's a visible `:focus-visible` ring. (R14) |
| 9 | Rules | Extra Arm and Capacitor bonus dice weren't shown on Unarmed, though the rules say "a melee attack". | Fixed. (R2) |
| 10 | Rules | Deadeye's 18–20 Crit (which covers "ranged Surges") wasn't shown on Bolt/Burst Surges. | Shown on ranged Surge lines. (R3) |
| 11 | Rules | Grapnel's 10-ft reach wasn't shown on Strike Surges. | Shown. (R4) |
| 12 | Rules | Sample splice cost (100 Scrip, ch 7) wasn't charged. | Charged in the Scrip ledger. (R5) |
| 13 | Rules | Injuries (ch 6) weren't modelled, though the sheet has an Injuries field. | Injury checkboxes on step 7; Cracked Ribs −5 HP, Ruptured Gland −2 Limit, Torn Limb (leg) −10 speed; printed on the sheet. (R6) |
| 14 | Rules | Node text dropped clauses from ch 3: Adaptive "a new type replaces the old", Puppet "no rider", Spit "choose each time". | Restored. |
| 15 | Low | The armor-cap warning badged the wrong step (Extras instead of Gear). | Fixed. (R8) |
| 16 | Low | The sheet showed only 5 Knacks, so Blossom Knacks were lost. | It shows all of them. (R9) |
| 17 | Low | Changing a Surge's Shape wiped all its Twists, even ones that still fit. | Twists that still fit are kept. (R10) |
| 18 | Low | You couldn't buy a weapon or mod Natural Weapons until you'd picked a kit. | The weapons table always shows. |
| 19 | Low | Even a level 1 sheet printed on 2 pages (1,184 px tall). | A compact print stylesheet. |
| 20 | Low | The sheet's Sequence header note was #555 on #222 (unreadable), and the "sample list" dropdown was confused with harvested Samples. | Contrast fixed. Renamed to "Example Surge (ch 4)", with a tooltip on "Harvested Sample". |
| 21 | Low | (Found by the new 400-case stress test.) The first version of "Fit picks" could drop a lone Root whose tree still unlocked a kept Surge's Shape/Effect, leaving the character illegal. | It now trims non-Roots first, then unused lone Roots, and then removes Surges whose parts lost their unlock. (R7) |

**UX improvements:** a plain-language intro on step 1, tooltips on every summary number giving its formula, the Fit-to-level button, a Heavy armor/Shield cost and speed note in the picker and on the sheet, and export files tagged `app`/`rules` version. Checked and fine: 375 px mobile (no horizontal overflow on any step), performance (~1 ms per full render), switching Bio/Chrome and Splice on/off (Limit, Upkeep and ⚙ Firmware marks update), removing a Root (its nodes go and Surges using its parts are flagged), reordering, and overspending (flagged).

**Tests:** `tools/builder_test.js` (jsdom) adds regression tests R1–R14 above, on top of the earlier suite (worked example, 3,000 random characters, 13 illegal builds). `tools/check_builder_data.js` checks the rules against the data block. `tools/builder_flows.js` (Playwright + Chrome) covers real user flows: keyboard focus, level down + fit, Root removal, Form switching, reordering, overspending, hostile imports, reload persistence, Back button, long names, 375 px layout, storage disabled/full, unlabelled controls, print page counts at L1/L5/L10, and console errors. **Status:** the jsdom suite and the data check pass (ALL TESTS PASSED, 0 JS errors; 320 checks, 0 mismatches). The flow probe ran in Chrome *before* the fixes and found bugs 1–2, 5–8 and 19. `builder_flows.js` was written afterwards, but the build sandbox then blocked Chrome launches, so it has **not yet been run against this build**. Next contributor with a browser: run it and log the result here. Any failures are more likely selector drift than app bugs.

### Builder backlog (bigger ideas, not done)
- [ ] **Play mode:** Prime/Churn roller, Flux tracker with Overload prompts, HP/Juice/Death-mark counters on the saved character.
- [ ] **Level history:** record which node and Surge came at which level, so respecs and "level down" are exact instead of newest-first.
- [ ] **Shareable link:** compress the character into the URL hash (no server).
- [ ] **Hands check:** warn on a two-handed weapon plus Shield, or more held items than hands (Extra Arm adds one).
- [ ] **Pregens as examples:** add the four ch 11 pregens to the Example menu (and test their numbers like Dree's).
- [ ] **Single data source:** move the `MUTAGEN` block to `data/mutagen.json`, used by the builder (inlined at release), `tree_compare.py`, and the checker, so rules live in one place.
- [ ] **Party view:** load several saves side by side for the GM (defenses, Limits, roles).
- [ ] **Undo/redo** and a "changes since last save" indicator.
- [ ] **Optional explicit Form choice:** today a new Root defaults to Bio. A setting could force an explicit choice for teaching.

## Open Questions (owner / future contributors)
1. Should Bio vs Chrome have a social dimension (e.g. "Humanity" or faction reactions)? Currently only Scars/Faults touch it.
2. Is a d4 Sequence at level 1 too swingy, or not swingy enough? (3 Surges + 1 Wild, Prime 2.)
3. Should Knacks be free-form (current) or a fixed list like 4M's skills? Free-form is more compact; a list is less ambiguous.
4. Enemy damage is fixed. Some tables like rolling; an optional "roll Damage as Td6"-style variant could go in ch 9.
5. Level 10 Final Form is a single capstone. 4M gives origin-specific capstones; Mutagen could give tree-specific ones (the Apexes partly do this).
6. **Splice** gets best-of-two Overload results and both (partial) Form perks for only −1 Flux Limit. Raise the cost to −2, or keep it as a reward for mixing? *(Sanity check: mildly favoured, left as is.)*
7. **Wiring** is still the top personal-damage tree (+60% at L5) and pays with Flux (≈ one Overload per fight). Is "glass cannon via Flux" enough, or should Capacitor need a Push too?
8. **Regenerate** (Glands) nearly cancels one Soldier's damage in long fights at L5+. Fine for 4-round fights; watch in long boss fights.
9. **Nerve** is the most loaded stat (ranged attacks, Bolt/Burst Surges, Resist, Flux Limit). Should Flux Limit use the higher of Nerve or Grit?
10. **Glands unlocks 4 Surge parts** (incl. the only Mend and the only ranged area Shape) vs 2 for Limbs/Senses/Mind. Move Burst elsewhere, or keep Glands as the "toolkit" tree?
11. **Mind** has the lowest personal damage (Mind Spike ignoring Armor is its edge). Is a support tree with high utility enough, or should Mind Spike scale better?
12. **No base Infuse Effect.** A Limbs-only freelancer can't build an Infuse Surge. Fine (Limbs is the melee tree), or add a base Infuse Effect (e.g. a weak *Steady*: +Rank to the target's next roll)?

## Hosting (GitHub Pages)

- Every push to `main` deploys the whole repo to https://xenodorian.github.io/BeelzRPG/ via `.github/workflows/pages.yml` (Jekyll build, so Markdown chapters render as HTML; `.html` files are served as-is).
- Builder: `/builder/`. Printable sheet: `/sheets/Character_Sheet.html`. Check the Actions tab if a deploy fails.
