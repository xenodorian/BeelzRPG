# Current_Work.md — Mutagen Project Hub

> **Start here.** This is the shared task list, design log, style guide, and glossary for anyone (human or AI) contributing to **Mutagen**. Check boxes when a task is done, add a dated line to the **Issues Log** when you hit a problem or make a call, and keep edits to *your* chapter file to avoid merge conflicts.

## Status (2026-10-29)
**Final pass done (2026-10-29, owner request):** rules and builder review, a battle-simulator stress test (600 seeded runs + random-click fuzz in Chrome) and a **single-file edition**, `Mutagen.html` (rules + builder + arcade + sheet in one offline file). See *Final Pass 2026-10-29* below.

**Arcade v2 done (2026-10-29, owner request): battle map + RPG menus.** Fights are now played on a virtual-tabletop grid with movement, real ranges, area templates, JRPG-style command menus that auto-switch between freelancers, a turn-order bar and HUDs for the active freelancer and targeted enemy. See *Arcade v2: battle map* below.

**Arcade mode done (2026-10-29, owner request):** `arcade/` is a playable battle simulator, *Gauntlet mode*. You build a party (5/4/3 freelancers for Easy/Medium/Hard), then each level runs minion fight → boss fight → level-up from 1 to 10, ending with Patient Zero. Parties and characters can be saved. See *Arcade: Gauntlet mode* below.

**Enemy calibration done (2026-10-28, owner request):** every enemy now has a **Boss Rating** and a **Minion Rating** from simulated fights with real builder characters (party sizes 2–6), the threat table was recalibrated (v0.3), the roster is 30 creatures + 3 Bosses with Heavies (AoE) and Packs, and the encounter budget, party-size and difficulty rules come from the sims. See *Enemy Calibration* below; the v0.2 table in D6 is superseded.

**v0.2 done (2026-10-28): Base Forms & Evolution.** The owner dropped the compactness rule. Five Base Forms, 10-node trees, Evolutions at L4/L7, Signature Surges, a Final Form stage and a rebalanced threat table. Every chapter, the sheets, the builder (v0.2) and the tools are updated. The spec is *v0.2 Design* below; results are in *Balance v0.2* and *Playtest v0.2*. The v0.1.1 history (sanity checks, builder) is kept further down for reference.

## v0.2 Design: Base Forms & Evolution (2026-10-28)
**Owner request (verbatim summary):** drop "keep it simple". 5 Base Forms, each fixing a primary (+3), secondary (+2) and tertiary (+1) stat, with the +0 and −1 going to the dump stats. Evolution 1: +2 primary and +1 to all others. Evolution 2: +3 primary and +1 to all others. Trees of 10 nodes each. A Form grants 3 primary-tree nodes, 2 secondary and 1 tertiary. Each level adds 1 primary node automatically, plus a choice of a secondary or tertiary node. Form-exclusive unlocks on the primary tree at levels 4 and 7. Each Evolution: +1 Prime, a jump in Sequence die size, and one always-ready Surge. Rebalance all challenges. Update the builder too.

This section is the **spec**. Chapters implement it; when they disagree, fix the chapter and log it.

