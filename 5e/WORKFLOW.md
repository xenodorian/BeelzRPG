# Mutagen 5e: Project Workflow and Design Plan

**Goal (owner request, 2026-10-30):** a version of *Mutagen* that runs on the 5e ruleset. The old Base Forms become **subclasses** of one new class, the skill trees and nodes are rebuilt for a 1–20 progression with ASIs and the other level features 5e expects, the class gets a **low-level regeneration ability equal in power to the support classes' healing spells**, and the result is checked against the SRD classes (especially Druid and Paladin) and against the community's common complaints about 5e classes. The full SRD 5.1 ships alongside it.

**Rule of separation.** Everything lives in `5e/`. The original *Mutagen* (chapters, rulebook, builder, arcade, tests) is untouched and keeps working.

---

## 1. Steps, artifacts and exit checks

| # | Step | Artifact | Exit check |
|---|---|---|---|
| 1 | Research the SRD classes | `5e/srd/` (full SRD 5.1, CC-BY-4.0, with attribution) · `research/01_SRD_class_analysis.md` · `tools/bench.py` | Benchmarks for DPR, healing, resources, subclass levels, dead levels |
| 2 | Research homebrew conventions | `research/02_homebrew_format.md` | Layout, wording and balance checklists with sources |
| 3 | Plan | this file | Every Mutagen system mapped to a 5e mechanic; open questions listed |
| 4 | Build | `Mutagen_5e_Class.md` (class, Forms, Surges, Mutations, tables), `Mutagen_5e_Bestiary.md`, `Mutagen_5e_Options.md` (background, feats, gear), compiled `Mutagen_5e.md` + `Mutagen_5e.pdf` (headless Chrome, Homebrewery-like) | Links resolve, PDF images load, every level 1–20 has something |
| 5 | Balance check | `research/05_balance_check.md`, the Mutant added to `tools/bench.py` | Day DPR within ±15% of the martial average at L1/3/5/11/17/20; nova ≤ Paladin; healing per day between Lay on Hands and a Bard's *Healing Word*s (Alembic up to a Druid's); before/after log for every change |
| 6 | Community gaps | `research/06_community_gaps.md`, changes applied to the class | Each gap: sources, our fix, its balance cost; bench re-run |

Each step is committed and pushed separately. The compiled document is rebuilt after steps 5 and 6.

## 2. Core design decisions

### 2.1 One class, five Forms
- **Class name:** the **Mutant** (in setting: a GRAFT freelancer whose body took the Mutagen). The five Base Forms become its subclass, chosen at **1st level** ("Base Form"), as the body is the character from day one (and late subclasses are a known complaint, see Research 6).
- **Forms kept:** Juggernaut, Skitter, Oracle, Alembic, Siren. **No Form is dropped.** The owner allowed cutting one or two to fund class features; we don't need to, because the original had a tree that was nobody's primary tree: **Limbs**, "the shared body tree". **Limbs is cannibalised** into the class chassis (natural weapons, Extra Attack, grappling and movement) and an open **Body Mutation** list, which is exactly the role the owner described.
- **Form feature levels:** 1, 3, 6 (**Evolution I**), 10, 14 (**Evolution II**). The capstone **Final Form** (20th) is a class feature with a Form-specific look and finale. Five features at the levels the SRD uses for casters' and Barbarians' subclass gaps.

### 2.2 Stats → abilities
| Mutagen | 5e | Used for |
|---|---|---|
| Grit | Strength / Constitution | Heavy weapons, HP, Juggernaut and Skitter Surges |
| Moxie | Dexterity | Finesse/ranged weapons, AC |
| Nerve | Wisdom | Oracle Surges, perception, will |
| Gumption | Intelligence | Alembic Surges, medicine and craft |
| Chutzpah | Charisma | Siren Surges, social |

