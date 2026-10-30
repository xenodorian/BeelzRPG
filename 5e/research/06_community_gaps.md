# Research 06: Community Gaps in 5e Classes, and What the Mutant Does About Them

**Step 6 of the owner's plan:** "examine the weaknesses and common complaints people have about dungeons and dragons 5th edition classes, and try to fill in any gaps in functionality that the community feels are missing." Each gap below lists where the complaint comes from, whether the Mutant already answered it, the fix applied in this step, and its balance cost. The bench was re-run afterwards (§3).

## 1. Sources

| # | Source | Complaint |
|---|---|---|
| S1 | r/dndnext, "What's your experience with the martial-caster divide?" (2024) — https://www.reddit.com/r/dndnext/comments/1aj9bcn/whats_your_experience_with_the_martialcaster/ | A Fighter in a social/exploration-heavy game has "nothing on my character sheet that lets me do anything beyond just skill checks"; casters solve mundane and magical problems with 1st–3rd-level spells |
| S2 | r/DnD, "What *is* the martial/caster disparity?" (2022) — https://www.reddit.com/r/DnD/comments/xpyhu2/what_is_the_martialcaster_disparity/ | "The real disparity is in-combat control": casters shut down groups (*hypnotic pattern* at 5th); martials only lock down one target |
| S3 | r/onednd, "What really is the PRIMARY issue causing the martial-caster divide?" (2023) — https://www.reddit.com/r/onednd/comments/16r3doq/what_really_is_the_primary_issue_causing_the/ | Martial turns are repetitive ("attacking, and not much else"); they never feel superhuman; they rely on specific feats; their staying power depends on 6+ encounter days that tables don't run |
| S4 | r/DnD, "Is the martial/caster divide that bad?" (2024) — https://www.reddit.com/r/DnD/comments/1ecu46t/is_the_martialcaster_divide_that_bad/ | Even "the least versatile spellcaster" has more choices on its turn than a martial; outside combat martials get skill checks |
| S5 | r/dndnext, "Ranger has way too much bonus action competition" — https://www.reddit.com/r/dndnext/comments/gqmfah/variant_class_features_ranger_has_way_too_much/ ; r/onednd, "Ranger's bonus action bloat" — https://www.reddit.com/r/onednd/comments/1f6fv8l/rangers_bonus_action_bloat_is_like_some_weird/ ; Wargamer, "fans are still trying to fix the worst 2024 class" — https://www.wargamer.com/dnd/fans-attempting-to-fix-ranger-homebrew | *Hunter's mark*, companions, spells and subclass features all compete for one bonus action, so features go unused |
| S6 | r/dndnext, "What classes/subclasses have the worst 'dead' level?" — https://www.reddit.com/r/dndnext/comments/o4uf6v/what_classessubclasses_have_the_worst_dead_level/ | Levels that grant nothing (or only a ribbon) feel bad |
| S7 | Form of Dread, "What's in a Day" — https://formofdread.wordpress.com/2021/11/07/whats-in-a-day-the-mathematical-foundations-of-adventuring-in-5e/ ; EN World, "Short Rest Classes: Is the 'Short Rest Problem' a 'Monk Problem'" — https://www.enworld.org/threads/short-rest-classes-is-the-short-rest-problem-a-monk-problem.690956/ ; r/dndnext, "Our party never takes short rests" — https://www.reddit.com/r/dndnext/comments/806a3d/our_party_never_takes_short_rests_a_practical/ | Short-rest classes (Warlock, Monk, Fighter) are built for ~2 short rests a day; tables that skip them starve those classes |
| S8 | EN World, "Does 'Whack-A-Mole' Healing really happen in games?" — https://www.enworld.org/threads/does-%E2%80%9Cwhack-a-mole%E2%80%9D-healing-really-happen-in-games.677252/ ; r/DnD, "Potential solutions to the problem of Healing Word" — https://www.reddit.com/r/DnD/comments/c7gt24/potential_solutions_to_the_problem_of_healing_word/ | "Yo-yo" healing: it's optimal to wait until an ally drops to 0 and pop them up with *Healing Word*; healing a conscious ally is wasted. Suggested fix: make healing a conscious creature worth more |
| S9 | r/DungeonsAndDragons, "very upset with the sub-class level change in the new 2024 PHB" — https://www.reddit.com/r/DungeonsAndDragons/comments/1ekh71g/i_am_very_upset_with_the_subclass_level_change_in/ ; r/dndnext, "Does waiting til 3rd for a subclass hurt your roleplay?" — https://www.reddit.com/r/dndnext/comments/jlmq7y/does_waiting_til_3rd_for_a_subclass_hurt_your/ | Characters whose identity *is* the subclass have to wait until 3rd level |
| S10 | rpgbot, Wild Magic subclass guide — https://rpgbot.net/dnd5/characters/classes/sorcerer/subclasses/wild-magic/ ; r/dndnext, "How often do you use Wild Magic Surge?" — https://www.reddit.com/r/dndnext/comments/172m1oc/how_often_do_you_use_wild_magic_surge_in_your/ ; D&D Beyond, 2024 Wild Magic first look — https://www.dndbeyond.com/posts/1776-first-look-the-2024-wild-magic-sorcery-sorcerer | Random features that rarely fire, or fire against you, feel bad; the 2024 fix guarantees the surge |
| S11 | rpgbot Monk guide — https://rpgbot.net/2024-dnd/classes/monk/ ; Dungeon Mister Monk guide — https://dungeonmister.com/guides/classes-in-dungeons-dragons/monk-5e/ | Multiple-ability dependence (MAD) and one scarce resource (ki) feeding every feature |
| S12 | RPG.SE, "Why is the PHB Ranger considered underpowered?" — https://rpg.stackexchange.com/questions/165279/why-is-the-phb-ranger-considered-underpowered | Situational "ribbon" picks (Favored Enemy, Natural Explorer) that are dead weight when the campaign goes elsewhere, with no way to swap them |
| S13 | EN World, "90% of D&D Games Stop By Level 10" — https://www.enworld.org/threads/90-of-d-d-games-stop-by-level-10-wizards-more-popular-at-higher-levels.666097/ | Most campaigns end before 11th level, so capstones and 14th+ features are rarely seen |