### D1. The five Base Forms
Each stat is primary for exactly one Form, secondary for one and tertiary for one (a Latin square, so no stat is everyone's dump). Each Form's primary tree follows its primary stat. *Revised during balancing:* the first square (tertiary = next stat) left the Oracle with both Dodge and Endure as dump stats (147% of its HP lost in `tree_compare.py`'s solo fight) and the Alembic with Flux Limit 4. The square used now (tertiary = previous stat) gives the Oracle Moxie +1 and the Alembic Nerve +1, and makes the Siren the low-Nerve, reckless Flux-burner.

| Form | Primary +3 | Secondary +2 | Tertiary +1 | Dump (+0 / −1, your choice) | Primary tree | Secondary tree | Tertiary tree | L4 exclusive | L7 exclusive | Stages (Base → Evo I → Evo II → Final) |
|---|---|---|---|---|---|---|---|---|---|---|
| **Juggernaut** | Grit | Nerve | Chutzpah | Moxie, Gumption | Hide | Limbs | Glands | Siege Hide | Fortress | Juggernaut → Rampart → Colossus → Citadel |
| **Skitter** | Moxie | Gumption | Grit | Nerve, Chutzpah | Wiring | Limbs | Senses | Mantis Reflex | Lightning Step | Skitter → Mantis → Wraith → Livewire |
| **Oracle** | Nerve | Chutzpah | Moxie | Grit, Gumption | Senses | Mind | Wiring | Foresight | Thousand Eyes | Oracle → Argus → Seraph → Panopticon |
| **Alembic** | Gumption | Grit | Nerve | Moxie, Chutzpah | Glands | Hide | Mind | Transmute | Panacea | Alembic → Still → Bloomheart → Wellspring |
| **Siren** | Chutzpah | Moxie | Gumption | Grit, Nerve | Mind | Wiring | Limbs | Siren Song | Crown of Will | Siren → Diva → Choir → Crowned |

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

> **Superseded 2026-10-28 by threat table v0.3** (see *Enemy Calibration*): the v0.2 table was too soft against real builder characters.

## Balance v0.2 (2026-10-28)
`tools/balance_sim.py` (seed 7; 4 freelancers: Juggernaut, Skitter, Oracle, Siren; 2,000 fights per cell, starting each fight at 35% Flux; it ignores riders, healing, Wild Surges and tactics, so treat it as a floor for the players). Read each pair of columns as **before → after** an Evolution: L3 → L4 (Evolution I), L6 → L7 (Evolution II), L9 → L10 (Final Form).

| | L1 | L3 | **L4** | L6 | **L7** | L9 | L10 | L10 + Final Form |
|---|---|---|---|---|---|---|---|---|
| Primary attack vs same-T Guard (hit %) | +4 vs 12 (68%) | +5 vs 14 (63%) | **+7 vs 14 (72%)** | +8 vs 16 (68%) | **+12 vs 17 (81%)** | +13 vs 19 (77%) | +13 vs 20 (72%) | +15 vs 20 (82%) |
| Defense success vs TN | 55% | 55% | **62%** | 58% | **64%** | 59% | 60% | 60% |
| 4 Soldiers (Standard): rounds / party HP lost | 3.2 / 20% | 3.9 / 24% | **3.4 / 15%** | 4.1 / 24% | **3.3 / 13%** | 4.0 / 23% | 4.5 / 29% | — |
| Boss alone (Standard) | 2.6 / 18% | 3.4 / 21% | **3.1 / 15%** | 3.8 / 22% | **3.0 / 13%** | 3.6 / 20% | 4.1 / 25% | — |
| Brute + 2 Soldiers (Standard) | 2.9 / 16% | 3.6 / 20% | **3.2 / 13%** | 3.9 / 21% | **3.1 / 11%** | 3.7 / 20% | 4.2 / 24% | — |
| Elite + Soldier + 4 Mooks (Hard) | 4.0 / 35% | 4.6 / 37% | **3.9 / 22%** | 4.5 / 31% | **3.6 / 18%** | 4.2 / 28% | 4.7 / 35% | — |
| Boss + 4 Mooks (Deadly) | 4.7 / 39% (TPK 2%) | 5.5 / 41% | **4.5 / 25%** | 5.4 / 35% | **4.2 / 21%** | 4.9 / 32% | 5.5 / 39% | 4.7 / 29% |
| 6 Soldiers (Deadly) | 5.4 / 56% (TPK 13%) | 6.5 / 61% (TPK 10%) | **5.2 / 37%** | 6.8 / 61% (TPK 12%) | **4.9 / 32%** | 6.4 / 57% (TPK 5%) | 7.3 / 69% (TPK 10%) | — |

*v0.1 for comparison (4 Soldiers): 3.7 / 25% (L1), 4.0 / 24% (L5), 4.3 / 26% (L10).*

- **The shape is a sawtooth by design.** Each Evolution drops the cost of a Standard fight by about 40% (24% → 15% at L4, 24% → 13% at L7). The threat table then climbs faster than the party inside a stage (T4 and T7 Guard stall, T5–6 and T8–10 rise 1 per T), so by the end of the stage fights cost what they did before. Hit chance follows the same sawtooth (63% → 72%, 68% → 81%).
- **Final Form** turns the hardest L10 fight from 39% into 29% HP lost: one rout per Lockdown.
- **Deadly is really deadly late in a stage** (6 Soldiers at L6: TPK 12%). The ch 10 budget table says so.

**Per-Form model** (`tools/tree_compare.py`, one freelancer vs one same-T Soldier per round; DPR / HP lost per 4-round fight / Flux Limit):

| Form | L1 | L3 | **L4** | L6 | **L7** | L10 |
|---|---|---|---|---|---|---|
| Juggernaut | 11 / 48% (7) | 14 / 45% | **20 / 40% (9)** | 23 / 44% | **34 / 34% (12)** | 36 / 51% (13) |
| Skitter | 10 / 68% (5) | 12 / 60% | **21 / 45% (7)** | 24 / 54% | **50 / 28% (10)** | 51 / 41% |
| Oracle | 10 / 110% (8) | 12 / 83% | **20 / 66% (11)** | 22 / 73% | **38 / 60% (16)** | 42 / 77% |
| Alembic | 10 / 50% (6) | 13 / 45% | **22 / 30% (8)** | 26 / 41% | **41 / 0% (11)** | 42 / 0% |
| Siren | 7 / 90% (4) | 9 / 73% | **17 / 60% (6)** | 20 / 69% | **46 / 59% (9)** | 53 / 76% |

- The Oracle and Siren are fragile by design (dump Grit / low Limit); the Siren's early DPR doesn't count Haste/Rally support. Alembic's 0% counts Panacea's party healing as personal. Skitter's L7 jump is Lightning Step (after the half-dice fix).

## Playtest v0.2 (2026-10-28)
Written playtests with real dice (seeded, `/tmp/pt/play.py` during the session) using builder-verified characters: the ch 11 pregens at L1, then Rook, Vex, Juno and Dree rebuilt at L4 and L7 in the builder (all legal; numbers below come from `derive()`). Simplifications: players act first; no riders, healing, Knit, Purger or Swallow; each PC takes its best Surge, Signature or weapon. 400-seed averages are given after each narrated run.

### L1 — *Pumpstation 9* Pump Hall: Rook, Vex, Juno, Mags vs 2 Scrapjack Pickers + 4 Spill Rats (Standard 4)
- **Numbers:** Rook HP 20, Armor 2, Sledge +4 2d10+3 (Extra Arm); Vex HP 14, Dodge +4, *Mantis Lunge* +4 3d10+3; Juno HP 10, Limit 8, rifle +4; Mags HP 12, Limit 4, *Nightmare* +4 2d8+3.
- **Round 1:** Rook Unleashes *Piston Slam* (22 vs 13): 24 damage, Picker A dead. Vex's *Mantis Lunge* (22 vs 13) kills Picker B. Juno's *Neural Spike* misses the Rats (stays Primed). Mags's *Nightmare* kills a Rat. Rats bite: one hits Rook for 3 − 2 Armor = 1.
- **Rounds 2–3:** weapons mop up the Rats. **3 rounds, 2% HP lost.** 400-seed average: **2.8 rounds / 9%** (a soft Standard: the four Mooks die to any hit). Spill Rats' Mutagenic Flux isn't modelled.
- **Read:** L1 Surges feel like a big deal: a Strike Surge one-shots a Picker (13 HP). Mags at Limit 4 used one Surge and stopped, as designed.

### L4 — first fight after Evolution I: Rook (Rampart), Vex (Mantis), Juno (Argus), Dree (Diva) vs Mirrormaw (T4 Elite) + 2 Cleaner Hounds (Standard 4)
- **Numbers (builder):** Rook HP 45, Armor 3/6 (Siege Hide), Endure +7, *Wall Slam* Signature +7 3d10+5 Held; Vex HP 31, Dodge +7, Mantis Reflex; Juno HP 27, Limit 11, Resist +7, *Lockdown Shot* Signature +7 3d8+5 Blinded, Foresight; Dree HP 27, Limit 6, *The Broadcast* Signature +7 3d6 Psychic (Wave, Area).
- **Emergence:** everyone gains 8 temp HP; the Mirrormaw and both Hounds are Shaken; each first Signature is Amped.
- **Round 1:** Rook's *Ram* (15 vs 15) deals 30: Hound 1 dead. Juno's Amped *Lockdown Shot* takes Hound 2 to 12. Vex and Dree miss. The Shaken enemies hit Dree once (11, mostly temp HP) and Rook once (9).
- **Round 2:** Rook's *Wall Slam* kills Hound 2. Juno's *Lockdown Shot* hits the Mirrormaw again (61 left).
- **Rounds 3–4:** Vex's Overcharged *Overclock Lunge* lands for 38, Juno for 14, Rook finishes it in round 4. **4 rounds, 14% HP lost**; Dree ended at 13/27 with Flux 6/6.
- **400-seed averages:** with Emergence **3.0 rounds / 3%**; without Emergence (a later fight) **3.0 / 13%** (the sim says 3.4 / 15%).
- **Read:** the Evolution lands. Every PC has a reliable once-per-round big hit, the Signature is what everyone reaches for, and Emergence makes the first fight a victory lap. Dree (Siren) hits her Limit by round 3: the Siren's weak point shows up exactly as designed.

### L7 — first fight after Evolution II: Rook (Colossus), Vex (Wraith), Juno (Seraph), Dree (Choir) vs Feral Evolved (T7 Elite) + Gutter Leviathan (T7 Brute) (Standard 4)
- **Numbers (builder):** Rook HP 72, Armor 4/6, Endure +12, Rend claws +12 4d12+8 (+1 die Extra Arm), Fortress; Vex HP 48, Dodge +12, *Thunderclap* Signature (Strike + Kinetic + Overcharge) +12 8d10+8; Juno HP 44, Limit 16, rifle Crit 17–20 (Deadeye + Thousand Eyes), *Headshot* Signature +12 8d8+8; Dree HP 44, Limit 9, *Blackout* +12 7d8+8.
- **Round 1:** Rook's *Riot Cap* (47), Vex's Amped *Thunderclap* (53), Juno's Amped *Headshot* (35) and Dree's *Blackout* (50): the Feral Evolved (144 HP) dies before it acts, so it never Emerges.
- **Round 2:** the Leviathan's Swallow misses Rook (Endure 24 vs TN 16). Rook (38 after Armor 3), Vex (54), Juno (44) and a Dree Crit (69) kill it. **2 rounds, 0% HP lost.**
- **400-seed averages:** with Emergence **2.6 rounds / 1%**; without **2.6 / 5%**. With Signatures limited to no Twists: 2.7 / 5%, so Twist-heavy Signatures aren't the cause.
- **Read: the alpha strike is the risk at Evolution II.** Four optimised L7 freelancers deal ~150–185 a round, more than any single T7 Elite or Brute (144). This isn't new in v0.2: a focused Elite dies in 1–2 rounds at every level. But at L7 the overkill is largest, and "two big targets" encounters give the enemy only 3 attacks a round. **Fix applied (no threat-table change):** ch 10 now tells GMs that from Evolution II lone Elites and Brutes melt, so they should spend at least half the budget on 3+ bodies. The Feral Evolved got a **damage gate**: the first time it would drop below half HP it stops at half and Emerges, so it can't die before it acts. Logged as Open Question 15 for live play.

### Findings
1. **Evolution feels huge.** In every L4/L7 fight the Signature was the most-used action, and Emergence's temp HP + Shaken made the first fight a rout. This is the owner's "drastic power increase", working as asked.
2. **The Siren's Limit** (4 / 6 / 9) runs out on round 3 at every stage. That's intended (she Overloads), but it's the most common "nothing to do" moment. See Open Question 13.
3. **Builder validation caught two of my own test-build errors** (Weak Spot before 3 Senses nodes; a Pulse Surge with no Hide tree), and Fit-to-level repaired L7 → L4 and L7 → L1 builds. The gates are easy to break by hand, so the builder earns its keep.
4. **Signature riders every round** (*Lockdown Shot* re-Blinds the same Elite each round) can lock one non-Boss for a whole fight. Bosses shed a condition each Enemy Phase. See Open Question 14.
5. **L7 alpha strike** vs lone big targets (above): guidance added to ch 10.

## Enemy Calibration (2026-10-28)
**Owner request (verbatim):** "Create a series of enemies for these characters to fight at different levels. Create a Boss Rating for your enemies based around 1 creature vs a party of 4 fully rested players, and a Minion Rating based around 4 fully rested players vs 4 enemies of this rating. Give some enemies big AOE attacks that make them lethal to large parties but less effective as part of a horde of minions, and other enemies perks that give them advantages that only apply when in groups to increase their effectiveness when used as minions. then run simulated battles for a party of 3, 4, and 5 players, battle test your assumptions, and then recalibrate from there."

### Definitions
- **Boss Rating (BR N):** one creature alone is a fair fight for 4 fully rested level-N freelancers. **Minion Rating (MR N):** four of them are.
- **Fair band** (used everywhere: rating, tuning, validation): party win ≥ 90%, P(at least one freelancer Down) 40–60% (target 50% for 4; for P freelancers the same per-freelancer risk, 1 − 0.5^(P/4)), P(any death) ≤ 5%, 3–7 rounds; HP lost is reported (typically 30–45%). A rating is the fractional party level where the fight first satisfies the Down, death and win limits (linear interpolation between levels; past L1/L10 extrapolated with a minimum slope, so <1 and 10+ are "off the scale").
- **Fully rested:** full HP, Flux 0, Medkits/Stims full, Prime rolled; Last Gasp, Emergence and Final Form off.

### The simulator (`tools/encounter_sim.py`)
- **Party:** P characters of distinct random Forms (a 6th repeats one) drawn from `sim_data/pcs.json` (ch 11/13 examples + the better half of 3,000 random legal builder characters per Form and level, exported by `export_pcs.js`).
- **PC AI:** best Primed Surge or Signature by expected value (hit × damage × targets caught, minus a Flux cost), else best weapon; heals Down allies first; Churn when nothing is Primed; never Overloads by choice. Form exclusives modelled (Fortress, Lightning Step, Foresight, Panacea, Siren Song, Crown of Will, Transmute, Siege Hide/Thousand Eyes via builder numbers).
- **Positioning (abstract):** an enemy Area catches its target plus each other freelancer with probability 0.30 / 0.45 / 0.65 (10 / 20 / 30 ft), +8% per freelancer above 4 (crowding); Down freelancers can be caught (Death marks). Friendly fire catches each melee ally with the same odds. PC Areas catch each extra enemy 35–45%.
- **Friction:** 15% of PC turns and 10% of enemy actions do nothing (moving, line of sight).
- **Not modelled:** terrain, objectives, retreat, Juice, Last Gasp, Knacks, Help/Rally, GM targeting beyond "focus/pack/random", Breathers between fights.

### Expectations vs results
Written before the roster sims (`tools/sim_results/00_expectations.md`).

| # | Expectation | Result | Verdict |
|---|---|---|---|
| E1 | Soldier MR ≈ T, BR ≈ T − 3 | MR = T + 0.1, BR = T − 3.1 (T2/5/8) | **Confirmed** |
| E2 | Boss BR ≈ T, MR ≈ T + 3 | BR = T + 0.8, MR = T + 4.5 | Confirmed (BR one higher than T, written as T + 1) |
| E3 | Heavies get relatively deadlier vs 5 than vs 3 | 4 → 5 freelancers: Heavy BR drops ~0.7 and MR ~0.5, others ~1.0 and ~1.1 (6: −0.9 vs −1.45). Vs 3 the BR rise is equal (+0.9), the MR rise much smaller (+0.4 vs +1.5) | **Confirmed for big parties** (→ rule: Heavies vs 5+ ×1½ units) |
| E4 | Heavies weak as minions (gap MR − BR ≤ 2) | First pass: Leviathan 4.4, Gas Bloat 2.7. After recalibration: Drain 2.0, Boiler 1.1, Gas Bloat 2.5, Glasshide 1.5, Leviathan 1.6 (mean 1.7 vs Generalists 3.1). Builder test: the Heavy package alone is **+4 MR**; Bulky takes it back (−4.7) | Confirmed **only with a horde penalty** (→ rule: every Heavy needs Bulky/Interference/Territorial) |
| E5 | Packs: MR − BR ≥ 3, +1 over plain | Pack gap 3.7 vs Generalist 3.1; group Traits measured at +½ to +1.2 MR steps, 0 BR | **Partly**: the effect is real but ~½–1 step, not "+1 or more" for every Trait |
| E6 | Packs relatively stronger vs small parties | Vs 3 freelancers Packs and Generalists both rise +1.5 MR; Packs keep Downs up vs bigger parties (Pump Hall: 27% Down with 4, 26% with 5) | **Wrong as stated**: Packs aren't special vs 3; they are *Down-makers at every party size* (focus fire), while their HP cost falls |
| E7 | 3 PCs = ratings +1, 5 PCs = −1 | +0.9 / −1.0 (BR), +1.5 / −1.1 (MR); 2 PCs +1.5–2, 6 PCs −1.5. **Bosses:** +1.7 / −1.8 (action economy) | Confirmed for normal creatures; **wrong for Bosses** (→ Boss HP & Damage × P/4) |
| E8 | Units: BR-N = 4 units, MR-N = 1, step ×1.5, mixed encounters additive | Step = **×1.41** (`05`). Mixed encounters built by the rule (180 random, party 3/4/5): Easy +2 pts, Standard +2 pts of Down vs target, Hard −9, Deadly −13 (HP lost and death on target) | **Confirmed** with ×1.41; slightly conservative at Hard/Deadly |
| E9 | Easy ½, Standard ¾, Hard 1, Deadly 1½ | ×1½ is a coin flip (win 43–69%), ×1¼ is Deadly (Down 66–82%, win 73–90%) | **Wrong at the top** (→ Deadly ×1¼) |
| E10 | Controllers/support are MR-heavy (less than Packs) | Damper Drone gap 3.0 (= Generalist). Leader +½ MR, Mender ≈ 0 | **Mostly wrong**: support Traits are worth little in the sim; Leader is the only one that pays |
| E11 | Ratings stable ±0.3 at 1,000 runs | Seed 2 vs seed 1, party 4: mean |Δ| 0.15–0.17, 42/51 in-range ratings within ±0.3, max 1.2 (Drowned Choir BR, flat curve) | Confirmed (Choir BR 7–8 is uncertain) |
| E12 | A whole step is worth more across an Evolution | Fair count of T3 Soldiers at L4 = 7.6 (vs 3.9 at L3), T6 at L7 = 8.3; T4 at L3 = 1.5 (formula says 2.8) | **Confirmed, strongly** (→ next-stage creature ×2 units, previous-stage one step lower) |

### Recalibration passes
1. **Threat table v0.3** (`calibrate_table.py`, `01_table_calibration.md`): TN, HP and Damage re-solved so 4 T-N Soldiers are fair for level N (Guard kept). The v0.2 table had 4 L7 freelancers losing ~6% HP to 4 T7 Soldiers. New table jumps at T4 and T7 with the Evolutions.
2. **Roster pass 1** (`tune_roster.py`, `02_ratings_pass1`): one HP/Damage factor per creature to hit its primary rating target, plus a damage→HP shift when fights were swingy (death > 5% or win < 90%).
3. **Pass 2** (`03_ratings_pass2`): Heavies given Bulky/Territorial/Interference after E4 failed (Leviathan, Glasshide, Gas Bloat MR fell 1.5–2).
4. **Pass 3 (this run):** Heavies' per-extra-PC damage first raised (3 → 4 × Bonus) to test E3, then replaced by **Engulf** (2 × Bonus per freelancer beyond the first, **max +2**) and **Apex applies to base Damage only**, because uncapped Engulf let a Seraph Gunship hit three clumped freelancers for 137 each. Glasshide and Leviathan Recharge 5 → 4. All Heavies retuned; Leviathan hand-tuned (HP ×0.9, Damage ×0.55) after the tuner pushed it to a damage-less HP sponge.
5. **Rating maths:** minimum extrapolation slope past L1/L10 (0.08 per level for Down) so ratings stop running to 13 on flat curves (Reactor Wraith swung 9.5 → 12.4 for a 3% stat change before the fix).
6. **Singles:** Ward Tough (damage rounding at T1 swung MR 0.6 ↔ 1.6; fixed at HP ×1.15, Damage ×1.0), Reactor Wraith (×0.56 → retuned ×0.81 with Engulf), Hollow Saint (target MR 9) and The Many (MR 10), **Brood Matriarch** (BR 1.2 with 7.9% deaths at L1 → HP ×0.52, Damage ×0.65: BR 0.8, deaths 4–5%), **Mother of Rust** (67-damage area every round at L9 → HP ×3.0, Damage ×1.9, BR 8.6).
7. **Rules derived from the sims:** unit budget and table (step ×1.41), Deadly ×1¼, party-size budget (per-freelancer fair count 0.84 / 0.92 / 1.0 / 1.10 / 1.15 for 2–6, `08`), Boss scaling HP & Damage × P/4 (`12`), Heavies vs 5+ ×1½, stage rule (`05`, `05b`), Trait ΔBR/ΔMR (`09`, `09b`), starter mission (`11`).

### Before / after (party of 4; "before" = the same creatures on the v0.2 table, untuned, `02_before_v02.md`)
p3/p5 columns are the raw fractional ratings for 3 and 5 freelancers (−2.0 and 13.0 mean off the scale).

| Creature | T | Kind | Before: BR / MR (v0.2 table) | After: BR / MR | BR p3 / p5 | MR p3 / p5 |
|---|---|---|---|---|---|---|
| Scrapjack Picker | 1 | pack | <1 / 2 | **<1 / 2** | -2.0 / -2.0 | 2.7 / 1.0 |
| Spill Rats | 1 | pack | <1 / <1 | **<1 / 1** | -2.0 / -2.0 | 2.4 / -0.7 |
| The Brood Matriarch | 1 | boss | 2 / 5 | **1 / 5** | 2.6 / -2.0 | 6.6 / 4.0 |
| Ward Tough | 1 | general | <1 / <1 | **<1 / 1** | -2.0 / -2.0 | 2.6 / -1.5 |
| Bloomhound | 2 | pack | <1 / 2 | **<1 / 2** | -2.0 / -2.0 | 2.8 / 1.3 |
| Drain Beast | 2 | aoe | 2 / 4 | **2 / 4** | 2.5 / 1.4 | 3.9 / 3.5 |
| Turret Drone | 2 | general | <1 / 2 | **<1 / 2** | -2.0 / -2.0 | 2.7 / 1.1 |
| Boiler Hulk | 3 | aoe | 3 / 4 | **3 / 4** | 3.5 / 2.7 | 5.0 / 3.9 |
| Ostrander Cleaner | 3 | general | <1 / 4 | **<1 / 3** | -2.0 / -2.0 | 3.7 / 2.9 |
| Sporecaller | 3 | control | <1 / 4 | **<1 / 3** | -2.0 / -2.0 | 3.7 / 2.8 |
| Cleaner Hound | 4 | pack | <1 / 4 | **<1 / 5** | 1.7 / -2.0 | 6.5 / 3.9 |
| Gas Bloat | 4 | aoe | 4 / 5 | **4 / 6** | 4.3 / 3.7 | 6.7 / 6.2 |
| Mirrormaw | 4 | general | 1 / 4 | **4 / 7** | 4.6 / 3.5 | 9.7 / 6.8 |
| Bloom Knight | 5 | general | <1 / 4 | **3 / 5** | 3.3 / 1.8 | 6.8 / 4.1 |
| Damper Drone | 5 | control | <1 / 4 | **2 / 5** | 2.5 / 1.1 | 6.7 / 4.5 |
| Glasshide | 5 | aoe | 4 / 6 | **5 / 6** | 6.3 / 4.3 | 6.7 / 6.2 |
| Stitchwork Brood | 5 | pack | <1 / 4 | **2 / 6** | 3.1 / 1.2 | 6.8 / 4.8 |
| Warden Krell | 5 | boss | 4 / 9 | **5 / 10+** | 6.5 / 4.2 | 13.0 / 9.9 |
| Hunter-Killer Unit | 6 | general | 3 / 6 | **6 / 10** | 6.6 / 4.5 | 13.0 / 7.0 |
| Lancer Troopers | 6 | pack | <1 / 1 | **1 / 4** | 2.2 / 0.2 | 4.9 / 3.6 |
| Feral Evolved | 7 | general | 4 / 7 | **7 / 10+** | 8.5 / 6.4 | 13.0 / 13.0 |
| Gutter Leviathan | 7 | aoe | 7 / 7 | **7 / 9** | 8.3 / 6.8 | 11.1 / 6.9 |
| Razorwing Flock | 7 | pack | 2 / 6 | **3 / 7** | 3.4 / 2.4 | 10.4 / 6.6 |
| Bloom Husks | 8 | pack | <1 / 4 | **4 / 7** | 4.9 / 3.3 | 10.1 / 6.6 |
| Ostrander Paladin | 8 | general | 3 / 6 | **6 / 8** | 6.6 / 4.1 | 13.0 / 6.9 |
| Seraph Gunship | 8 | aoe | 4 / 7 | **8 / 10+** | 11.2 / 6.8 | 13.0 / 13.0 |
| The Drowned Choir | 8 | control | 4 / 7 | **8 / 10+** | 10.2 / 6.9 | 13.0 / 13.0 |
| Choir Thralls | 9 | pack | <1 / 4 | **4 / 8** | 5.3 / 3.5 | 12.3 / 6.8 |
| Mother of Rust | 9 | control | 4 / 7 | **9 / 10+** | 13.0 / 6.9 | 13.0 / 13.0 |
| Hollow Saint | 10 | general | 4 / 7 | **5 / 9** | 6.3 / 4.5 | 13.0 / 6.9 |
| Patient Zero | 10 | boss | 9 / 10+ | **10 / 10+** | 13.0 / 7.0 | 13.0 / 13.0 |
| Reactor Wraith | 10 | aoe | 8 / 10+ | **10 / 10+** | 13.0 / 8.5 | 13.0 / 13.0 |
| The Many | 10 | pack | 3 / 7 | **6 / 10** | 6.5 / 4.3 | 13.0 / 7.5 |

**Reading it:** on the v0.2 table almost everything from T5 up rated 2–6 levels below its T (the Seraph Gunship, a "T8", was a fair Boss fight for level 4). After: every level 1–10 has 2–5 creatures whose BR or MR equals it (ch 10 *By party level*).

### Key findings (party 3 / 4 / 5)
- **Heavies vs party size:** a Heavy's BR moves about +0.9 / 0 / −0.7 for 3 / 4 / 5 freelancers, against +0.9 / 0 / −1.0 for everything else; at 6 the gap widens (−0.9 vs −1.45). The Engulf bonus and the crowding term both grow with party size. Vs 3 freelancers, used as minions, Heavies gain only +0.4 MR (Packs +1.5).
- **Packs:** group Traits add +½ to +1.2 MR steps and nothing solo (Pack +1.0, Flanker +1.2, Overwhelm/Leader +0.6, Crowd/Frenzy/Explosive +0.5, Linked +0.4). Their signature is focus fire: Down chance stays high as the party grows while HP cost falls.
- **Bosses** swing hardest with party size (+1.7 / −1.8 rating) because of the fixed action + Interrupt. HP & Damage × P/4 brings 3- and 5-freelancer fights back into the band for the Matriarch and Krell (Patient Zero vs 3 is still win 79%; open question).
- **Elites and Bosses are death-limited:** at their BR, Down is only 25–35% but fights are long and death risk reaches 4–5%. That's why mixed encounters with a centrepiece come in ~9–13 points under the Down target while HP lost is on target.
- **The Evolution wall:** many ratings cluster at 6.8–7.0 because anything too strong for level 6 is suddenly fair at 7. Read a "7" as "Evolution II material".

### Decisions
- Ratings are for **4** freelancers; other sizes use the budget table, Boss scaling and the Heavy rule (ch 10 §6), not separate published ratings. The p2–p6 ratings are in `04_ratings_final.md` for anyone who wants them.
- **Mooks keep HP ×¼** (not "dies to any damage"): one-hit Mooks were trivial against Area Surges.
- **Fair = Hard.** Easy/Standard/Hard/Deadly = ×½ / ×¾ / ×1 / ×1¼ of the fair budget; most fights between Breathers should be Standard.
- **Heavies must carry a horde penalty**; Engulf caps at +2 freelancers so a clumped party takes big damage but isn't one-shot.
- Kinds are labels for the GM (Pack, Heavy, Generalist, Control, Boss), not rules.

### Files
`tools/encounter_sim.py` (sim + ratings), `encounter_roster.py` (table, roles, roster data), `sim_data/roster_tuning.json` (per-creature HP/Damage factors), `tune_roster.py`, `calibrate_table.py`, `encounter_math.py` (final/steps/budget/party/mixed/mixed2/builder/traitunits/bossscale/repatch), `threat_blocks.py` (prints the ch 10 stat blocks and roster table), `ch11_check.py`, `check_links.py`; results in `tools/sim_results/` (00 expectations … 12 boss scaling).

## Arcade: Gauntlet mode (arcade/)
The owner asked for an arcade mode in the battle simulator (2026-10-29):
- the player fights a series of battles in a row;
- each level is a minion battle, then a boss battle, then a level-up;
- Easy, Medium and Hard field 5, 4 and 3 player characters;
- it starts with character creation, saves both characters and whole parties, and the player controls and levels every sheet.

Live at https://xenodorian.github.io/BeelzRPG/arcade/ and offline at `arcade/index.html`. The page is plain HTML and JS with no build step.

### Architecture
- `mutagen_rules.js` is **generated from the builder**. `tools/sync_arcade.js` copies the `MUTAGEN` data block and the builder's rules code (`derive`, `normalize`, `randomChar`, gates, pick counts…). The builder stays the single source of truth: change the builder, re-run the sync, and the arcade test fails if you forget.
- `roster.js` is generated from `tools/encounter_roster.py` (the ch 10 roster with computed stats) plus the BR/MR ratings in `sim_results/04_ratings_final.json`.
- `engine.js` holds the rules with no DOM: runs, encounters, the `Fight` class, the enemy AI (traits and targeting follow `tools/encounter_sim.py`), the freelancer auto-player, level-ups and saving. `app.js` only draws screens.
- **Saves:**
  - Characters go to the builder's own list (`localStorage["mutagen.builder.saves"]`), so the two apps share them on the same origin.
  - Parties go to `mutagen.arcade.parties`, the current run to `mutagen.arcade.run` and the last 25 results to `mutagen.arcade.records`.
  - Party files are `{app: "mutagen-arcade-party", name, characters: [builder JSON…]}`. Import also accepts a single builder character or an array.

### Design decisions
1. **Difficulty = party size + threat.**
   - Encounters follow ch 10 for the actual party size: the Hard unit budget for minions, and the Boss's HP and damage × party ÷ 4.
   - At book budgets the auto-player won about 99% of fights at every size, so each difficulty adds a threat factor. v1 (no map): Easy ×1.25, Medium ×1.6, Hard ×1.75. **v2 (grid): Easy ×1.0, Medium ×1.22, Hard ×1.38** — positioning made fights harder, so the factors came down.
   - The factor multiplies the minion budget and the boss's HP. Boss damage gets half of it.
   - The extra threat ramps in: half at level 1, three-quarters at level 2.
2. **Each level** is: minion fight → **Breather** (half Max HP + Knit, Flux 0, death marks cleared, per-Breather abilities back, a Ravenous freelancer eats a ration) → boss fight → **level-up** → **Lockdown** (full HP, injuries cleared, Juice at least 1, kit restocked, per-Lockdown abilities back).
   - The minion fight is one or two creature types from one faction (at most 8 creatures), costed in MR units, with next-stage creatures excluded.
   - The boss is the real Boss at levels 1, 5 and 10. Other levels use a centrepiece (Elite, Brute, Controller, Artillery or Soldier) whose party-of-4 BR is within 0.75 of the level, scaled like a Boss.
   - Encounters are seeded per run and level, so a retry faces the same enemies.
3. **Everyone starts at level 1.** Imports and pregens above level 1 are fitted down, like the builder's "Fit to level".
4. **Death and retries.**
   - In standard mode, a lost fight can be retried from a snapshot taken at the start of the fight.
     - Each retry of the same fight takes 6% off the enemies' HP and 4% off their damage (**Mercy**, up to 10 retries).
     - A freelancer who dies is recovered by GRAFT at the next Lockdown with a permanent Scar (Bio) or Fault (Chrome).
   - In **permadeath** mode there are no retries, the dead stay dead, and a lost fight ends the run.
   - Quitting mid-fight saves the run. v2: the fight itself is saved too (positions, HP, conditions, whose turn), so resuming continues exactly where you left off.
5. **Level-up.**
   - The primary node is chosen automatically (the request asked for that); the player picks the secondary and tertiary nodes, new Surges and Signatures, and Knacks.
   - Every pick is checked with the builder's `derive()`, so a sheet can't be confirmed while it's illegal.
   - Evolution nodes (4, 7) come from the builder rules. The new stage Emerges at the start of that freelancer's first turn in the next fight.
   - Final Form is offered on the Ready screen from level 10, once per Lockdown.
6. **Quick character creation** inside the arcade covers name, Form, dump stat, Origin, Kit, Materials, Surges (shape, effect, Twists) and Knacks. Nodes are grown like the builder's Random and can be rerolled. For hand-picked nodes, build in the full builder and use "Load saved".
7. **Auto-play** (the "Auto this turn", "Auto: rest of round" and "Auto-battle" buttons, and the tests) uses `aiChoose()`:
   - heal the fallen first;
   - spend Flux only below the Limit, Amped Surges first, Areas into crowds;
   - Churn when nothing worthwhile is Primed;
   - Target Lock, Menace and Siren Song for tanks;
   - Final Form at the level 10 Boss.

### Rules simplifications (things the tabletop does that the arcade abstracts)
- ~~No battle map~~ **(removed in v2):** the party-order "adjacency" line, the encounter-sim catch odds (Q) for Areas and the 10% enemy friction are gone. Positions, reach, range, line of sight and templates now decide everything (see *Arcade v2* below). Push distances, Grapnel, Overgrowth, Joint Lock and Spring Legs now act on the grid.
- **Reactions resolve automatically** when they help: Bulwark, Threat Sense, Precog, Unbreakable, Reflex Spike, Fortress, Omen and Deadeye. Last Gasp fires automatically on the first drop to 0 in each Lockdown. Hair Trigger fires automatically.
- **Juice** can set Prime dice (Prime screen) and Shrug a condition. There's no Juice reroll of a d20, because rolls resolve at once.
- **Splice** Overloads roll both tables and keep the better result, and Bloom Lore rerolls bad results automatically. Hive Mind's extra Prime goes to the ally with the fewest Primed Surges. Puppet picks its own target. Perfect Expression picks your two best Surges.
- **Scars and injuries** gained in a fight take effect from the next fight.
- **Haste** gives the ally one immediate Action (not Unleash) with advantage.
- **Mimic** gets advantage on its first attack only. The Drowned Choir and other Shaken-on-Shift Bosses roll Resist for everyone.
- **Enemy stats are visible** (Guard, TN, HP, attacks). Analyze still matters for Exposed and Weak Spot.

### Tests (2026-10-29)
- **`node tools/arcade_test.js 40`: 16,882 checks, all pass.** They cover:
  - sync checks;
  - party create, save, load, delete, export and import, and run save/resume;
  - level-ups 1→10 for all five Forms (legal at every level, Evolution nodes and stage names at 4 and 7, Knacks at 3/6/9, Final Form at 10, a manual secondary pick applied);
  - 40 seeded runs per difficulty in permadeath mode and 40 in standard mode;
  - a jsdom page flow (title → Hard party → pregen/random/editor → save and load party → fight by hand and auto → retry → level-up screen → confirm → resume).
- **Auto-play win rates** (random level-1 parties, seeded):

  | Difficulty | Permadeath runs won | Fights won first try | Standard runs finished | Retries per run |
  |---|---|---|---|---|
  | Easy (5) | 35/40 (88%) | 99.3% | 40/40 | 0.23 |
  | Medium (4) | 28/40 (70%) | 98.2% | 40/40 | 0.63 |
  | Hard (3) | 18/40 (45%) | 96.2% | 38/40 | 2.92 |

  Losses on Hard spread from level 1 to level 10. With 20 fights per run, one bad fight in 25 is enough to end a permadeath run.
- **Real Chrome:**
  - `tools/arcade_shots.js` produced the screenshots with no page errors.
  - A random-click fuzz (5,575 clicks, every option type, Hard, retries allowed) played a full run to victory with no page errors.
- `check_builder_data.js` (493/0), `builder_test.js` (255, all pass), `builder_flows.js` (Playwright, 33 flows, all pass) and `check_links.py` (177 links, 0 broken) still pass.

### Known issues / ideas
- Levels 2–4, 6–9 use centrepieces because there are only three Bosses. Mother of Rust can come up twice (levels 8 and 9).
- A few random Hard parties hit a wall against one matchup (all-Siren parties against psychic areas). Mercy softens this, but a human may still need a different party.
- No shops or Scrip between levels (see the backlog). Every creature takes one square (Huge too). No difficult terrain, cover bonus or elevation on the map yet.

## Arcade v2: battle map (2026-10-29)
Owner request: "make the battle simulator a little bit more RPG like. Have a virtual tabletop style backdrop and grid, where the player can move individual player characters in and out of range of their attacks. Also include turn-based RPG menu screens that automatically swap from character to character, and show a HUD for the current player character and the enemy character."

### What changed
- **`arcade/grid.js` (new):** maps, distances, line of sight, movement, templates, deployment and map save/restore. `engine.js` is v2.0.0 and grid-aware throughout; `app.js` draws the map and menus.
- **Map:** 14×9 squares (16×10 with more than 8 combatants, wider still for a Boss), 4–6 obstacle blobs themed to the location (pipes, valves, crates, containers, cars, barrels, rubble, barricades, towers, vats, consoles, gurneys, growths, pods) over a blurred art backdrop. Six themes: Pump Station, Streets, Camp, Clinic, Rust Yard, Bloom. Freelancers deploy on the left, enemies on the right.
- **Tokens:** portrait, HP ring, condition badges, floating damage/heal numbers; states for active, selected, targetable, out of range, allies caught, Down and dead.
- **Menu:** Move / Attack / Surges / Churn / Items & Kit / Defend & Other / Wait / End Turn. Submenus list every option with its cost (Action/Quick/Move), dice and range; options that can't be used are disabled with a reason ("out of reach (20 ft, reach 5 ft) — move first", "no ally within 30 ft"…). Back with Esc or the Back button. Keys: arrows move the map cursor, Enter/Space confirm, 1–9 pick, Up/Down in lists, C toggles careful movement, T cycles targets, Space skips enemy animation. Touch: tap squares and tokens.
- **Auto-switch:** when a freelancer's turn is spent (or they End Turn), the menu jumps to the next freelancer in initiative order (can be turned off). **Wait** moves a freelancer to the end of the order, keeping what they have left.
- **HUDs:** the active freelancer (portrait, HP/temp, Flux/Limit, Sequence die, defences, armor, speed, Juice, reaction, Action/Quick/Move left, Primed Surges) and the targeted/hovered enemy (HP, Guard, TN, armor, speed, traits, attacks, BR/MR, distance). Turn-order bar on top; dice log collapsible.
- **Enemy turns** animate token by token (normal / fast / instant, saved in settings; Space or the Skip button skips).
- **Mid-battle save:** `Fight.toJSON/restore` keep positions and the whole fight state; tested to give the same result as an unsaved fight with the same seed.
- **Auto-play** (Auto this turn / rest of round / Auto-battle) moves too: it scores every reachable square by the best attack or heal it allows, minus the danger there (enemy reach, clustering inside known area attacks), acts, then backs off with any movement left.

### Grid and range mapping
| Rule | On the grid |
|---|---|
| Distance | 1 square = 5 ft; diagonals = 1 square (Chebyshev). Line of sight: centre-to-centre line, blocked by obstacles (not creatures). |
| Speed | Speed ÷ 5 squares (30 ft = 6). Torn leg −10 ft; Overgrowth halves; Held / Joint Lock / Cocoon = 0. Standing from Prone costs half. Fliers ignore obstacles. |
| Dash | Adds your speed again this turn (Afterimage also Veiled). Pounce needs 3+ squares moved. |
| Careful move | Each square costs 2; no Opportunity Strikes. |
| Opportunity Strike | Enemy: once per round per enemy, when a freelancer leaves its reach. Freelancer: uses the Reaction when an enemy leaves reach (Lash Tail also on entering, and knocks Prone). Slipstream: no OS, can pass through enemies. |
| Weapons | Melee reach 1 square, or the weapon's listed reach; Grapnel adds 1. Ranged: listed range, up to 2× at disadvantage; disadvantage when an enemy is adjacent. A ranged enemy attacking from adjacency gives the defender advantage. |
| Actions | Help 6 sq (30 ft); Patch, Stim Gland, Antibodies 1 (touch); Analyze, Taunt, Menace, Crown, Puppet, Intrude 12 (60 ft); Target Lock 24; Rally 12. |
| Surge shapes | Strike reach 1 (Grapnel 2, Reach twist 3). Bolt 12 (×2 with Reach, ×2 with Long Sight). Burst: range 12, radius 2 (Reach: radius 4). Wave: cone 3 or line 6 (Reach: 6 / 12). Pulse: radius 2 around you (Reach: 4). Infuse: ally within 6 (Reach: 12). |
| Wild Surges | Wild 2: radius-2 burst on yourself (not you). Wild 3: range 12. Wild 8: teleport. Wild 10: pulse radius 4. |
| Nodes | Siren Song 6; Scream radius 6; Panacea 6; Living Pharmacy 3; Spotter 12; Spore Cloud 3; Bulwark / Fortress (half) 2; Fortress intercept 6; Living Wall 1; Threat Sense / Precog 6; Omen 12; Hardening / Heat Vent / explode 2; Chain jumps 3 from the first target; Phase Step teleports up to 12. |
| Items | Grenades etc.: radius-2 burst within 6. Launcher: radius-2 burst within 18 (90 ft), no long range. |
| Enemy areas | "N ft around" = radius N÷5 around the creature; "N-ft burst" = radius N÷5 at its range; "N-ft cone" = cone N÷5; unlabelled small/medium/large = radius 2/4/6. |
| Who an area hits | Freelancer Burst/Wave: every enemy in the footprint; allies inside roll Dodge (success = half). Pulse and Scream: enemies only. Enemy areas with friendly fire hit their allies too; Bulky enemies won't fire if a non-mook ally would be caught. |

### Enemy AI on the grid
Areas pick the square catching the most freelancers; single attacks score expected damage plus the stat block's preferred target; melee closes in and flanks, ranged enemies keep out of reach; anything with nothing in reach Dashes closer. Summons appear next to the summoner.

### Simplifications added
- Every creature fills one square (Huge too).
- Enemy Opportunity Strikes: at most one per enemy per round.
- No difficult terrain, cover bonus or elevation; obstacles just block.

### Win rates (auto-play, 40 seeded runs each, `node tools/arcade_test.js 40`)
| Difficulty | Before (v1, no map) permadeath | After (v2 grid) permadeath | Before standard / retries per run | After standard / retries per run |
|---|---|---|---|---|
| Easy (5), ×1.0 | 35/40 (88%) | **36/40 (90%)** | 40/40 / 0.23 | 40/40 / 0.13 |
| Medium (4), ×1.22 | 28/40 (70%) | **30/40 (75%)** | 40/40 / 0.63 | 40/40 / 0.47 |
| Hard (3), ×1.38 | 18/40 (45%) | **17/40 (43%)** | 38/40 / 2.92 | 40/40 / 2.55 |

First-try fights won (v2): 99.5% / 98.6% / 96.0%. Tuning sweeps of 100–200 runs (seeds 1000·i+1): Easy ×1.0 → 86.5%; Medium ×1.22 → 68.5%; Hard ×1.38 → 43%. The first grid build was far too hard (areas caught 2.6 freelancers on average; the L2 Drain Beast's 20-ft Tail Thrash hit everyone), fixed by larger maps and by teaching the auto-player to spread out.

### Tests (v2)
- `node tools/arcade_test.js 40`: **17,478 checks, all pass**. New grid section: footprints, line of sight, movement legality, Opportunity Strike vs careful move, ranges / long range / LOS, bursts catch only creatures inside, save/resume keeps positions, melee enemies close in, Wait order. The jsdom page section covers map and tokens, auto-switch, HUDs, order bar, move by click, Esc, arrow cursor, attack submenu with disabled reasons, target and AoE, next-freelancer switch, mid-battle save + resume.
- Real Chrome (`tools/arcade_shots.js`): full click-through with no page errors; screenshots `arcade_grid_move.png`, `arcade_grid_menu.png`, `arcade_grid_attack.png`, `arcade_grid_aoe.png`, `arcade_grid_enemy.png`, `arcade_grid_mobile.png`.
- `check_builder_data.js` (493/0), `builder_test.js` (255), `builder_flows.js` (all pass, no console errors), `check_links.py` (177/0), `sync_arcade.js --check` (in sync).

### Issues fixed along the way
- `weaponOf` had a duplicate `range` key (text vs number); the text is now `rangeTxt`.
- Weapon ranges like "30/90/120 ft" were parsed wrongly.
- On phones the map's width forced the whole page to zoom out; grid columns now use `minmax(0,1fr)` and the map scrolls inside its frame.
- Numbered enemies of the same kind now get distinct tokens (S1, S2…).

## Final Pass 2026-10-29 (owner request: system + builder review, simulator stress test, single-file build)
### System (rules) review
Read every chapter against the others, the threat table, the builder data and the arcade grid. Fixed:
- ch 5: the Flux Limit range said "6–8 at level 1, 11–16 at level 7". Real range: **4–8** at level 1 (Sirens with Nerve −1 sit at 4) and **9–16** at level 7, one less for a Splice.
- ch 8: Armor max said a flat 4. Now names the exceptions (Unbreakable 5, Siege Hide 6) and the one-armor-plus-Shield rule from ch 13, matching ch 2, ch 12 and the builder.
- ch 7: "a Lab Escapee's or Clinic Rat's Origin may change … what it costs" (Lab Escapee has no such perk). Now: a Clinic Rat pays half, with a link to Origins.
- ch 2A / ch 4: Signature rebuild now says "from level 5", matching ch 7 (at level 4 you've just built it).
- ch 10: Warden Krell's summon read "Recharge 6–6" and summons lacked plurals ("2 Husk join"). Fixed in the text and in the generator (`tools/threat_blocks.py`).
- Cross-references: ch 1 (distances) and ch 12 (Quick Reference) now point at the new optional grid rules in ch 6; ch 12 gained a Reactions/Opportunity Strike line and a grid line. ch 10 §7 gained a battle-map note (Areas hit more on a grid; arcade evidence), and Open Question 21 records that evidence.
- Terminology: no remaining "Form" used for Material (Bio/Chrome) in the chapters, sheets, README or builder; no TODO/TBD left.
Logged, not changed (judgement calls for the owner): Open Questions 1–11, 13–23 stand. Ch 10 ratings were calibrated off-map and are left as is.

### Builder review
- **Phones:** the page was wider than the screen on steps 1 and 6 (the grid column's `1fr` let the level table and the weapon selects push it to 513–546 px). Fixed (`minmax(0,1fr)`, the level table scrolls inside its box, selects capped at 100%).
- **Phones:** the summary used to sit above every step, so you scrolled past it each time. It now follows the step, and a status chip at the end of the step bar ("✔ Legal" or "3 Problems ↓") jumps to it and focuses it.
- **Hands check** (backlog item): a Shield together with a two-handed weapon (Heavy melee, Rifle, Shotgun, Launcher) warns on step 6, unless you have Limbs: *Extra Arm*. It's a warning, not an error: you can carry both and switch with a Quick action.
- **Share link** (backlog item): the **Link** button packs the whole character into the URL (`#c=…`, base64 of compact JSON; nothing is uploaded) and copies it. Opening the link loads the character on the Sheet step. Bad links are refused with a message.
- Level table got a caption for screen readers.
- Tests: `builder_test.js` 263 checks (new: hands warning both ways, Extra Arm, status chip, share-link round-trip on three characters, bad link). `builder_flows.js` 35 flows (new: share link opens in a fresh page; phone status chip, no overflow).

### Battle simulator stress test
- **`node tools/arcade_stress.js 100`** (new): 100 seeded auto-played runs per difficulty, each in permadeath and standard mode (600 runs, 11,434 fights, 152,816 turns). After every turn it checks the state (no NaN HP, HP within 0..max, one creature per square, in bounds, nobody standing in a wall unless flying, Flux ≥ 0). In 8% of steps it saves the fight to JSON mid-battle and resumes from the copy, and between fights it round-trips the whole run through JSON (11,317 mid-fight resumes). It flags crashes, softlocks (no progress for 50 steps), fights over 40 rounds and slow turns.
- **Found and fixed: 2 stalemates.** Before the fix, 2 of 600 runs hit the 40-round cap: a rooted Brood Matriarch behind cover (freelancers "in range" but without line of sight kept Dashing in place) and hovering Turret Drones. Fix in `engine.js`: the fight tracks the last round anyone was hurt (`lastHarm`). After 3 rounds with no harm, the freelancer auto-player turns bold: it stops retreating, mostly ignores risk and walks toward the nearest enemy. Both repro seeds now finish, and `arcade_test.js` has a regression check (a walled-in, rooted enemy: the bold auto-player closes in, the normal one does not). A first version that always added the "close in" tie-break dropped Hard to 38%, so it only applies when bold.
- **Result after the fix:** 0 crashes, 0 softlocks, 0 invariant failures, 0 fights over the cap, 0 level-up errors. Slowest turn 38 ms, slowest fight 137 ms, longest fight 30 rounds. Win rates on these seeds (auto-play): Easy 86%, Medium 65%, Hard 32% in permadeath; 100% in standard mode on every difficulty.
- **`node tools/arcade_fuzz.js [actions] [url] [desktop|mobile]`** (new, real Chrome via puppeteer-core): random weighted clicks and keys on whatever is on screen, with a page reload + Continue every 400 actions. It checks for page errors, console errors, blank screens and softlocks (the screen state not changing for 600 actions in a row). Runs Easy (animations off), Medium (fast) and Hard permadeath. Desktop: 30,000 actions per difficulty, passed. Phone (390×844): 12,000 + 12,000 actions plus a Hard permadeath run to game over, passed.
- `node tools/arcade_test.js 40`: 17,479 checks pass. Win rates unchanged: Easy 90%, Medium 75%, Hard 43% permadeath; standard 100% with 0.13 / 0.42 / 2.55 retries per run.
- Also fixed: the Past-runs table overflowed on phones (it scrolls inside its box now), and the Home button's confirm text now says the run and the fight are saved.

### Single-file edition (`Mutagen.html`)
- **Build:** `python3 tools/build_single.py` (Python 3; Pillow optional, for smaller art). It writes `dist/Mutagen.html` and a copy at the repo root, so Pages serves it at https://xenodorian.github.io/BeelzRPG/Mutagen.html. Re-run it after any change to the chapters, builder, arcade or art, and commit both copies.
- **What's inside:** every chapter rendered from Markdown (own small renderer: headings with GitHub-style ids, tables, lists, links, images), with a contents sidebar, scroll-spy, full-text search (`/` focuses it), and tabs for Rules, Builder, Arcade and Sheet. The builder, arcade and character sheet are inlined as `srcdoc` iframes (same origin as the shell, so they **share localStorage**: a character saved in the builder shows up in the arcade). Art is shrunk (900 px JPEG, q70) and embedded as base64, turned into blob URLs at load. Links between chapters, the builder and the arcade are rewritten to in-file routes (`#rules`, `#builder`, `#arcade`, `#sheet`, `#<chapter>--<heading>`, `#c=…` share links). No network requests; works from `file://`.
- **Size:** about 1.8 MB (art about 1 MB).
- **Test:** `CHROME=/path/to/chrome node tools/single_test.js` (27 checks, puppeteer-core, network blocked). Covers all chapters and images, TOC, cross-links, search, builder save → arcade sees it, a full auto-played arcade run to victory inside the file, embedded art, sheet, share link, phone layout, no console errors.

## Rules Audit 2026-10-29 (owner request: text vs battle simulator)
Owner request: "Review the rules of the text against the battle simulator you've built and updated incrementally, and update the ttrpg system rules to match any changes you've made to the mechanics since then. Then, compile all the individual rules … into a single coherent document."

**Method.** Every mechanic in `arcade/engine.js` + `arcade/grid.js` (the grid simulator) and in `tools/encounter_sim.py` / `tools/balance_sim.py` (the off-map rating sims) was read against chapters 1–13. Each difference got one of three verdicts:
- **(a) Rule:** a real mechanic or clarification the simulator needed; it is now the tabletop rule (chapters, Quick Reference, sheet, builder data updated).
- **(b) Arcade-only:** a video-game convenience, difficulty knob or modelling abstraction. Not a rule; listed in the new appendix [ch 14 Arcade vs Tabletop](chapters/14_Arcade_vs_Tabletop.md).
- **(c) Sim bug:** the text was right and the simulator was wrong; the simulator was fixed (with a regression test).

**Big decision: the grid is now an equal option.** Ch 6's "Optional: Playing on a Grid" is replaced by **Positioning: Theatre of the Mind or Grid** (a distance table for both, ranges, Areas, grid specifics), and Opportunity Strikes got their own section.

| # | Mechanic | Text said | Simulator did | Verdict | Resolution |
|---|---|---|---|---|---|
| 1 | Grid status | "Optional" sidebar | Every arcade fight is on a grid | (a) | Ch 6 *Positioning*: theatre of the mind **or** grid, equal; ch 1, 0, 12 updated |
| 2 | Opportunity Strike limit | Enemies get one whenever you leave reach | One per enemy per round; Dazed enemies can't | (a) | Ch 6 *Opportunity Strikes*: one per round per creature (freelancers: their Reaction); Dazed can't |
| 3 | Freelancer OS weapon | "one weapon attack" | Best **melee** weapon | (a) | "one melee weapon attack" |
| 4 | Move carefully | Grid-only optional rule | Always available (half speed, no OS) | (a) | Core rule in both modes |
| 5 | Teleports / pushes / Slipstream | Silent | Never provoke | (a) | Stated in ch 6 |
| 6 | Ranges of actions | Help/Analyze/Taunt/Rally had none ("can hear you") | Help 30 ft, Analyze/Taunt 60 ft in sight, Rally 60 ft, Grapple/Shove in reach | (a) | Ch 6 action table + QR |
| 7 | Long range | "double the listed range with disadvantage" | Not for Area weapons (Launcher), grenades, Surges | (a) | Ch 6 *Ranges*, ch 8 |
| 8 | Shooting next to an enemy | Players only: disadvantage | Also enemies: a shooter with a freelancer adjacent → target defends with advantage | (a) | Ch 6 *Ranges* |
| 9 | Line of sight | Implicit | Needed for ranged attacks, Analyze, Taunt, Target Lock, Area centres; creatures don't block | (a) | Ch 6 *Ranges* and *On a Grid* |
| 10 | Area footprints | Burst radius, cone, line only in the grid sidebar | Burst N ft = square of N÷5 around a point; cone = quarter-circle N÷5 deep; line 1 wide; walls cut Areas | (a) | Ch 6 *Areas (both ways)*, ch 4 cross-ref |
| 11 | Allies in your Area | Ch 4: Burst/Wave hit allies (Dodge for half) | Same; Pulse/Scream hit only chosen | (a) clarify | Ch 6 *Areas*; ch 4 adds "a Pulse hits only who you choose" |
| 12 | Area catch odds (theatre of mind) | Only in ch 10 | Off-map sim: 30/45/65% per other freelancer | (a) | Guidance copied to ch 6 *Areas*; ch 10 keeps it |
| 13 | Boss sheds a condition | "at the end of every Enemy Phase" (but every enemy condition ends then anyway, so it did nothing) | Both sims: at the **start** of the Boss's turn | (a) fix | Ch 6 Conditions, ch 6 Round, ch 10 Role table, QR |
| 14 | Burning | Damage at start of turn; "spend Move to douse" (meaningless: it ends after one turn anyway) | Burns once at the start of its next turn, then ends | (a) clarify | Ch 6 table + QR; Mend/Stim Gland put it out first |
| 15 | Shaken / Blinded enemies | Attack with disadvantage | Their targets defend with advantage | (a) clarify | Ch 6 table (player-facing wording) |
| 16 | Dazed | No Reaction | So no Opportunity Strikes | (a) clarify | Ch 6 table |
| 17 | Enemy turn order | "declares them all" | Enemies resolve one at a time; start-of-turn effects first (Burning, Regenerating, Boss shed) | (a) clarify | Ch 6 *The Round* |
| 18 | Boss Interrupt | "an action right after any player's turn" | One action with **no Move** | (a) | Ch 6, ch 10 Role table, QR |
| 19 | Wait | "Players take turns in any order" | Explicit Wait (go later if you haven't acted) | (a) | Ch 6 *The Round*, QR |
| 20 | Everyone Down | Silent | Fight lost | (a) | Ch 6 *Going Down*: the fight is lost; GM decides capture etc. |
| 21 | Knit after a fight | "end of each combat" | Only for standing freelancers | (c) | Engine: Knit also stands a Down Bio freelancer up (any healing does, ch 6). Test added |
| 22 | Mutagenic / Purger | "When it damages a player" | Both sims: only on a **failed** defense (not the half damage of a successful Area defense) | (a) | Ch 5, ch 10 Traits, QR: "fails their defense against its attack". Ratings were measured this way |
| 23 | Sticky Relay (Fault) | "highest slot always Wild, even if a Surge is written there" | Builder/arcade: one fewer slot, so one fewer Surge known; arcade drops the extra Surge (the earlier "surge cap fix") | (a) | Ch 5 table + builder text: "you know one Surge fewer" |
| 24 | Flanker | "while another Flanker is fighting" | Grid: another Flanker adjacent to the same target | (a) grid variant | Ch 10 Traits |
| 25 | Crowd | "per other enemy fighting" | Grid: per other enemy within 10 ft of the target | (a) grid variant | Ch 10 Traits |
| 26 | Bulky | d6 per non-Mook ally | Grid: won't fire if its Area would catch a non-Mook ally | (a) grid variant | Ch 10 Traits (both ways) |
| 27 | Territorial / Mender | No range | Rival within 15 ft / heals within 30 ft | (a) grid variant | Ch 10 Traits |
| 28 | Threat ratings vs grid | Ch 10 §7: "arcade needed ~20% less enemy strength… start Heavies one step lower" | New `tools/grid_budget.js` (book Hard budget, no arcade factors, fully rested, LG/Emergence/FF off): party of 4, 1,200 fights: win 94%, Down 31%, death 4%, 3.9 rounds = fair. Heavy fights: death 7%, Down 39%, Areas catch 3.25 of 4. At ×0.8: Heavy fights death 2%, Down 30% | (a) | **Ratings unchanged. On a grid, Heavies cost ×1¼ units** (ch 10 §4 step 4, §7, QR). The 20% was the arcade's own difficulty factors (a 20-fight run with no rests between levels), not the book's budget |
| 29 | Emergence | Enemies within 30 ft that can see you are Shaken | Arcade Shook every non-Boss on the map | (c) | Engine fixed (30 ft + line of sight); test |
| 30 | Hardening (Wild 4) | "Your speed is 0 until your next turn" | Not applied | (c) | Engine fixed |
| 31 | Linger | Enemy that **enters** or starts its turn there | Only "starts its turn" | (c) | Engine: entering also triggers (once per area per enemy per round); test |
| 32 | EMP grenade | Chrome freelancers inside defend with disadvantage | Not applied | (c) | Engine fixed |
| 33 | Quickened | Dash as a Quick action | Missing | (c) | Engine: "Dash (Quickened: Quick)"; test |
| 34 | Ward Militia | Brace as a Quick action once per combat | Missing | (c) | Engine fixed |
| 35 | Blur | Two Moves; Dodge advantage only if you moved 20+ ft | Advantage always, one Move | (c) | Engine fixed |
| 36 | Initiative | Ambush / first-strike branches | Always the Moxie group check | (b) | Appendix |
| 37 | Haste | Move + Action | Action only (no Move) | (b) | Appendix |
| 38 | Mitosis | Move + attack; you Dodge for it | Attacks at end of turn; 35% of attacks go for it | (b) | Appendix |
| 39 | Scars/injury timing | Immediate | From the next fight | (b) | Appendix |
| 40 | Reactions, Last Gasp, Splice table, Bloom Lore, Hive Mind, Puppet, Echo, Perfect Expression | Player choices | Automatic | (b) | Appendix |
| 41 | Juice reroll | Allowed | Not offered (dice resolve at once) | (b) | Appendix |
| 42 | Enemy stats | Hidden until Analyze | Visible | (b) | Appendix |
| 43 | Difficulty factors, Mercy, GRAFT recovery, fixed level rhythm, centrepiece "bosses" | — | Arcade settings | (b) | Appendix |
| 44 | Enemy AI tendencies | "Elites and Bosses should feel smart" | Areas maximise freelancers caught; melee flank; ranged keep out of reach; Dash when nothing in reach; Bosses/Hunters lowest HP half the time; stalemate breaker | (a) as GM guidance | Ch 9 *Default tactics* (guidance, not a rule) |
| 45 | Off-map sim abstractions | — | Area catch chance Q, 15%/10% friction (the "wasted enemy actions"), Held melee loses half its actions, Fortress 50% | (b) | Appendix *Simulators*; the v2 arcade has no friction (real movement instead) |
| 46 | Not modelled in the arcade | Cover, difficult terrain, elevation, Shaken approach limit, Swarm sharing squares, Adaptive, Arc Jump, Wall Run, Many Hands' 2nd grab, Extra Arm Push, Spore Cloud "from outside" | — | (b) | Appendix |

Checked and **consistent** (no change): Rank/attack/defense maths, crits (nat 20 dice twice; nat 20 defense → Exposed), Area hit/miss/half, Armor min 1, Poisoned half damage, Exposed −2, Prone adv/dis, Held speed 0, Down (Endure DC 10 at end of Enemy Phase, nat 20 up, damage while Down = mark, 2 vs a Boss on a failed defense, 3 = dead), Injury table, Last Gasp (skip damage, stay at 1), Overload (Rank d6, can't drop below 1, skipped when Down), Priming (doubles Amped, Wild separate, Misfire free Churn), Churn lock, Primed maximum, Signatures once per round, missed Strike/Bolt stays Primed, Chain 15 ft, Final Form, Pack, Overwhelm, Linked, Frenzy, Leader, Shield Wall, Explosive (10 ft Endure), Heavy recharge, Engulf (+X per extra freelancer, max 2X), Apex, Interference, Shielded, Swarm, Regenerating, Damage Gate, Cowardly, Damper Field, Boss party scaling (HP ×P, Damage ×P/4, summons too), the encounter budget and unit tables, rests (Breather half HP + Knit, Flux 0, marks cleared; Lockdown full), Bulwark/Living Wall/Fortress/Threat Sense/Omen ranges.

Stale doc fixed: the *Arcade v2* grid table said an enemy "N-ft burst" has radius N÷10 and the Launcher reaches 60 ft; the engine uses radius N÷5 (as ch 6 says) and 90 ft (18 squares).

**Tests added:** `arcade_test.js` checks Linger-on-enter (and once per round), Quickened's Quick Dash, Emergence range, Knit standing a Down freelancer up, plus the stalemate breaker. `tools/grid_budget.js` writes `tools/sim_results/13_grid_budget_p{3,4,5}.md` and `13_grid_budget_p4_x0.8.md`.

**Creatures that ran hot on the grid** (party of 4, book budget; small samples, the off-map ratings stay authoritative): Ostrander Paladin (as an L6/8 centrepiece: 58% won), The Drowned Choir (65%, death 30%), Hunter-Killer Unit (80%), Drain Beast (death 14%). Logged as Open Question 24.

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
| `chapters/02_Character_Creation.md` | Steps (Base Form first), derived numbers, stats, Origins, example PC (Vex, Skitter) | |
| `chapters/02A_Forms_and_Evolution.md` | The five Base Forms, stage table, Evolution, Signature Surges, Emergence, Final Form, stage looks (Bio/Chrome) | v0.2 core |
| `chapters/03_Augment_Trees.md` | Tree summary (primary/secondary/tertiary of), gates, picks per level, Materials (Bio/Chrome/Splice), Evolution nodes at a glance | Biggest balance surface |
| `chapters/03_Trees/{Hide,Limbs,Senses,Glands,Wiring,Mind}.md` | One file per tree: Root, Tier I, Tier II, Apex, Evolution nodes | The checker parses these |
| `chapters/04_Surges.md` | Surge parts, Sequence, Priming, Churn, Wild table, samples | Signature mechanic |
| `chapters/05_Flux_and_Overload.md` | Flux, Overload, Bloom/Glitch tables, Scars/Faults, Last Gasp | |
| `chapters/06_Combat.md` | Initiative, phases, actions, defense, damage, conditions, Down, Injuries | |
| `chapters/07_Advancement.md` | Level table (stage, stats, nodes, die, Prime, Signatures), Evolve, Final Form, respec, Samples, pay | |
| `chapters/08_Gear.md` | Weapon frames + mods, armor, kit, starting kits | |
| `chapters/09_Running_the_Game.md` | GM advice, missions, Spill Clock, downtime, factions, generator | |
| `chapters/10_Threats.md` | BR/MR ratings and fair band, threat table v0.3, roles + traits with rating deltas, Heavy package, unit budget, party size, 30 threats + 3 Bosses (generated stat blocks) | Stat blocks come from `tools/threat_blocks.py` |
| `chapters/11_Starter_Mission.md` | *Pumpstation 9* + 5 pregens (one per Form) | Pregens are builder examples |
| `chapters/12_Quick_Reference.md` | One-page cheat sheet | Update when rules change |
| `chapters/13_Character_Building_Guide.md` | Step-by-step build (L1), leveling 1–10, Evolution checklist, builds by Form, common mistakes, worked example (Dree, Siren, L1 / L4 / L7) | Player-facing summary; rules chapters win on conflict. Update its tables if ch 2–8 numbers change |
| `sheets/Character_Sheet.md` / `.html` | Fillable/printable sheet | |
| `art/*.jpg` | AI-generated placeholder art (8 images) | Replace freely |
| `tools/balance_sim.py` | Monte Carlo combat sim (v0.2 Forms and stages) | Re-run after number changes |
| `builder/index.html` | Character builder web app (single offline file; GitHub Pages: https://xenodorian.github.io/BeelzRPG/builder/) | **Game data lives in the `MUTAGEN` object in the first `<script>`**; update it with any rule change in ch 2–8 |
| `tools/builder_test.js` | Headless builder test (jsdom): 8 examples, 3,000 random characters, v0.2 gates/Evolution/Signature/migration tests, R1–R17 (263 checks) | Run after editing the builder or its data (`npm i jsdom`) |
| `tools/check_builder_data.js` | Cross-checks the builder data block against ch 2, 2A, 3 (+ tree files), 4, 5, 7, 8, 11, 13 (493 checks) | Run after any rules change; no dependencies |
| `tools/builder_flows.js` | Real-browser flow tests (Playwright + Chrome) | `npm i playwright-core`; set `CHROME=/path/to/chrome` |
| `tools/tree_compare.py` | Per-Form expected DPR / HP lost / Flux per fight at L1, 3, 4, 6, 7, 10 | Re-run after node changes |
| `tools/encounter_sim.py` | Encounter sim with real builder characters (party 2–6, positioning/clumping), BR/MR ratings: `python3 tools/encounter_sim.py rate "Name"` | Ratings definition and fair band live in `rating()` / `BAND` |
| `tools/encounter_roster.py` | Threat table v0.3, roles, threat builder, the ch 10 roster as data (+ `MUTAGEN_OLD=1` for v0.2 "before" runs) | Source of truth for ch 10 stat blocks |
| `tools/sim_data/roster_tuning.json` | Per-creature [HP, Damage] factors from tuning | Written by `tune_roster.py` |
| `tools/tune_roster.py` / `calibrate_table.py` | Tune one creature to its target rating / re-solve the threat table | |
| `tools/encounter_math.py` | Experiments: final ratings (p2–6), step value, difficulty sweep, party budget, mixed validation, trait deltas, boss scaling, repatch | Writes `tools/sim_results/` |
| `tools/threat_blocks.py` | Regenerates the ch 10 roster table and stat blocks from the data | Paste output into ch 10 |
| `tools/ch11_check.py` | Starter-mission fights at 3/4/5 players | |
| `tools/check_links.py` | Link and anchor check for every Markdown file | Run before pushing docs |
| `arcade/index.html` + `app.js` | Arcade (Gauntlet mode) page: screens, party creation, battle UI, level-up UI | Live at https://xenodorian.github.io/BeelzRPG/arcade/ |
| `arcade/engine.js` | Arcade rules engine, no DOM: encounters, combat, enemy AI, auto-play, level-ups, runs, saves (`window.MutagenArcade`) | Rules simplifications are listed under *Arcade* |
| `arcade/mutagen_rules.js` | **Generated** from `builder/index.html` (data block + rules code) by `node tools/sync_arcade.js` | Re-run after any builder change; `--check` is part of the arcade test |
| `arcade/roster.js` | **Generated** from `tools/encounter_roster.py` + `sim_results/04_ratings_final.json` by `python3 tools/export_arcade_roster.py` | Re-run after any roster/rating change |
| `tools/arcade_test.js` | Arcade tests (jsdom + Node): sync, party save/load/import, level-ups/Evolutions 1→10 for every Form, seeded auto-play of all 10 levels per difficulty with win rates, page flow | `node tools/arcade_test.js [runs]` (`npm i jsdom`) |
| `tools/arcade_shots.js` | Arcade screenshots + real-Chrome smoke test (puppeteer-core) | Writes `arcade_{start,party,battle,levelup,mobile}.png` |
| `tools/arcade_stress.js` | Arcade stress test: seeded runs per difficulty × permadeath/standard, invariants, mid-fight save/resume, softlock and round-cap detection | `node tools/arcade_stress.js [runsPerDiff] [seedBase]` |
| `tools/arcade_fuzz.js` | Random-click fuzz of the arcade in real Chrome (puppeteer-core) | `CHROME=… node tools/arcade_fuzz.js [actions] [url] [desktop\|mobile]` |
| `tools/build_single.py` | Builds the single-file edition `dist/Mutagen.html` (+ root copy `Mutagen.html`) | Re-run after any chapter/builder/arcade/art change |
| `tools/single_test.js` | Offline headless-Chrome test of `dist/Mutagen.html` (27 checks) | `CHROME=… node tools/single_test.js` |
| `Mutagen.html`, `dist/Mutagen.html` | **Generated** single-file edition: rules, builder, arcade, sheet | Don't edit by hand |
| `tools/grid_budget.js` | Grid check of the ch 10 budgets: fresh party vs the book's Hard budget on the arcade map (no arcade difficulty factors) | `node tools/grid_budget.js [N=60] [party=4] [threat=1] [seed=7000]` → `tools/sim_results/13_grid_budget_*.md` |
| `chapters/14_Arcade_vs_Tabletop.md` | Appendix: what the arcade does differently from the book | Update when the engine gains a convenience or knob |
| `tools/sim_results/` | 00 expectations, 01 table, 02 before + pass 1, 03 pass 2, 04 final ratings (md/csv/json), 05/05b step value, 06 difficulty, 07/07b mixed validation, 08 party budget, 09/09b trait deltas, 10 seed-2 repeat, 11 starter mission, 12 boss scaling, 13 grid budget | Raw results of the enemy calibration |

## Style Guide
- **Format:** GitHub-flavoured Markdown, one chapter per file, numeric prefixes (`NN_Name.md`). Images via relative paths (`../art/x.jpg`).
- **Voice:** second person ("you"), plain and punchy, a little wry. Short sentences. The owner's homebrew uses a direct, conversational voice; match it.
- **Coherence first** (v0.2: the owner dropped "keep it simple"): depth is welcome, but every rule must be unambiguous, balanced and playable at the table. Still prefer one scaling rule over near-duplicates, and mix-and-match parts (Shape + Effect + Twist, T + Role + Traits, Frame + Mod) over long lists.
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
| **Apex** | Capstone node of a tree; level 7+, 6 other nodes in the tree, primary or secondary tree only | Ch 3 |
| **Area / Single** | Attack types; Area deals half on a successful defense or miss | Ch 6 |
| **Armor** | Flat reduction per hit, max 4 (5 with Unbreakable, 6 with Siege Hide) | Ch 6, 8 |
| **Augment / Node / Root / Tree** | Your skill-tree abilities; Root unlocks a tree; 10 standard nodes per tree | Ch 3 |
| **Base Form** | One of five body plans (Juggernaut, Skitter, Oracle, Alembic, Siren): sets your +3/+2/+1 stats and your primary/secondary/tertiary trees | Ch 2A |
| **Bio / Chrome / Splice** | **Material** of a tree (grown / installed); Splice = you have both | Ch 3 |
| **Boss Rating (BR) / Minion Rating (MR)** | Party level at which 1 / 4 of a creature is a fair fight for 4 fully rested freelancers | Ch 10 |
| **Fair fight** | Win ≥ 90%, someone Down 40–60%, death ≤ 5%, 3–7 rounds (= a Hard fight) | Ch 10 |
| **Units / budget** | Encounter currency: Hard = 1 unit per freelancer; creature value from rating − party level | Ch 10 |
| **Heavy / Pack (kinds)** | Heavy: big-Area enemy with a horde penalty (BR ≈ MR); Pack: enemy with group Traits (MR ≫ BR) | Ch 10 |
| **Engulf** | Heavy Area bonus: +2 × Bonus per freelancer caught beyond the first (max 2) | Ch 10 |
| **Bloom / Glitch** | Overload tables for Bio / Chrome | Ch 5 |
| **Breather / Lockdown** | Short rest (½ HP, Flux 0, 2 per Lockdown) / full rest | Ch 1 |
| **Churn** | Quick action: +1 Flux, roll one more Prime; not on a turn you Unleash | Ch 4 |
| **Crit** | Natural 20 on an attack: double damage dice | Ch 1 |
| **Death mark** | 3 while Down = dead | Ch 6 |
| **Defense** | Dodge (Moxie), Endure (Grit), Resist (Nerve), + Rank | Ch 1, 6 |
| **Down** | At 0 HP | Ch 6 |
| **Effect / Shape / Twist** | Surge building parts | Ch 4 |
| **Emergence** | The on-screen moment after an Evolution: temp HP 2 × level, nearby enemies Shaken, first Signature Amped | Ch 2A |
| **Evolution (I / II)** | The metamorphosis at level 4 / 7: new stats, +1 Prime, bigger die, an Evolution node, a Signature Surge, a new look | Ch 2A |
| **Evolution node** | A Form-exclusive node on its primary tree, granted at L4 and L7 | Ch 3 |
| **Final Form** | Level 10 third stage: Final look; once per Lockdown primary +2, Prime two extra, every Surge Amped | Ch 2A, 7 |
| **Firmware / Knit** | Chrome / Bio Material perks | Ch 3 |
| **Flux / Flux Limit** | Instability; Limit = 4 + Rank + Nerve | Ch 5 |
| **GRAFT** | The players' employer | Ch 0 |
| **Guard** | Number players attack against; from v0.2 its own column in the threat table (stalls at T4, T7) | Ch 10 |
| **Injury** | Temporary harm from going Down (d6) | Ch 6 |
| **Juice** | Reward token: reroll, choose a Prime, or end a condition | Ch 1 |
| **Knack** | Narrow trained specialty; adds Rank to checks | Ch 1 |
| **Last Gasp** | Once per Lockdown: Overload instead of going Down | Ch 5 |
| **Mutagenic X** | Threat trait: adds Flux when it damages you | Ch 10 |
| **Origin** | Background: a Knack + a Perk | Ch 2 |
| **Overload** | Exceeding Flux Limit: damage + table roll, Flux → 0 | Ch 5 |
| **Patch / Rally / Taunt / Brace / Help** | Baseline actions | Ch 6 |
| **Material** | Bio or Chrome, chosen per tree (formerly "Form") | Ch 3 |
| **Omen** | Foresight's set-aside d20 (Oracle, Evolution I) | Ch 3 (Senses) |
| **Prime / Primed** | Surges rolled ready at combat start (2; 3 from L4; 4 from L7) | Ch 4 |
| **Primary / Secondary / Tertiary** | Your Form's three stats (+3/+2/+1) and three trees | Ch 2A, 3 |
| **Push** | Gain 1 Flux for a node's extra effect | Ch 3 |
| **Rank** | ⌈level/2⌉, 1–5; added to attacks, defenses, Knack checks; scales everything | Ch 1 |
| **Role / Trait / T (Threat level)** | Enemy-building parts | Ch 10 |
| **Sample** | Harvested Boss/Elite part, spliced in as a Surge | Ch 7 |
| **Scar / Fault** | Permanent Bio / Chrome Overload quirk | Ch 5 |
| **Scrip** | Money | Ch 8 |
| **Sequence / Sequence die** | Your numbered Surge list; d4 / d6 / d8 / d12; empty slots are Wild | Ch 4 |
| **Signature Surge** | Always-ready Surge (once per round), one per Evolution; not on the Sequence | Ch 4, 2A |
| **Stage** | Base / Evolution I / Evolution II / Final | Ch 2A |
| **Spill / Spill Clock** | The disaster; the GM's 6-segment mission timer | Ch 0, 9 |
| **Stats** | Grit, Moxie, Nerve, Gumption, Chutzpah; set by Form and stage | Ch 2, 2A |
| **Tier I / Tier II** | Node tiers: Tier I needs the Root; Tier II needs level 4+ and 3 nodes in the tree | Ch 3 |
| **Surge / Unleash** | Random combat power / the action that uses it | Ch 4 |
| **TN (Threat Number)** | Enemy's Attack DC (players defend vs it); separate from Guard in v0.2 | Ch 10 |
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

### v0.2: Base Forms & Evolution (2026-10-28)
- [x] Spec (v0.2 Design above)
- [x] Ch 2A Forms & Evolution (new); ch 3 split into six 10-node tree files
- [x] Ch 0, 1, 2, 4, 5, 6, 7, 8, 9, 10 (threat table v0.2 + 9 new threats + 2 Bosses), 11 (5 pregens), 12, 13 (rewritten), README, sheets (md + html)
- [x] Balance sim + per-Form model rerun; Balance v0.2 tables
- [x] Builder v0.2 + tests (jsdom, data check, browser flows), screenshots
- [x] Consistency pass (137 links, 0 broken after one fix) and written playtests at L1 / L4 / L7

### Quality
- [x] Math pass: hit/defense odds per level, damage vs HP, encounter budget (see Balance)
- [x] Glossary: every capitalized game term defined
- [x] Playtest walkthrough: L1 and L5 rounds (see Playtest)
- [x] Consistency pass: link/anchor check (0 broken), cross-chapter numbers
- [x] Sanity check 2026-10-28: logic + per-tree balance review (see section below)
- [x] **Enemy calibration (2026-10-28):** BR/MR ratings, threat table v0.3, 33-creature roster with Heavies and Packs, sims for party 2–6, expectations E1–E12 tested, recalibrated, ch 9/10/11/12 updated (see *Enemy Calibration*)
- [ ] **Live playtest** with real players (needs humans)
- [x] **Arcade mode (2026-10-29, owner request):** `arcade/` Gauntlet battle simulator: difficulty = party size (5/4/3), character + party creation and saving, minion → boss → level-up for levels 1–10, Patient Zero finale, turn-based combat on the real rules, level-up UI, end screens, tests (see *Arcade: Gauntlet mode*)

### Backlog (unclaimed — pick one!)
- [x] More threats: 2–3 per T band, especially T6–T10, plus two more Bosses (T5, T10) *(done in v0.2: 21 threats, Bosses at T1, T5, T10)*
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
- [ ] Arcade: hand-drawn battle map (real positioning instead of catch odds), shops between levels, more Bosses so levels 2–9 aren't centrepieces
- [ ] Encounter builder page (web): pick party size/level/difficulty, add creatures, show units vs budget (data: `tools/sim_results/04_ratings_final.json`)
- [ ] Sim: model terrain/positioning choices (players spreading out vs Heavies), Juice and Last Gasp; re-rate
- [ ] More Bosses at T3, T7–8 (BR 3, BR 7–8), each with a Shift

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
10. **Enemies = T + Role + Traits** with fixed damage, so the GM can build a threat in under a minute. *(v0.1 formulas superseded: the v0.3 table is calibrated by simulation; see Enemy Calibration.)*
11. **Conditions have one default duration** (end of the affected creature's next turn) and Bosses shed one per Enemy Phase, so control Surges stay strong without locking down bosses.
12. **Markdown, one chapter per file**: renders on GitHub, diffs cleanly, and lets several contributors work at once without merge conflicts.
13. **Enemy ratings are measured, not guessed** (2026-10-28). BR/MR come from `tools/encounter_sim.py` with real builder characters; the threat table, roster numbers, budget and party-size rules were recalibrated from the sims. A GM-built threat uses the role's typical BR/MR + Trait deltas (ch 10 §3–4).

### v0.2 decisions (2026-10-28, owner request: Base Forms & Evolution)
13. **Five Forms over six trees; Limbs is the shared tree.** Forms are a Latin square: every stat is primary once, secondary once and tertiary once, and each Form's tertiary stat is the one *before* its primary in the stat order. The first square (tertiary = the next stat) dumped both the Oracle's Grit and Moxie (147% HP lost per fight) and gave the Alembic Limit 4, so it was rotated. Limbs is never primary, so it has no exclusive nodes. It is secondary for Juggernaut and Skitter and tertiary for Siren.
14. **Stat values by stage**, exactly as the owner asked: Base +3/+2/+1/+0/−1; Evolution I = +2 primary, +1 others (+5/+3/+2/+1/+0); Evolution II = +3 primary, +1 others (+8/+4/+3/+2/+1). The only choice is which dump gets +0. **The stat boosts at 3/6/9 are gone** (stats change only when the body does). Those levels give a Knack instead (Knacks at L1 ×3, L3, L6, L9). There's no +5 cap.
15. **Trees have 10 standard nodes**: Root, 4 Tier I, 4 Tier II, Apex. The two **Evolution nodes** sit on the Form's primary tree as extras and are granted automatically at L4/L7 (the owner's "exclusive unlock", read as automatic). Gates: Tier II = L4+ and 3 nodes in the tree; Apex = L7+, 6 other nodes, primary or secondary tree only. Evolution nodes don't count toward gates.
16. **Picks:** L1 = 3 primary, 2 secondary, 1 tertiary (each tree's Root first). Each later level = 1 primary pick (automatic, but you choose *which* node) + 1 secondary-or-tertiary pick. The primary tree fills at L8, so at L9–10 the primary pick **overflows** into secondary/tertiary. Totals 2L+4 (+ Evolution nodes). **Respec** swaps one node of the same pick type per level-up.
17. **Sequence die d4 / d6 / d8 / d12** (L1 / 2–3 / 4–6 / 7–10). The owner asked for "a jump in die size" per Evolution; d8 → d12 skips d10 so Evolution II is the bigger jump (and leaves 3 Wild slots, "powers you don't understand yet"). Prime 2 → 3 → 4 (the old "Prime 3 at L5" is removed).
18. **Signature Surges** (one at each Evolution) are always Primed and re-Prime at the start of your next turn after use, so once per round. They cost normal Flux (Flux is the throttle), don't count toward Surges known, Prime or the Primed maximum, can't be Amped by doubles (only Emergence's first use and Final Form), and Firmware can't swap them. You may rebuild one per level-up. The Lab Escapee perk never adds Signatures.
19. **Emergence** is a one-time on-screen moment in the first combat after Evolving: temp HP = 2 × level, enemies within 30 ft are Shaken (not Bosses), and the first Signature use is Amped. The numbers change at level-up; Emergence is the payoff scene. There's an optional Chrysalis downtime scene.
20. **Final Form is the third stage** (L10): a permanent Final look, plus once per Lockdown primary +2, Prime two extra, and every Surge Amped (Signatures too).
21. **Surge attack stat** = the Shape's stat **or** the stat of the tree that unlocked the Effect (Hide Grit, Limbs Grit/Moxie, Senses Nerve, Glands Gumption, Wiring Moxie, Mind Chutzpah). This replaces "Dread may use Chutzpah", so every Form can attack with its primary stat. Kinetic uses the Shape's stat only.
22. **"Form (Bio/Chrome)" renamed to Material**, to free "Form" for Base Forms. Knit, Firmware, Upkeep and Splice are unchanged.
23. **Threat table v0.2 splits Guard from TN.** Guard stalls at T4 and T7 so each Evolution feels like a jump; HP and damage were raised to match (see D6). Role Guard modifiers: Mook/Brute −1, Skirmisher/Boss +1. New DCs 25 (Monstrous) and 28 (Mythic); DCs don't scale with level.
24. **Node fixes found by the sims:** Lightning Step's extra attack uses half damage dice (the Skitter was ~65% ahead at L7). Siren Song sends Taunted enemies at the Siren *or one named ally* (it was pulling all fire onto the most fragile Form). Hive Mind = "one ally Primes one extra" (no longer +1 Prime for you). Unbreakable = Armor max 5 (its no-Prone part moved to Anchor). Bloom #12 renamed *Flowering* (it clashed with Bloom the table).
25. **The Oracle and Siren are fragile by design** (dump Grit; the Siren also has the lowest Limit: 4 / 6 / 9). The Juggernaut and Alembic are the durable Forms.
26. **v0.1 saves migrate** in the builder: identity, Origin, Knacks, gear, Surges, Drive and notes are kept; stats, nodes and Materials are reset, and a banner asks for a Form. Signatures and Evolution nodes are never stored in old saves, so nothing else needs mapping.

## Balance (math pass, v0.1 — superseded by Balance v0.2 above)
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

## Playtest Walkthroughs (v0.1 — kept for history; see Playtest v0.2 above)
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
- 2026-10-29 (arcade): auto-play at book budgets won ~99% of fights on every difficulty: the sim ratings assume a less careful party, and the arcade's AI uses every node. Added a per-difficulty threat factor (×1.25/1.6/1.75) and ramped it in over levels 1–2, because most early losses were fragile level-1 sheets against the Brood Matriarch. Two of 40 random Hard parties (for example three Sirens against the psychic Drowned Choir) still hit a wall even with Mercy. That's accepted on Hard; Mercy goes up to 10 retries.
- 2026-10-29 (arcade): found by the arcade's level-up loop: a Scar such as Sticky Sequence shrinks the Sequence and left a sheet illegal (too many Surges). The arcade now drops the last Surge when that happens (`tidy()`). The builder only reports the error, which is right for a sheet editor.
- 2026-10-28 (enemy calibration): previous run was interrupted before docs; resumed from commit 8ca1bae. Found and fixed: uncapped AoE per-PC bonus (137 damage per clumped freelancer), Apex multiplying pack/AoE bonuses, rating extrapolation running to 13 on flat curves, tuner turning the Leviathan into a damage-less sponge and failing near L10 (hand-tuned), Ward Tough rating flipping on Damage rounding at T1, Brood Matriarch over the 5% death limit, Mother of Rust one-shotting with a 67-damage area. ch 10's old Cost/Budget system, v0.2 table and anchors replaced; ch 11 link to the Matriarch block updated.
- 2026-10-28 — **v0.2 rewrite** (owner: Base Forms & Evolution). Files touched: every chapter, README, sheets, builder, all tools. Commits df621ff (spec), 97d77a8 (trees), 5213118 (Forms/Surges/Flux/Advancement), 1e861cc (threats, pregens, GM guidance, sims), 842c78c (guide, quick ref, intro, sheets), b07f1e0 (builder + tests) and this hub update.
- 2026-10-28 — v0.2: the first Forms Latin square left the Oracle with two dump stats in its defenses (147% HP lost) and the Alembic at Limit 4. Rotated (tertiary = previous stat); ch 2A, ch 2 example and sims updated.
- 2026-10-28 — v0.2 sims: Lightning Step full-dice → half dice (Skitter ~65% ahead at L7); Siren Song now redirects to the Siren *or a named ally*; tree_compare overstated HP loss (1.0 attack/round, 1.6 while Taunting).
- 2026-10-28 — v0.2 ruling: Evolution nodes **don't count** toward Tier II/Apex gates ("nodes in that tree" = standard nodes). Added to ch 3; the builder implements it. (It never changes an outcome on the primary tree, but it had to be stated.)
- 2026-10-28 — v0.2 consistency pass: one broken anchor (ch 11 → `#boss-the-brood-matriarch-t1`, the heading gained "(T1)"). Fixed. No other stale v0.1 rules text found (stat boosts, Prime 3 at L5, "three other nodes", "Dread may use Chutzpah", Knacks at 4/8).
- 2026-10-28 — v0.2 playtest: L7 alpha strike melts lone Elites/Brutes before they act. Added ch 10 guidance and a damage gate on the Feral Evolved (stops at half HP the first time, then Emerges). No threat-table change; see Open Question 15.
- 2026-10-28 — Builder: headless Chrome now launches in this environment; `tools/builder_flows.js` ran for the first time: **33/33 flows pass**.
- 2026-10-28 — Builder: the 4 ch 11 pregens + Mags are now examples (backlog item done).
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

**v0.2 (2026-10-28, Base Forms & Evolution).** The steps are now Start, **Form & Stats**, Origin & Knacks, Augments, Surges, Gear, Extras & Drive, Sheet.
- **Form & Stats** shows five Form cards (primary/secondary/tertiary stats and trees, dumps, exclusives). A radio picks which dump gets +0. There is a stat table by stage (Base / Evo I / Evo II / Final) and a table of stage looks per Material, copied verbatim from ch 2A.
- **Augments** shows only the Form's three trees, tagged primary/secondary/tertiary, with Tier I / Tier II / Apex headers. It enforces the v0.2 gates (Tier II L4+ and 3 standard nodes; Apex L7+, 6 others, primary or secondary only) and the pick budget (primary min(10, L+2); secondary + tertiary L+2 + overflow, secondary ≥ 2, tertiary ≥ 1). Evolution nodes appear as ★ *Granted* / *Level N* and are added automatically (never stored). Bio/Chrome is chosen per tree.
- **Surges** has a Signature section (1 at L4, 2 at L7) built from the same parts, with its own Twists. Signatures are kept off the Sequence and out of the Surges-known count.
- **Numbers:** d4/d6/d8/d12, Prime 2/3/4, Knacks 3/4/5/6, stage stats, Final Form (+2 primary) and Emergence on the sheet. There are no stat boosts. Armor max is 4/5/6. The Surge attack stat is the Shape's stat or the stat of the tree that unlocked the Effect.
- **Sheet:** adds Form, Stage, Look, a trees table with roles and Materials, Evolution nodes, a Signature table and a Final Form box.
- **Example menu:** Dree L1 / L4 / L7 (ch 13) and the five ch 11 pregens (Vex, Juno, Ozzie, Rook, Mags), all checked against the chapter numbers.
- **Import:** v0.1 saves are **migrated**, not rejected (see Decision 26). The save version is `v:2`.
- `window.MutagenBuilder` exposes `derive`, `randomChar(level, formId)`, `fromExample`, `picks`, `gate`, `formStats`, `normalize` and `trimToLevel` for the tests.

**Tested v0.2 (2026-10-28):**
- `tools/check_builder_data.js`: **493 checks, 0 mismatches.** It now also parses ch 2A and the six `chapters/03_Trees/*.md` files (node name, tier, Push), the ch 3 Evolution table and the ch 11 pregen numbers. Deliberately planted mismatches are caught.
- `tools/builder_test.js` (jsdom): **255 checks, ALL PASSED, 0 JS errors.** It covers the 8 examples, 3,000 random characters (all Forms, all levels) plus per-Form runs, 25 illegal builds rejected, Evolution stats, nodes and Signatures at L3→L4 and L6→L7, migration of a v0.1 save, DOM flows, and R1–R14 adapted to v0.2.
- `tools/builder_flows.js` (Playwright + headless Chrome, `file://`): **33/33 flows pass**, the first successful run of this suite. Print is 2 pages at L1, L4, L7 and L10. A v0.2 sheet carries more (Signatures, the Form box), so the L1 print went from 1 page to 2.
- Screenshots: `/workspace/mutagen_builder_v2_{form,augments,surges,sheet}.png` (on the build box, not in the repo).

*(v0.1 description below, kept for history.)*

**Features (v0.1):** 8-step wizard following ch 13 (Start, Stats, Origin & Knacks, Augments, Surges, Gear, Extras & Drive, Sheet) with per-step error/warning badges; level 1–10 selector driving Rank, HP, defenses, Limit, Sequence die, Prime, Surges known, node picks, Twist count, Apex gating, Plating, Knack count, stat boosts, Final Form; stat array validation; Origin cards (+ d6 roll) and Knacks with examples; tree picker enforcing Root-first, Apex rules, Bio/Chrome per tree, Splice detection, Knit/Firmware/Upkeep; Surge builder limited to unlocked parts with Twist compatibility, live Flux, dice, attack and rider text, Firmware (⚙) marking, reorder/remove, sample list, harvested Samples, Wild slots; gear with kits, kit weapon choices, Mods (100), buying weapons/items/armor/Shield, Scrip ledger with mission-pay estimate, Upkeep; Scars/Faults (with number effects), Patch Applied, Drive, notes; live summary panel; printable sheet laid out like `sheets/Character_Sheet.html` (print hides the app); autosave + named saves in localStorage, JSON export/import; Random legal character at any level; Example menu (Dree L1/L5).

**Tested v0.1, 2026-10-28:** `tools/builder_test.js` (jsdom): 0 JS errors; Dree L1 and L5 match ch 13 exactly (HP 12/34, Armor 1, Speed 40, Dodge/Endure/Resist +4/+1/+3 and +6/+4/+6, Limit 6/9, Scrip 25 at L1, d4/d8, Prime 2/3, 1 Wild); 3,000 random characters (300 per level) all legal; 13 illegal builds correctly rejected; Sample and Lab Escapee slot rules; Splice Limit floor; DOM events (node click, stat select, Random, Save). Headless Chrome from `file://`: no console errors, localStorage works, print-to-PDF produces only the sheet (2 pages for a level 5 character), mobile layout at 390 px.

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

**Tests:** `tools/builder_test.js` (jsdom) adds regression tests R1–R14 above, on top of the earlier suite (worked example, 3,000 random characters, 13 illegal builds). `tools/check_builder_data.js` checks the rules against the data block. `tools/builder_flows.js` (Playwright + Chrome) covers real user flows: keyboard focus, level down + fit, Root removal, Form switching, reordering, overspending, hostile imports, reload persistence, Back button, long names, 375 px layout, storage disabled/full, unlabelled controls, print page counts at L1/L5/L10, and console errors. **Status:** the jsdom suite and the data check pass (ALL TESTS PASSED, 0 JS errors; 320 checks, 0 mismatches). The flow probe ran in Chrome *before* the fixes and found bugs 1–2, 5–8 and 19. `builder_flows.js` was written afterwards, but the build sandbox then blocked Chrome launches, so it has **not yet been run against this build**. Next contributor with a browser: run it and log the result here. Any failures are more likely selector drift than app bugs. *(Update v0.2: it has now been run in headless Chrome: 33/33 pass; see above.)*

### Builder backlog (bigger ideas, not done)
- [ ] **Play mode:** Prime/Churn roller, Flux tracker with Overload prompts, HP/Juice/Death-mark counters on the saved character.
- [ ] **Level history:** record which node and Surge came at which level, so respecs and "level down" are exact instead of newest-first.
- [x] **Shareable link:** done 2026-10-29 (Link button, `#c=` hash).
- [x] **Hands check:** done 2026-10-29 (Shield + two-handed weapon warns unless Extra Arm).
- [x] **Pregens as examples:** done in v0.2: all five ch 11 pregens, plus Dree at L1/L4/L7, are in the Example menu and tested.
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
12. ~~**No base Infuse Effect.**~~ *Closed in v0.2: every Form has a tree with an Infuse Effect, and nodes now come only from your Form's trees.*
13. **Siren Limit (4 / 6 / 9).** She runs dry by round 3 at every stage. That's intended (the Overload Form), but it's the most common "nothing to do" moment in playtests. Option: let Commanding Voice's Rally lose 1 Flux once per combat.
14. **Signature riders every round.** An always-ready Signature with a condition rider (Blinded, Dazed, Held) can re-apply it every round and lock one non-Boss all fight. Option: "a creature that ends a condition from your Signature can't get it again from that Signature until the end of its next turn."
15. **L7 alpha strike.** Four optimised L7 freelancers deal ~150–185 a round, more than one T7 Elite or Brute has (144). This is handled by encounter guidance and a damage gate on the Feral Evolved. If live play shows Hard fights at L7–8 are still routs, raise T7–8 HP; untested, so re-run `tools/balance_sim.py` before changing anything.
16. **Foresight / Thousand Eyes strength.** The Omen (replace any nearby d20 once a round) is the strongest Evolution I node on paper, and Thousand Eyes is the one explicit exception to non-stacking Crit ranges (17–20 with Deadeye). Watch the Oracle at L7+.
17. **Haste Signatures.** *Live Feed* (Infuse + Haste) gives an ally an extra Move + Action every round for 1 Flux. It is strong in a party with one big hitter. Fine as the Siren's identity, or limit Haste Signatures to once per combat?

18. **Big enemy hits.** The v0.3 table makes a failed defense cost ~⅔ of an average freelancer's HP (defenses succeed ~50%). Same ratings could be reached with a higher TN and lower Damage (less swing, more chip damage). Worth a live-play check; `calibrate_table.py` can solve either way.
19. **Patient Zero vs 3 freelancers** is still win 79% after Boss scaling (HP & Damage ×¾). Option: it Blooms 1 Husk instead of 2 for small parties.
20. **Support Traits are cheap.** Mender and Damper Field barely move ratings in the sim (the AI heals and Surges simply). Either they're under-modelled or they need to be stronger.
21. **Area positioning is the biggest assumption.** Heavies' ratings assume a party that neither clumps nor spreads on purpose (catch odds 30/45/65% for 10/20/30 ft). A table that fights in corridors will find Heavies above their BR. *(2026-10-29, arcade v2 evidence: on a real grid the first build of the arcade's auto-player caught 2.6 freelancers per enemy Area and lost far more; even after it learned to spread out, the arcade needed threat ×1.0/1.22/1.38 instead of ×1.25/1.6/1.75 off-map, i.e. positioning makes fights ~20% harder. ch 10 §7 now says so; ratings left unchanged.)*
22. **Evolution-wall clustering.** Many ratings sit at 6.8–7.0. If a finer scale is wanted between L6 and L7, rate with half-levels (impossible with real characters) or publish fractional ratings.
23. **Drowned Choir BR** is 7–8 depending on seed (flat danger curve); published as 8.
24. **Grid outliers** (`tools/sim_results/13_grid_budget_p4.md`, book Hard budget, party of 4): Ostrander Paladin 58% won, Drowned Choir 65% won / 30% deaths, Hunter-Killer Unit 80%, Drain Beast 14% deaths; L10 group fights 67% won, L2 group fights 20% deaths. Small samples (20–60 fights each) and off-map ratings say they're fine, so the ratings stand. If tables report the same, raise those ratings by 1 on a grid.
25. **Arcade simplifications worth building** (ch 14): Haste's Move, cover and difficult terrain, Juice reroll of a d20, Adaptive, Arc Jump, Wall Run.

## Hosting (GitHub Pages)

- Every push to `main` deploys the whole repo to https://xenodorian.github.io/BeelzRPG/ via `.github/workflows/pages.yml` (Jekyll build, so Markdown chapters render as HTML; `.html` files are served as-is).
- Builder: `/builder/`. Printable sheet: `/sheets/Character_Sheet.html`. Check the Actions tab if a deploy fails.