- **Surge ability:** Constitution, except Oracle (Wisdom), Alembic (Intelligence) and Siren (Charisma), mirroring each Form's original primary stat. Surge save DC = 8 + proficiency bonus + Surge ability modifier; Surge attack modifier = proficiency bonus + Surge ability modifier.
- **Saving throws:** Constitution (strong) and Strength (weak), as the SRD pattern requires.
- **Hit Die:** d10 (armoured front-liner and hybrid, like Paladin, Ranger, Fighter).
- **Armor:** light, medium, shields. No heavy armour: bodies are the armour (Juggernaut's Plating), and it keeps a 1-level dip from being an armour grab.

### 2.3 Surges, the Sequence and Flux → a short-rest push-your-luck pool
| Mutagen | 5e Mutant |
|---|---|
| Surge = Shape + Effect (+ Twist) | Same. You **know** a number of built Surges (table column) and write each in a numbered slot of your Sequence |
| Rank-scaled damage dice | **Surge dice** column: 1d8 → 2d8 (5) → 3d8 (11) → 4d8 (17), the tier-jump rhythm |
| Prime and Sequence die (random draw each fight) | When you roll initiative, roll your Sequence die **Prime** times; those Surges are **Primed** (cost 1 less Flux, once). Doubles = **Amped** (0 Flux, +1 Surge die). A Primed empty slot is a **Wild Surge** (d12 table). Unprimed Surges can still be used at full cost, so the dice give a bonus, never a lock-out (randomness complaints, Research 6) |
| Unleash costs 1 Flux + 1 per Twist | Same; one Surge per turn |
| Flux Limit (4 + Rank + Nerve) | **Flux Limit** column (2 at 1st, rising to 16 at 20th); Flux resets on a short or long rest |
| Overload (Rank d6, Bloom/Glitch d12, Flux → 0) | Same idea: going over your Limit is allowed; take *proficiency bonus* d6 necrotic damage (can't drop you below 1), roll Bloom or Glitch, Flux → 0 |
| Churn | Bonus action: gain 1 Flux, roll the Sequence die once to Prime another Surge |
| Signature Surges (Evolutions) | One per Evolution: it carries one Twist for free and is never used up as a Primed Surge is |
| Wild Surge table, Bloom, Glitch, Scars, Faults | Converted line by line to 5e conditions and numbers |

Shapes become **Strike** (rider on a weapon hit), **Bolt** (replaces one attack: a ranged Surge attack), **Wave** (cone), **Burst** (sphere at range), **Pulse** (around you), **Infuse** (bonus action on you or an ally). Effects keep their names; damage types and conditions map to SRD ones (Kinetic → force, Shock → lightning, Blaze → fire, Toxin → poison, Corrode → acid, Glare → radiant, Dread → psychic; Held → restrained, Shaken → frightened, Dazed → no reactions, Exposed → next attack has advantage, Veiled → invisible).

### 2.4 Trees and nodes → Mutations (invocation-style menu)
- Six trees → **five Mutation trees** (Hide, Senses, Glands, Wiring, Mind) plus an open **Body** list (the old Limbs). Each tree: a **Root** (free for your Form's primary tree; otherwise it costs one Mutation and unlocks that tree's Surge parts), **Tier I** Mutations (Root), **Tier II** (6th level, Root and two others from the tree), **Apex** (15th level, your Form's primary tree, Root and four others).
- **Mutations Known** column: 1 at 1st rising to 9 at 19th. Swap one when you gain a level (as invocations).
- **Push** (spend 1 Flux for a node's extra effect) is kept on the nodes that had it.
- Evolution nodes become the Forms' 6th and 14th level features.

### 2.5 Regeneration (the owner's requirement)
- **1st-level class feature.** Bonus action, touch (you or a willing creature): regain **1d8 + Surge ability modifier** HP, or end the poisoned condition or one disease instead. **Uses = proficiency bonus per long rest.** Dice grow to 2d8 (5th), 3d8 (9th), 4d8 (13th), 5d8 (17th): the same +1d8 steps as upcasting *Cure Wounds* in the slots a half-caster would have.
- **Benchmark:** *Cure Wounds* is 1d8 + mod as an action at touch; *Healing Word* is 1d4 + mod as a bonus action at 60 ft. Regeneration takes Cure Wounds' amount with Healing Word's action cost but touch range, and its uses match a 1st-level cleric/druid/bard's two slots. Per day it lands between a Paladin's Lay on Hands and a Bard's Healing Words (Research 1 §4); the Alembic pushes it to druid levels. Verified in Research 5.

### 2.6 Evolutions and Final Form
- **Evolution I (6th)** and **Evolution II (14th)**: Prime +1, Sequence die up (d6 → d8 → d12), a Signature Surge, the Form's Evolution feature and new look, and **Emergence** (the on-screen metamorphosis: temporary HP, nearby enemies frightened, the first Signature Surge Amped).
- **Final Form (20th):** permanent +2 Constitution and +2 to Strength or Dexterity (max 22, cf. Barbarian's Primal Champion), and once per long rest a 1-minute transformation: every Surge costs 0 Flux, +10 ft speed, resistance to bludgeoning, piercing and slashing, plus the Form's finale.

### 2.7 Level map (target; Research 5 and 6 may move things)

| Lvl | Class | Form |
|---|---|---|
| 1 | Mutant Body, Surges, Regeneration, Material (Bio/Chrome/Splice), Base Form | Form feature, primary tree Root |
| 2 | Mutations, Churn | |
| 3 | Sequence d6 | Form feature |
| 4 | ASI | |
| 5 | Extra Attack, Surge dice 2d8, Regeneration 2d8 | |
| 6 | Evolution I | Evolution node |
| 7 | Last Gasp | |
| 8 | ASI | |
| 9 | Regeneration 3d8, improved | |
| 10 | | Form feature |
| 11 | Surge dice 3d8, tier-3 spike | |
| 12 | ASI | |
| 13 | core feature, Regeneration 4d8 | |
| 14 | Evolution II | Evolution node |
| 15 | core feature (Apex Mutations open) | |
| 16 | ASI | |
| 17 | Surge dice 4d8, Regeneration 5d8 | |
| 18 | core feature | |
| 19 | ASI | |
| 20 | Final Form | Form finale |

### 2.8 Everything else
- **Multiclassing:** Constitution 13; gain light armour, simple weapons, and no Surges unless Mutant level ≥ 1 (Surges, Regeneration and Mutant Body come with the first level as normal).
- **Background:** *GRAFT Freelancer* (SRD background format). **Feats:** a few Mutagen feats for any class. **Gear:** chrome kit and Mutagen stims priced in gp.
- **Bestiary:** a selection of the Mutagen threat roster as 5e stat blocks with CRs computed by the standard defensive/offensive CR method (HP and AC vs damage per round and attack/DC), including the three Bosses with legendary actions.
- **Output:** `Mutagen_5e.md` (one compiled document) and `Mutagen_5e.pdf` printed by headless Chrome with the repo's art in a two-column Homebrewery-like style; both copied to `/workspace/`.

## 3. Risks and how we'll check them

| Risk | Check |
|---|---|
| Surge every turn + Extra Attack outdamages a Paladin | bench.py: Day DPR vs martial average; tune Flux Limit and Surge dice |
| Regeneration + Alembic out-heals a Life Cleric | healing per day table; Alembic ≤ Druid |
| Bonus action crowding (Regeneration, Infuse, Churn, Dash) | Research 6; make Churn part of initiative where possible |
| 1-level dip abuse (Regeneration, natural weapons) | Uses scale with proficiency bonus; dice with Mutant level; no heavy armour |
| Randomness frustration | Primed = discount, never a gate |
| Dead levels | Level map has something at every level |
| Rules text drifting from SRD wording | Research 2 wording conventions; SRD condition and damage names only |
