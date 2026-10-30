# Research 05: Balance Check

**Step 5 of the owner's plan:** "once everything is built, sanity check it against other classes to make sure it's not too far below or above the power level that is acceptable for this game." This file compares the Mutant built in step 4 with the SRD 5.1 classes, records what was out of band, what changed, and the numbers after the change.

Tool: `python3 5e/tools/bench.py` (white-room expected damage and healing; assumptions in its docstring and in [research 01](01_SRD_class_analysis.md) §5). The Mutant model is `mutant()` / `mutant_healing()` in the same file; `MUT_V1` keeps the step-4 draft so the "before" numbers can be regenerated.

## 1. Targets (from WORKFLOW §3 and research 01)

| Axis | Target |
|---|---|
| Sustained damage (Day DPR) | within ±15% of the SRD **martial average** (Barbarian, Fighter, Monk, Paladin, Ranger, Rogue) at every tested level |
| Burst (Nova DPR) | no higher than a Paladin's best round from 2nd level (Paladins have no smite at 1st; compare with the Fighter's Action Surge there) |
| Healing per long rest | above a Paladin's *Lay on Hands*, at or below a Bard's *Healing Word*s / Druid's *Cure Wounds* for the base class; the Alembic may reach a Druid but not a Life Cleric |
| Healing per use | equal to *Cure Wounds* at 1st level (the owner's requirement) |
| Resources | a short-rest pool that never runs dry at levels 1–4; no dead levels |

## 2. Model of the Mutant

- **Build:** Strength 16 → 20 (+3/+4/+5 as every bench class), Constitution second. "Core" = greatsword (2d6, no fighting style, which the Mutant doesn't have) and a Strike + Kinetic Surge. Juggernaut = longsword + shield + Challenge; Skitter = natural weapons (mantis blades) + Reflex Spike; Oracle = longbow with Wisdom + Target Lock (which costs 1 Flux per fight).
- **Surges:** Strike is Unleashed only on a turn with a hit (once per turn). Each short-rest window is 2 fights × 3 rounds. Primed Surges are free (one per Prime roll, at most 3 per fight); then Flux pays 1 per Surge; spare Flux buys Overcharge on hit turns. Overload is never used in the Day figure (it costs hit points), so these numbers are a ceiling for a careful player and a floor for a reckless one.
- **Saturated Strikes** (11th), **Final Form** (20th: one fight per day with free Twists and a second Surge each turn) included.
- **Healing:** every Regeneration use per long rest spent on healing; Bio adds Knit; the Alembic adds Field Medic (d10s), Stim Gland's temporary hit points and Panacea on four allies.

## 3. Step-4 draft: what was out of band

| Problem | Evidence (step-4 draft) | Cause |
|---|---|---|
| **Damage far too high** | Day DPR **1.31–1.66×** the martial average at every level (L1 13.2 vs 8.0; L11 42.6 vs 29.6) | Strike on every hit was nearly free: two Primes per fight plus a Flux Limit of PB + ½ level paid for a Surge every turn *and* an Overcharge (+2d8) most turns |
| **Nova above Paladin at 1st–3rd, close above it later** | 19.5 at L1–3 vs Paladin 7.8/14.1/14.1; L20 67.2 vs 56.0 | Amped + Overcharge = +3d8 on one hit |
| **Alembic out-healed a Life Cleric** | Alembic (Bio) 48 at L1 vs Life Cleric 21; 706 vs 524 at L17 | Field Medic added Int-mod uses; Transmute added PB to every Regeneration |
| **Mend was a healing faucet** | spending every Surge on Mend: 135 HP/day at L1, 351 at L5, 832 at L11 (Life Cleric 21/142/370) | Mend healed Surge dice + mod per 1 Flux, and Flux refills on every short rest |
| **Healing dip at 3rd** | base Mutant 15 at L3 = Lay on Hands, below a Paladin with Cure Wounds (38) | Regeneration had 2 uses until 5th and no short-rest refresh until 9th |
| **Skitter spike at 14th** | Lightning Step's free attack each Surge: 1.24–1.26× from L14 | an extra attack per round funded by spare Flux |

## 4. Changes (before → after)

| # | Rule | Before (step 4) | After (step 5) | Why |
|---|---|---|---|---|
| 1 | Surge dice | d8s: 1d8 / 2d8 (5) / 3d8 (11) / 4d8 (17) | **d6s**: 1d6 / 2d6 / 3d6 / 4d6, same levels | the main damage lever: a Strike now adds about a third of a *Divine Smite*'s dice, but on most turns instead of a few times a day |
| 2 | Flux Limit | PB + ½ level (2 → 16) | **½ level, rounded up** (1 → 10) | Flux now binds at low levels, so Overload is a real choice |
| 3 | Prime | 2 from 1st | **1 at 1st–2nd**, 2 at 3rd (Deeper Sequence), 3 at 6th, 4 at 14th | 1st level was the worst outlier; gives 3rd level a real bump (the SRD martial spike there) |
| 4 | Overcharge | +2 Surge dice | **+1 Surge die** | spare Flux was buying too much |
| 5 | Wave/Burst/Pulse bonus | +1d8 | **+1 Surge die** | consistency with change 1 |
| 6 | Saturated Strikes (11th) | +1d8 | **+1d6** | 11th level sat at 1.16× |
| 7 | Mend | Surge dice + mod HP | **the target spends one Hit Die** (+ its Con + your Surge modifier); Overcharge = one more Hit Die | turns Mend into action-economy healing from the party's own reserve (like *Song of Rest* or a Second Wind for an ally), so it can't print hit points |
| 8 | Field Medic (Alembic 1st) | +Int-mod uses | **d10 healing dice**, range 30 ft | Alembic ≤ Druid |
| 9 | Transmute (Alembic 6th) | +PB to every heal | **+PB to Mend only**; Regeneration also ends paralyzed | Alembic (Bio) at 17th was above a Life Cleric |
| 10 | Panacea (Alembic 14th) | 6d8 + Int, everyone within 30 ft | **5d8 + Int, up to six creatures** | in line with *mass cure wounds* + Alembic's identity |
| 11 | Regeneration refresh | 1 use back on a short rest from 9th | **from 3rd** (Deeper Sequence); 9th now gives +1 use | fixes the 3rd–8th healing dip |
| 12 | Target Lock (Oracle, Senses) | free bonus action, 1d6 → 1d8 at 10th | **costs 1 Flux** to mark, stays 1d6 | it was a free *hunter's mark* stacked on Strike |
| 13 | Skitter weapons | natural d8 | **mantis blades d10** from 1st (no increase at 11th) | Skitter (no shield, no greatsword) was 0.80× at 2nd |
| 14 | Reflex Spike (Skitter 3rd) | Surge-mod uses per short rest | **PB uses per long rest**, one back per short rest from 14th | reactions added ~0.2× at mid levels |
| 15 | Lightning Step (Skitter 14th) | free weapon attack with each Surge | **30-ft teleport** with each Surge | 1.24× at 14th |
| 16 | Splice | Flux Limit −1 | −1 (**minimum 1**) | ½-level Flux makes −1 brutal at 1st |
| 17 | Mutagenic Initiate feat | Flux 2, d8s | Flux 1, d6s | follows the class |

## 5. After: the numbers

### 5.1 Sustained damage vs the martial average (ratio)

| Level | Martial Day DPR | Core | Juggernaut | Skitter | Oracle | Step-4 draft |
|---|---|---|---|---|---|---|
| L1 | 8.0 | 1.10 | 0.98 | 1.05 | 1.11 | 1.66 |
| L2 | 9.5 | 0.92 | 0.82 | 0.88 | 0.93 | 1.56 |
| L3 | 11.3 | 0.93 | 0.85 | 0.90 | 0.88 | 1.31 |
| L5 | 21.4 | 1.07 | 0.99 | 1.02 | 1.00 | 1.40 |
| L8 | 24.1 | 1.07 | 1.02 | 1.03 | 1.01 | 1.41 |
| L11 | 29.6 | 1.13 | 1.08 | 1.11 | 1.12 | 1.44 |
| L14 | 30.7 | 1.09 | 1.05 | 1.08 | 1.10 | 1.39 |
| L17 | 34.6 | 1.06 | 1.03 | 1.07 | 1.08 | 1.36 |
| L20 | 38.6 | 1.02 | 0.99 | 1.03 | 1.04 | 1.32 |

Every Form at every tested level is inside **0.82–1.16×**. The only cell under 0.85 is the **Juggernaut at 2nd (0.82)**, which is the price of a shield and Plating (AC 19 at 1st); a Juggernaut with a greatsword matches "Core". The step-4 draft column shows how far out it was.

### 5.2 Day DPR (resources spread over an 18-round day)

| Class | L1 | L2 | L3 | L5 | L8 | L11 | L14 | L17 | L20 |
|---|---|---|---|---|---|---|---|---|---|
| Barbarian | 7.3 | 10.0 | 12.2 | 24.4 | 26.9 | 29.0 | 30.6 | 34.1 | 40.3 |
| Bard | 2.0 | 2.3 | 3.6 | 6.2 | 9.2 | 15.0 | 16.7 | 20.5 | 24.6 |
| Cleric | 3.3 | 3.7 | 6.9 | 13.1 | 19.0 | 28.4 | 29.6 | 32.0 | 37.0 |
| Druid | 3.6 | 4.0 | 6.7 | 11.9 | 16.3 | 18.0 | 19.8 | 24.0 | 25.3 |
| Fighter | 7.8 | 9.1 | 9.6 | 20.7 | 22.2 | 33.3 | 33.3 | 39.7 | 52.9 |
| Monk | 8.1 | 9.3 | 10.0 | 19.4 | 22.8 | 25.6 | 25.6 | 28.4 | 28.4 |
| Paladin | 7.8 | 8.9 | 10.2 | 23.1 | 26.1 | 36.7 | 38.1 | 42.1 | 43.5 |
| Ranger | 5.8 | 8.7 | 11.5 | 22.4 | 23.9 | 23.9 | 23.9 | 23.9 | 23.9 |
| Rogue | 11.0 | 11.0 | 14.4 | 18.4 | 22.5 | 29.3 | 32.7 | 39.6 | 43.0 |
| Sorcerer | 4.6 | 5.0 | 6.7 | 11.9 | 17.7 | 25.6 | 29.0 | 36.5 | 42.1 |
| Warlock | 5.0 | 7.4 | 8.8 | 15.8 | 18.8 | 26.3 | 26.3 | 30.4 | 30.4 |
| Wizard | 4.6 | 5.3 | 7.1 | 11.8 | 15.2 | 22.4 | 24.2 | 28.9 | 32.5 |
| **Average** | 5.9 | 7.0 | 9.0 | 16.6 | 20.0 | 26.1 | 27.5 | 31.7 | 35.3 |
| **Martial average** | 8.0 | 9.5 | 11.3 | 21.4 | 24.1 | 29.6 | 30.7 | 34.6 | 38.6 |
| *Mutant (core)* | 8.7 | 8.7 | 10.6 | 22.9 | 25.7 | 33.4 | 33.4 | 36.8 | 39.5 |
| *Mutant (juggernaut)* | 7.8 | 7.8 | 9.6 | 21.2 | 24.5 | 32.1 | 32.1 | 35.5 | 38.3 |
| *Mutant (skitter)* | 8.3 | 8.3 | 10.2 | 21.9 | 24.8 | 32.8 | 33.2 | 37.0 | 39.8 |
| *Mutant (oracle)* | 8.8 | 8.8 | 10.0 | 21.4 | 24.3 | 33.3 | 33.9 | 37.5 | 40.2 |
| *Mutant step-4 draft (core)* | 13.2 | 14.8 | 14.8 | 30.0 | 33.9 | 42.6 | 42.6 | 47.0 | 51.1 |

### 5.3 Nova (best single round)

| Class | L1 | L2 | L3 | L5 | L8 | L11 | L14 | L17 | L20 |
|---|---|---|---|---|---|---|---|---|---|
| Barbarian | 8.2 | 11.2 | 22.4 | 36.3 | 38.9 | 42.6 | 43.6 | 47.2 | 55.7 |
| Bard | 7.0 | 7.0 | 10.5 | 13.9 | 24.4 | 31.4 | 34.9 | 41.9 | 41.9 |
| Cleric | 9.8 | 9.8 | 17.4 | 21.2 | 25.3 | 44.4 | 44.4 | 44.4 | 44.4 |
| Druid | 7.0 | 7.0 | 11.7 | 14.8 | 27.9 | 30.4 | 30.4 | 33.5 | 33.5 |
| Fighter | 15.6 | 15.6 | 16.4 | 35.4 | 38.0 | 57.0 | 57.0 | 59.5 | 79.3 |
| Monk | 8.1 | 11.8 | 11.8 | 20.2 | 22.8 | 25.6 | 25.6 | 28.4 | 28.4 |
| Paladin | 7.8 | 14.1 | 14.1 | 35.8 | 37.1 | 49.7 | 52.8 | 56.0 | 56.0 |
| Ranger | 5.8 | 8.7 | 11.5 | 22.4 | 23.9 | 23.9 | 23.9 | 23.9 | 23.9 |
| Rogue | 11.0 | 11.0 | 14.4 | 18.4 | 22.5 | 29.3 | 32.7 | 39.6 | 43.0 |
| Sorcerer | 10.5 | 10.5 | 18.6 | 29.4 | 38.9 | 56.0 | 62.5 | 66.3 | 66.3 |
| Warlock | 10.5 | 10.5 | 14.7 | 21.7 | 27.9 | 31.4 | 31.4 | 31.4 | 31.4 |
| Wizard | 10.5 | 10.5 | 14.7 | 21.7 | 27.9 | 41.2 | 47.7 | 47.7 | 47.7 |
| **Average** | 9.3 | 10.6 | 14.8 | 24.3 | 29.6 | 38.6 | 40.6 | 43.3 | 46.0 |
| **Martial average** | 9.4 | 12.0 | 15.1 | 28.1 | 30.5 | 38.0 | 39.3 | 42.4 | 47.7 |
| *Mutant (core)* | 11.8 | 11.8 | 14.2 | 28.6 | 30.0 | 36.8 | 36.8 | 40.2 | 53.2 |
| *Mutant (juggernaut)* | 10.8 | 10.8 | 13.3 | 26.9 | 28.7 | 35.5 | 35.5 | 39.0 | 52.0 |
| *Mutant (skitter)* | 11.3 | 11.3 | 13.8 | 27.6 | 29.0 | 36.3 | 36.6 | 40.5 | 53.5 |
| *Mutant (oracle)* | 12.4 | 12.4 | 14.9 | 28.6 | 29.9 | 37.5 | 37.5 | 40.9 | 53.9 |
| *Mutant step-4 draft (core)* | 19.5 | 19.5 | 19.5 | 36.9 | 38.2 | 47.0 | 47.0 | 51.4 | 67.2 |

The Mutant's best round is **below the Paladin's from 2nd level on** (the Paladin has no smite at 1st, where the Mutant's 11.8 is below the Fighter's 15.6 Action Surge). The Mutant's nova is shallow by design: its strength is a Surge almost every turn, not a big spike, which also keeps it below the Fighter and Sorcerer nova at every level.

### 5.4 At-will (no resources)

| Class | L1 | L2 | L3 | L5 | L8 | L11 | L14 | L17 | L20 |
|---|---|---|---|---|---|---|---|---|---|
| Barbarian | 6.8 | 9.5 | 9.5 | 20.7 | 22.4 | 23.1 | 23.8 | 24.5 | 29.7 |
| Bard | 1.4 | 1.4 | 1.4 | 2.8 | 2.8 | 4.1 | 4.1 | 5.5 | 5.5 |
| Cleric | 2.5 | 2.5 | 2.5 | 5.0 | 5.0 | 7.4 | 7.4 | 9.9 | 9.9 |
| Druid | 3.2 | 3.2 | 3.2 | 6.3 | 6.3 | 9.5 | 9.5 | 12.6 | 12.6 |
| Fighter | 7.8 | 7.8 | 8.2 | 17.7 | 19.0 | 28.5 | 28.5 | 29.8 | 39.7 |
| Monk | 8.1 | 8.1 | 8.1 | 15.1 | 17.1 | 19.2 | 19.2 | 21.3 | 21.3 |
| Paladin | 7.8 | 7.8 | 7.8 | 16.9 | 18.2 | 24.5 | 24.5 | 24.5 | 24.5 |
| Ranger | 5.8 | 5.8 | 8.7 | 16.8 | 18.3 | 18.3 | 18.3 | 18.3 | 18.3 |
| Rogue | 11.0 | 11.0 | 14.4 | 18.4 | 22.5 | 29.3 | 32.7 | 39.6 | 43.0 |
| Sorcerer | 3.9 | 3.9 | 3.9 | 7.7 | 11.0 | 14.8 | 14.8 | 18.7 | 18.7 |
| Warlock | 3.9 | 5.8 | 5.8 | 12.9 | 14.2 | 21.3 | 21.3 | 28.4 | 28.4 |
| Wizard | 3.9 | 3.9 | 3.9 | 7.7 | 7.7 | 14.8 | 14.8 | 18.7 | 18.7 |
| **Average** | 5.5 | 5.9 | 6.4 | 12.3 | 13.7 | 17.9 | 18.2 | 21.0 | 22.5 |
| **Martial average** | 7.9 | 8.3 | 9.4 | 17.6 | 19.6 | 23.8 | 24.5 | 26.3 | 29.4 |
| *Mutant (core)* | 6.8 | 6.8 | 6.8 | 15.0 | 16.3 | 19.7 | 19.7 | 19.7 | 19.7 |
| *Mutant (juggernaut)* | 5.9 | 5.9 | 5.9 | 13.2 | 15.1 | 18.5 | 18.5 | 18.5 | 18.5 |
| *Mutant (skitter)* | 6.4 | 6.4 | 6.4 | 14.0 | 15.4 | 19.2 | 19.6 | 20.0 | 20.0 |
| *Mutant (oracle)* | 7.5 | 7.5 | 7.5 | 14.9 | 16.2 | 20.4 | 20.4 | 20.4 | 20.4 |
| *Mutant step-4 draft (core)* | 6.8 | 6.8 | 6.8 | 15.0 | 16.3 | 20.7 | 20.7 | 20.7 | 20.7 |

Without Flux the Mutant is a plain martial with no fighting style, about 0.75–0.85× the martial at-will line, like a Paladin or Ranger out of slots.

### 5.5 Healing per long rest

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
| *Mutant, Regeneration* | 15 | 30 | 65 | 130 | 248 | 248 |
| *Mutant (Bio), Regeneration* | 19 | 38 | 80 | 158 | 302 | 302 |
| *Alembic, Regeneration + Panacea* | 17 | 46 | 95 | 186 | 448 | 448 |
| *Alembic (Bio), Regeneration + Panacea* | 21 | 54 | 110 | 214 | 502 | 502 |
| *Step-4 draft: Alembic (Bio)* | 48 | 62 | 140 | 346 | 706 | 706 |
| *Step-4 draft: all Flux into Mend* | 135 | 158 | 351 | 832 | 1380 | 1518 |

- **Per use** Regeneration is exactly *Cure Wounds* (1d8 + modifier at 1st, +1d8 per tier, up to 5d8 at 17th like a 5th-level *Cure Wounds*) at *Healing Word*'s bonus-action cost, but touch range until 9th: the owner's requirement.
- **Per day** the base Mutant sits between *Lay on Hands* and a Bard's *Healing Word*s at every level (it ties a Druid at 1st: 15). Bio adds ~20%.
- The **Alembic** tracks a Druid (17/46/95/186/448 vs 15/62/116/310/438) and stays below a Life Cleric at every level, Bio included (21/54/110/214/502 vs 21/74/142/370/524).
- **Mend** no longer creates hit points; it spends the target's Hit Dice in combat (net gain: the Surge modifier). The step-4 version could pour out 135–1,518 HP a day (table row "all Flux into Mend").

## 6. Other axes

| Axis | Mutant | Comparison | Verdict |
|---|---|---|---|
| Hit points (Con +3 at 1st, +4 from 4th) | 13 at 1st, 49 at 5th, 103 at 11th | Paladin (Con +2) 12 / 44 / 92; Barbarian (Con +3) 15 / 55 / 115 | Barbarian-like, fair for a d10 class whose second stat is Con |
| AC at 1st | scale mail + shield 18; Juggernaut 19 (Plating); Skitter unarmoured 10 + Dex + Con ≈ 16 | Fighter (Defense) 19, Paladin 18, Monk 16, Barbarian 15 | in band; no heavy armour |
| Saves | Con (strong) + Str (weak); Adaptive Biology, Perfect Organism, Iron Will (Mutation) | the SRD's one-strong-one-weak pattern | OK; Wis/Dex saves are a weakness to cover with Mutations |
| Resources | Flux (short rest), Regeneration (long rest, +1 per short rest from 3rd), Emergence/Last Gasp/Final Form (long rest) | Fighter, Monk, Warlock short-rest classes | Flux never runs dry at 1st–4th: Primes are free and Overload lets you continue at a hit-point cost |
| Action economy | the bonus action is shared by Regeneration, Infuse, Churn, Target Lock, Challenge, Voice die | a known 5e complaint | **flagged for step 6** |
| Control | riders: restrained, prone, blinded, poisoned, frightened, no reactions, all lasting until the start of your next turn; Siren gets charm/dominate once per long rest | Battle Master manoeuvres, Paladin smite spells, Druid control spells | below full casters, above other martials: the Mutant's niche |
| Multiclass dip | 1 level: d10, Regeneration ×2, natural weapons, a 1d6 Strike, a Form 1st-level feature | Fighter or Cleric 1 dips | Con save proficiency only comes with Mutant as the first class (standard rule); Skitter's AC doesn't stack with Unarmored Defense (5e rule: one AC formula). Acceptable |
| Capstone | Final Form: +2/+2 (max 22), 1 minute of free Twists, two Surges a turn, resistance, Form finale | Barbarian Primal Champion, Paladin's Holy Nimbus-style capstones | strong but once per long rest; nova 53 vs Paladin 56 |

## 7. Not modelled (and why it's acceptable)

- **Area Surges.** Wave/Burst/Pulse deal Surge dice + 1 die in an area (2d6 at 1st, 5d6 at 17th) for 1 Flux: compare *burning hands* (3d6) and *fireball* (8d6). They're weaker per target than spells and trade against Strike, so single-target Day DPR is the binding number.
- **Riders.** Prone and Corrode give allies advantage; Snare restrains. Each is about a +10–20% party DPR bump on the round it lands, the same order as a Battle Master's Trip Attack.
- **Overload.** A player who Overloads every short-rest window gains about one extra Surge window (~+1.5 DPR at 5th, +3 at 11th) for 2d6–6d6 self-damage and a random table. It's the push-your-luck valve the original game was built around; it stays inside the +15% band.
