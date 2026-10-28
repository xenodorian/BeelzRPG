# Current_Work.md — Mutagen Project Hub

> **Start here.** This is the shared task list, design log, style guide, and glossary for anyone (human or AI) contributing to **Mutagen**. Check boxes when a task is done, add a dated line to the **Issues Log** when you hit a problem or make a call, and keep edits to *your* chapter file to avoid merge conflicts.

## Status (2026-10-28)
**Playable v0.1.** All 13 chapters, character sheets, starter mission with 4 pregens, and 8 placeholder images are in. Math pass and two playtest walkthroughs are done (below). Needs real table playtesting.

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
| `sheets/Character_Sheet.md` / `.html` | Fillable/printable sheet | |
| `art/*.jpg` | AI-generated placeholder art (8 images) | Replace freely |
| `tools/balance_sim.py` | Monte Carlo combat sim | Re-run after number changes |

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
| **Churn** | Quick action: +1 Flux, roll one more Prime | Ch 4 |
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

### Quality
- [x] Math pass: hit/defense odds per level, damage vs HP, encounter budget (see Balance)
- [x] Glossary: every capitalized game term defined
- [x] Playtest walkthrough: L1 and L5 rounds (see Playtest)
- [x] Consistency pass: link/anchor check (0 broken), cross-chapter numbers
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
- 2026-10-28 — `git commit` failed: no author identity on the box. Set the repo-local identity to the owner's GitHub noreply address.
- 2026-10-28 — Homebrew `.docx` files were read via python-docx (text + tables). The 15.6 MB 4M doc is mostly images; only text was used. Takeaways: d20 + modifiers, player Dodge rolls instead of AC, simultaneous enemy turns, "Required" root boons in subdomains, grievous injury tables, GM reward tokens (Dimes → **Juice**), levels per mission, cap level 10, corporate dispatcher premise (ATRaC, M.O.T.H. → **GRAFT**).
- 2026-10-28 — Tree unlock counts are uneven (Glands unlocks 4 parts, Limbs/Senses/Mind 2). Accepted: Glands nodes are utility-heavy. Revisit after playtest.
- 2026-10-28 — Mission pay was inconsistent (ch 7 said 100 × level, starter mission paid 300). Unified to **200 + 100 × level**.
- 2026-10-28 — Clinic Rat perk "installs cost nothing" was meaningless (installs are free on level-up). Changed to half-price Scar/Fault removal.
- 2026-10-28 — Area Surges hitting allies said "success = no damage" while enemy Area said half. Unified to half.
- 2026-10-28 — Wild #1 *Misfire* and #12 *Perfect Expression* had unclear timing; rewritten.
- 2026-10-28 — Playtest fixes: missed Strike/Bolt Surges stay Primed; Wild dice never Amp; Spore Bloom spares the user; Blood Price +3 → +2 dice; Feedback 30 → 20 ft; Militia initiative wording.

## Open Questions (owner / future contributors)
1. Should Bio vs Chrome have a social dimension (e.g. "Humanity" or faction reactions)? Currently only Scars/Faults touch it.
2. Is a d4 Sequence at level 1 too swingy, or not swingy enough? (3 Surges + 1 Wild, Prime 2.)
3. Should Knacks be free-form (current) or a fixed list like 4M's skills? Free-form is more compact; a list is less ambiguous.
4. Enemy damage is fixed. Some tables like rolling; an optional "roll Damage as Td6"-style variant could go in ch 9.
5. Level 10 Final Form is a single capstone. 4M gives origin-specific capstones; Mutagen could give tree-specific ones (the Apexes partly do this).