## 2. Gaps, fixes and costs

| Gap | Sources | Already in the step-4/5 design | Fix added in step 6 | Balance cost |
|---|---|---|---|---|
| **No out-of-combat toolkit** (martials only get skill checks) | S1, S3, S4 | Surges work outside combat; Mutations such as Wall Run, Gills, Intrude, Glamour, Analyzer | **Adaptations** (2nd level): grow one of 12 utility traits on a rest (water breathing, climbing, darkvision, scent tracking, camouflage, understanding a language, gas immunity, squeezing, blindsight, heat/cold resistance, voice mimicry); two at 6th, three at 14th. Ritual-like answers to the problems casters solve with *water breathing*, *spider climb*, *darkvision*, *comprehend languages* and *alter self* | none to combat numbers (one Adaptation, Fever Glands, gives a single resistance; *protection from energy* territory, but no concentration and no ally) |
| **Martials can't control groups** | S2 | Wave/Burst/Pulse with prone, restrained, blinded, poisoned, frightened, no-reaction riders for 1 Flux; Siren Song, Psychic Scream, Crown of Will | none needed: the Mutant's area riders are its niche (short, single-round control, below *hypnotic pattern*) | measured in step 5 |
| **Repetitive turns, few choices** | S3, S4 | Each fight's Sequence roll changes which Surges are cheap; Surges are built from Shape + Effect + Twist; Churn and Overload are live decisions every round | **Instinct** (Evolution I): once per long rest choose a Prime result. Keeps the choice when the dice don't cooperate | none (same Surges, cheaper once) |
| **Never feels superhuman** | S3 | Evolutions with new looks at 6th and 14th; Emergence; Final Form | Emergence can now trigger **on initiative** (no action), so the transformation happens at the dramatic moment instead of costing a turn | Emergence's temporary HP and fear arrive one round earlier: negligible |
| **Bonus-action crowding** | S5 | — (step 5 flagged Regeneration, Infuse, Churn, Target Lock, Challenge, Voice die, Siren Song, Emergence, Dash all on the bonus action) | **Regeneration can replace an attack** of the Attack action (from 5th); **Target Lock** can be applied as part of a hit; **Emergence** on initiative; the Siren's **Command die** can be given as part of Unleashing | Regeneration-for-an-attack trades ~7–10 damage for the heal, so it's a real choice; the others move the same effect off the bonus action. No new damage |
| **Dead levels** | S6 | Something at every level in step 4 | ASI-only levels (4, 8, 16) now also add a **Mutation** (Mutations Known 3 at 4th, 5 at 8th, 8 at 16th; same total of 9 at 19th) | utility pacing only; total Mutations unchanged |
| **Short-rest starvation** | S7, S11 | Primes are per fight (always free Surges); Overload lets you keep going at a hit-point cost | **Settle**: when you roll initiative, Flux above half your Limit drops to half. A day with no short rests now plays almost like a day with two (table §3) | +0.6–0.8 DPR at 3rd–8th with two short rests (still ≤ 1.10× martial); removes a 5–10% penalty on days with none |
| **Yo-yo healing** | S8 | Regeneration as a bonus action (like *Healing Word*) | Regeneration on a creature with at least 1 HP also grants **temporary HP = Surge ability modifier**, so healing *before* someone drops is worth more than popping them back up | +3–5 effective HP per use on conscious targets; base Mutant healing still at or below a Bard's *Healing Word*s at every level (§3) |
| **Late subclass** | S9 | Form at 1st level | none needed. The 2024 rules moved subclasses to 3rd partly to stop 1-level dips; step 5 checked the Mutant's 1-level dip (§6) and found it comparable to Fighter/Cleric dips | — |
| **Randomness that fizzles or punishes** | S10 | Primed = discount, never a lock-out; an empty slot gives a free Wild Surge (all beneficial); Controlled Overload (15th) rolls twice | Instinct (above); the Overload tables' worst results last one turn | — |
| **MAD / one starved resource** | S11 | Flux is not the only resource (Regeneration, Form uses, Emergence are separate) | **Single-stat attacks** for the casting-stat Forms: Oracle (Wis, already), **Alembic (Int, Clinical Precision)** and **Siren (Cha, moved to 1st level)**. Juggernaut and Skitter use Str/Dex + Con, the normal martial pair | Siren/Alembic attack with their Surge stat, like an Oracle (bench assumes the main stat for everyone, so no change in the numbers) |
| **Situational picks you can't swap** | S12 | Chrome swaps on a short rest (Firmware) | **Every Mutant can swap one Mutation on a long rest** | none; Firmware still matters (short rest, Surges too) |
| **Campaigns end before 11th** | S13 | Evolution I at 6th, a Form feature at 10th, Signature Surges and Emergence before 11th | none beyond checking that levels 1–10 hold the identity features (Form at 1st/3rd/6th/10th; Extra Attack 5th; Regeneration 1st; Last Gasp 7th) | — |

## 3. Re-check after the fixes

### 3.1 Day DPR / martial average

| Level | Core | Juggernaut | Skitter | Oracle | Core, no short rests | Core, no short rests, before Settle |
|---|---|---|---|---|---|---|
| L1 | 1.10 | 0.98 | 1.05 | 1.11 | 1.04 | 1.04 |
| L2 | 0.92 | 0.82 | 0.88 | 0.93 | 0.88 | 0.88 |
| L3 | 0.99 | 0.91 | 0.95 | 0.88 | 0.95 | 0.86 |
| L5 | 1.10 | 1.02 | 1.06 | 1.00 | 1.06 | 1.00 |
| L8 | 1.10 | 1.05 | 1.06 | 1.04 | 1.09 | 1.00 |
| L11 | 1.13 | 1.08 | 1.11 | 1.15 | 1.13 | 1.05 |
| L14 | 1.09 | 1.05 | 1.08 | 1.11 | 1.09 | 1.03 |
| L17 | 1.06 | 1.03 | 1.07 | 1.08 | 1.06 | 1.02 |
| L20 | 1.02 | 0.99 | 1.03 | 1.04 | 1.02 | 0.99 |

All four builds stay within **0.82–1.15×** of the SRD martial average (Juggernaut sword-and-board at 2nd is the low cell, as before). The last two columns show **Settle** doing its job: with no short rests at all, the step-5 class would have dropped to 0.86–1.00× at 3rd–8th; with Settle it stays at 0.95–1.09×, while the two-short-rest day barely moves.

### 3.2 Healing per long rest

| Source | L1 | L3 | L5 | L11 | L17 | L20 |
|---|---|---|---|---|---|---|
| Cleric (Life), Cure Wounds | 21 | 74 | 142 | 370 | 524 | 644 |
| Cleric (Life), Healing Word | 17 | 58 | 110 | 276 | 382 | 466 |
| Druid, Cure Wounds | 15 | 62 | 116 | 310 | 438 | 538 |
| Bard, Healing Word | 11 | 38 | 76 | 198 | 272 | 332 |
| Paladin, Lay on Hands only | 5 | 15 | 25 | 55 | 85 | 100 |
| Paladin, Lay on Hands + Cure Wounds | 5 | 38 | 85 | 190 | 317 | 360 |
| Ranger, Cure Wounds | 0 | 22 | 60 | 136 | 232 | 260 |
| Fighter, Second Wind (self) | 20 | 26 | 32 | 50 | 68 | 76 |
| *Mutant, Regeneration* | 18 | 36 | 75 | 147 | 270 | 270 |
| *Mutant (Bio), Regeneration* | 22 | 44 | 90 | 175 | 324 | 324 |
| *Alembic, Regeneration + Panacea* | 20 | 46 | 95 | 186 | 448 | 448 |
| *Alembic (Bio), Regeneration + Panacea* | 24 | 54 | 110 | 214 | 502 | 502 |
| *Step-4 draft: Alembic (Bio)* | 48 | 62 | 140 | 346 | 706 | 706 |
| *Step-4 draft: all Flux into Mend* | 135 | 158 | 351 | 832 | 1380 | 1518 |

The base Mutant (18/36/75/147/270) still sits between *Lay on Hands* and a Bard's *Healing Word*s; the Alembic tracks a Druid and stays under a Life Cleric. Nova is unchanged by step 6 (no damage features added).

## 4. Considered and rejected

- **A ritual list** (cast *detect magic*, *comprehend languages* etc. as rituals): replaced by Adaptations, which feel like a body changing rather than spellcasting and avoid importing spell lists.
- **Short-rest Flux → long-rest Flux ×3** (a common fix for short-rest classes, S7): it would make the Mutant nova-heavy on short days; Settle keeps the per-fight rhythm instead.
- **Making *Healing Word*-style range universal at 1st level**: range stays touch until 9th for everyone but the Alembic, which keeps the Alembic's identity and the yo-yo fix meaningful.
