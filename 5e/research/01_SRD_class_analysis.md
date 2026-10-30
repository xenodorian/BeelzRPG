# Research 1: The SRD 5.1 Classes, Scrutinised

**Purpose.** Before converting *Mutagen* into a 5e class we need hard numbers for what a 5e class *is*: its chassis, how its resources recover, when it gets its subclass, how much it heals and how much damage it does at each tier. Every claim here is checked against the SRD 5.1 text in [`../srd/02_Classes/`](../srd/02_Classes/) and [`../srd/07_Spells/`](../srd/07_Spells/). Numbers come from [`../tools/bench.py`](../tools/bench.py), a white-room calculator (assumptions in its header and in §6).

## 1. Chassis at a glance

| Class (SRD subclass) | Hit Die | Saves (strong / weak) | Armor | Skills | Subclass at | Main resource and recovery | Capstone (20th) |
|---|---|---|---|---|---|---|---|
| Barbarian (Berserker) | d12 | Con / Str | Light, medium, shields | 2 | 3 | Rage 2→6/day (long rest), unlimited at 20 | Primal Champion: Str, Con +4 (max 24) |
| Bard (Lore) | d8 | Dex / Cha | Light | any 3 | 3 | Full slots (long); Inspiration Cha/long, short from 5 | Superior Inspiration |
| Cleric (Life) | d8 | Wis / Cha | Light, medium, shields | 2 | **1** | Full slots (long); Channel Divinity 1→3 (short) | Divine Intervention auto |
| Druid (Land) | d8 | Wis / Int | Light, medium, shields (non-metal) | 2 | 2 | Full slots (long); Wild Shape 2 (short); Natural Recovery | Archdruid: unlimited Wild Shape |
| Fighter (Champion) | d10 | Con / Str | All, shields | 2 | 3 | Second Wind, Action Surge (short); Indomitable (long) | Extra Attack (3) |
| Monk (Open Hand) | d8 | Dex / Str | None | 2 | 3 | Ki = level (short) | Perfect Self (4 ki on initiative) |
| Paladin (Devotion) | d10 | Wis / Cha | All, shields | 2 | 3 | Half slots (long); Lay on Hands 5×level (long); CD (short) | Holy Nimbus (oath) |
| Ranger (Hunter) | d10 | Dex / Str | Light, medium, shields | 3 | 3 | Half slots (long) | Foe Slayer (+Wis once per turn) |
| Rogue (Thief) | d8 | Dex / Int | Light | 4 | 3 | None (Sneak Attack is at will) | Stroke of Luck |
| Sorcerer (Draconic) | d6 | Con / Cha | None | 2 | **1** | Full slots + sorcery points = level (long) | Sorcerous Restoration (4 SP on short rest) |
| Warlock (Fiend) | d8 | Wis / Cha | Light | 2 | **1** | Pact slots 1→4, all one level (short); Mystic Arcanum (long) | Eldritch Master |
| Wizard (Evocation) | d6 | Wis / Int | None | 2 | 2 | Full slots (long); Arcane Recovery | Signature Spells |

**Patterns a new class must follow.**
- **Saves:** every class has one "strong" save (Dex, Con or Wis) and one "weak" one (Str, Int or Cha). No class has two strong saves.
- **Hit Die tracks front-line exposure:** d12 Barbarian, d10 for the armoured martials and half-casters (Fighter, Paladin, Ranger), d8 for the skirmishers and full casters who wear armour, d6 for unarmoured full casters.
- **Proficiency bonus** is fixed by character level: +2 (1–4), +3 (5–8), +4 (9–12), +5 (13–16), +6 (17–20).
- **Ability Score Improvements** come at 4, 8, 12, 16 and 19 for every class (Fighter adds 6 and 14; Rogue adds 10).
- **Extra Attack** at 5th level for every weapon class (Barbarian, Fighter, Monk, Paladin, Ranger); casters scale cantrips at 5, 11 and 17 instead. 5th, 11th and 17th are the "tier jumps".
- **Subclass levels:** chosen at 1 (Cleric, Sorcerer, Warlock), 2 (Druid, Wizard) or 3 (everyone else). Subclass features then land at 6/10/14 for casters (or 2/6/8/17 for Cleric) and at 3/7/11/15 (Fighter: 3/7/10/15/18) or 6/10/14 (Barbarian, Monk 6/11/17) for martials. **No class gets a subclass feature later than 18 except as part of a capstone.**
- **Multiclassing** needs 13 in the class's key ability or abilities (e.g. Paladin Str 13 and Cha 13; Ranger Dex 13 and Wis 13) and grants a reduced proficiency list ([Multiclassing](../srd/03_Characterization/Multiclassing.md)).

## 2. Class by class (what matters for the Mutant)

**Barbarian.** The purest "body" class: Rage (bonus action, resistance to bludgeoning/piercing/slashing, +2→+4 damage) from a long-rest pool, Reckless Attack (advantage, but attacks against you too), Unarmored Defense (10 + Dex + Con). High HP, few decisions. Dead levels: 7 (Feral Instinct is small), 13, 17 (only Brutal Critical dice), 18. Its capstone gives +4 Str and Con above the 20 cap, the template for an "Evolved body" capstone.

**Bard.** Full caster with Bardic Inspiration (bonus action, d6→d12 die to an ally, Cha mod uses, short-rest from 5th). Healing comes from *Healing Word* and *Cure Wounds* and from Song of Rest (+1d6→1d12 per creature spending Hit Dice on a short rest). Lowest single-target damage in the SRD; its value is control, skills (Jack of All Trades, Expertise) and Magical Secrets.

**Cleric (Life).** The healing yardstick. *Cure Wounds* (1st, action, touch, 1d8 + mod, +1d8 per slot level), *Healing Word* (1st, bonus action, 60 ft, 1d4 + mod, +1d4 per slot level), and from Life domain: **Disciple of Life** (+2 + spell level to every healing spell), **Preserve Life** (Channel Divinity, action: 5 × level HP split among creatures within 30 ft, each to no more than half its max), **Blessed Healer** at 6, **Supreme Healing** (max dice) at 17. Spiritual Weapon (bonus action) and Spirit Guardians give it real sustained damage from 3rd and 5th level.

**Druid (Land).** Full Wisdom caster with *Cure Wounds*, *Healing Word*, *Goodberry* (10 berries × 1 HP), Wild Shape twice per short rest, and Natural Recovery (regain slots totalling half druid level on a short rest). Land druids lean on spells; Wild Shape is mostly utility in the SRD subclass. Its damage is concentration-based (Moonbeam, Call Lightning).

**Fighter (Champion).** The baseline martial: Second Wind (bonus action, 1d10 + level self-heal per short rest), Action Surge (extra action per short rest), Extra Attack 2/3/4 at 5/11/20, extra ASIs at 6 and 14. Champion adds a wider crit range (19–20 at 3, 18–20 at 15) and passive features. Strong numbers, very few choices: the main community complaint about it.

**Monk (Open Hand).** **The short-rest point pool to copy or avoid**: ki = monk level, back on a short rest, spent 1 at a time on Flurry of Blows, Patient Defense, Step of the Wind and Stunning Strike. Martial Arts lets it make a bonus-action unarmed strike every turn. At low levels 2–4 ki per short rest is too few for everything it wants (the well-known "ki starvation"). Open Hand's *Wholeness of Body* (6th): action, heal yourself 3 × monk level, once per long rest.

**Paladin (Devotion).** **The closest existing analogue to the Mutant**: a d10, armoured, Extra-Attack half-caster that converts a limited pool into burst damage (Divine Smite: 2d8 + 1d8 per slot level above 1st, max 5d8, after it hits) and has a non-spell healing pool, **Lay on Hands** (5 × level HP per long rest, action, touch; 5 HP of it can instead cure a disease or poison). Aura of Protection (+Cha to saves within 10 ft) at 6 makes it the best defensive class in the SRD. Improved Divine Smite (+1d8 on every melee hit) at 11.

**Ranger (Hunter).** Half caster with *Hunter's Mark* (bonus action, +1d6 per hit, concentration) and *Cure Wounds*. Favored Enemy and Natural Explorer are situational ribbons; levels 9, 13 and 17 have no class feature at all. The SRD ranger is the community's most-cited "weak class" (see Research 6).

**Rogue (Thief).** No resources at all: Sneak Attack (+1d6 per two levels, once per turn), Cunning Action (Dash/Disengage/Hide as a bonus action), Uncanny Dodge, Evasion, Reliable Talent. Proof that an at-will, once-per-turn damage rider is fine when it's the class's main damage.

**Sorcerer (Draconic).** Full caster plus sorcery points (= level, long rest) that fuel Metamagic or convert to slots. Draconic gets +1 HP per level and 13 + Dex unarmored AC at 1st level, Elemental Affinity at 6. Shows how a **subclass chosen at 1st level** can rewrite a fragile chassis.

**Warlock (Fiend).** **The short-rest spell model**: 1–4 slots, all at the highest level you can cast (max 5th), back on a short rest; Mystic Arcanum for 6th–9th once per long rest; Eldritch Invocations (a menu of always-on options with level and pact prerequisites). *Agonizing Blast* is an SRD invocation; **Hex is not in the SRD**, so an SRD warlock's damage is lower than most online guides assume. Invocations are the model for a **Mutation** menu.

**Wizard (Evocation).** Full caster, biggest spell list, Arcane Recovery (half wizard level in slots on one short rest per day). Sculpt Spells and Empowered Evocation (+Int to evocation damage at 10).

## 3. Resource models

| Model | SRD examples | Per day at L5 (2 short rests) | Behaviour |
|---|---|---|---|
| Long-rest slots | Bard, Cleric, Druid, Sorcerer, Wizard; half: Paladin, Ranger | Full caster 4/3/2 (9 slots); half caster 4/2 (6 slots) | Big daily budget, pace yourself, strongest in short adventuring days |
| Short-rest slots | Warlock | 2 slots × 3 = 6 (all 3rd level) | Fewer, stronger; rewards short rests |
| Short-rest points | Monk (ki), Fighter (Action Surge, Second Wind), Channel Divinity, Wild Shape | Monk: 5 × 3 = 15 ki | Many small spends; starved at low level |
| Long-rest pool | Paladin Lay on Hands, Barbarian Rage, Sorcery points | Lay on Hands 25 HP; 3 rages | Flexible, no short-rest dependency |
| At will | Rogue Sneak Attack, cantrips, Eldritch Blast | Unlimited | Reliable baseline, no decisions to ration |

**Lesson for the Mutant.** Mutagen's Flux is a *build-up* resource (you gain Flux when you Surge and Overload above your Limit), which plays like ki but with a push-your-luck overflow. The 5e analogue is a **short-rest pool**. Its size must sit between ki (lots of small spends) and pact slots (few big ones), and low levels must not be starved (the monk lesson).

## 4. Healing benchmarks (the yardstick for the Mutant's regeneration)

| Healing option (SRD) | Level available | Action | Range | Amount | Per day at L1 / L3 / L5 |
|---|---|---|---|---|---|
| *Cure Wounds* (1st-level slot) | Bard, Cleric, Druid 1; Paladin, Ranger 2 | Action | Touch | 1d8 + mod (avg 7.5 at +3) | Uses slots: 2 / 4+2 / 4+3+2 |
| *Healing Word* (1st-level slot) | Bard, Cleric, Druid 1 | **Bonus action** | 60 ft | 1d4 + mod (avg 5.5 at +3) | same slots |
| Life Domain: Disciple of Life | Cleric (Life) 1 | — | — | +2 + spell level per healing spell | — |
| Lay on Hands | Paladin 1 | Action | Touch | Pool of 5 × level | 5 / 15 / 25 HP |
| Second Wind | Fighter 1 | Bonus action | Self | 1d10 + level, per short rest | 7 / 9 / 11 each |
| *Goodberry* (1st) | Druid, Ranger | Action (cast) | — | 10 berries × 1 HP | 10 per slot |
| Song of Rest | Bard 2 | Short rest | — | +1d6 per creature spending Hit Dice | ~3.5 per ally per short rest |
| *Prayer of Healing* (2nd) | Cleric | 10 minutes | 30 ft, 6 creatures | 2d8 + mod each | — |
| Preserve Life | Cleric (Life) 2 | Action | 30 ft | 5 × level split, to half max HP | 10 / 15 / 25 per use |
| Wholeness of Body | Monk (Open Hand) 6 | Action | Self | 3 × level, 1/long rest | — / — / 18 at L6 |

**The "equal power" target for a low-level regeneration feature.** At 1st level, a cleric, druid or bard has 2 slots: about **15 HP** of *Cure Wounds* (action, touch) or **11 HP** of *Healing Word* (bonus action, 60 ft) per long rest, and the slots compete with *Bless*, *Shield of Faith*, *Faerie Fire* and the rest. A Life cleric reaches 21. A paladin's Lay on Hands gives 5. So a regeneration feature that is "as good as their healing spells" should restore **about 7–8 HP per use (action) or 5–6 HP per use (bonus action at range), two uses at 1st level, scaling with level** (both spells add a die per slot level: ~+4.5 HP per step), and it should be a choice that competes with other uses of the resource, as slots do.

## 5. Features per level and "dead levels"

A level is "dead" when it brings nothing but hit points (and, for casters, a new slot). From the SRD class tables:

| Class | Levels with no class or subclass feature |
|---|---|
| Ranger | 9, 13, 17 (only slots) and 19's ASI |
| Fighter | none (but 6, 12, 14, 16 are only ASIs, and Champion 7/10/15/18 are passive) |
| Wizard | 3, 5, 7, 9, 11, 13, 15, 17 (spells only) |
| Sorcerer | 7, 9, 11, 13, 15 (spells only) |
| Warlock | 7, 9, 18 except invocation picks |
| Bard | 7, 11 |
| Barbarian | 13, 17 (Brutal Critical die only) |
| Monk | 9 (speed only), 13 (Tongue of the Sun and Moon is a ribbon) |
| Cleric | 13, 15 (spells only) |
| Druid | 3, 5, 7, 9, 11, 13, 15, 17 (spells only) |
| Paladin | 9, 13, 17 (spells only) |
| Rogue | none (the ASI at 10 is extra) |

Casters fill "empty" levels with new spell levels and spells known. **A non-casting class needs a menu (invocations, maneuvers, Mutations) or a scaling number at those levels**, or it feels flat.

## 6. Damage benchmarks

**Method** (full detail in `bench.py`): single target; AC 13 at levels 1–3 rising to 19 at 17+; main ability +3/+4/+5 (ASIs at 4 and 8, no feats: the SRD has none besides Grappler); 6 encounters × 3 rounds and 2 short rests per day. *At-will* uses no limited resources. *Day* spends every damage resource in the day across 18 rounds (a spell that needs your action replaces a cantrip round). *Nova* is the best single round. Builds: Champion and Paladin with greatsword + Great Weapon Fighting; Berserker greatsword, raging in as many fights as it has rages, Reckless from 2nd level, one Frenzy fight per day; Hunter with longbow + Archery + Hunter's Mark + Colossus Slayer; Thief with rapier + off-hand (two Sneak Attack chances); Open Hand flurrying as ki allows; Fiend warlock with Eldritch Blast + Agonizing (no Hex in the SRD); Cleric with Sacred Flame, Spiritual Weapon each fight while 2nd-level slots last, and its slots on Guiding Bolt / Spirit Guardians / Harm; Druid with Produce Flame and Moonbeam / Call Lightning / Blight / Sunbeam; Draconic sorcerer with Fire Bolt + Quickened Fire Bolt + damage slots; Evocation wizard with Fire Bolt + damage slots.

*Single-target DPR undervalues casters.* Fireball, Spirit Guardians and Moonbeam hit groups, and control spells (*Hold Person*, *Hypnotic Pattern*, *Banishment*) end fights without damage. The table is the yardstick for **damage**, not for overall power.

### At-will DPR

| Class | L1 | L3 | L5 | L8 | L11 | L14 | L17 | L20 |
|---|---|---|---|---|---|---|---|---|
| Barbarian | 6.8 | 9.5 | 20.7 | 22.4 | 23.1 | 23.8 | 24.5 | 29.7 |
| Bard | 1.4 | 1.4 | 2.8 | 2.8 | 4.1 | 4.1 | 5.5 | 5.5 |
| Cleric | 2.5 | 2.5 | 5.0 | 5.0 | 7.4 | 7.4 | 9.9 | 9.9 |
| Druid | 3.2 | 3.2 | 6.3 | 6.3 | 9.5 | 9.5 | 12.6 | 12.6 |
| Fighter | 7.8 | 8.2 | 17.7 | 19.0 | 28.5 | 28.5 | 29.8 | 39.7 |
| Monk | 8.1 | 8.1 | 15.1 | 17.1 | 19.2 | 19.2 | 21.3 | 21.3 |
| Paladin | 7.8 | 7.8 | 16.9 | 18.2 | 24.5 | 24.5 | 24.5 | 24.5 |
| Ranger | 5.8 | 8.7 | 16.8 | 18.3 | 18.3 | 18.3 | 18.3 | 18.3 |
| Rogue | 11.0 | 14.4 | 18.4 | 22.5 | 29.3 | 32.7 | 39.6 | 43.0 |
| Sorcerer | 3.9 | 3.9 | 7.7 | 11.0 | 14.8 | 14.8 | 18.7 | 18.7 |
| Warlock | 3.9 | 5.8 | 12.9 | 14.2 | 21.3 | 21.3 | 28.4 | 28.4 |
| Wizard | 3.9 | 3.9 | 7.7 | 7.7 | 14.8 | 14.8 | 18.7 | 18.7 |
| **Average** | 5.5 | 6.4 | 12.3 | 13.7 | 17.9 | 18.2 | 21.0 | 22.5 |

### Day DPR (resources spread over 18 rounds)

| Class | L1 | L3 | L5 | L8 | L11 | L14 | L17 | L20 |
|---|---|---|---|---|---|---|---|---|
| Barbarian | 7.3 | 12.2 | 24.4 | 26.9 | 29.0 | 30.6 | 34.1 | 40.3 |
| Bard | 2.0 | 3.6 | 6.2 | 9.2 | 15.0 | 16.7 | 20.5 | 24.6 |
| Cleric | 3.3 | 6.9 | 13.1 | 19.0 | 28.4 | 29.6 | 32.0 | 37.0 |
| Druid | 3.6 | 6.7 | 11.9 | 16.3 | 18.0 | 19.8 | 24.0 | 25.3 |
| Fighter | 7.8 | 9.6 | 20.7 | 22.2 | 33.3 | 33.3 | 39.7 | 52.9 |
| Monk | 8.1 | 10.0 | 19.4 | 22.8 | 25.6 | 25.6 | 28.4 | 28.4 |
| Paladin | 7.8 | 10.2 | 23.1 | 26.1 | 36.7 | 38.1 | 42.1 | 43.5 |
| Ranger | 5.8 | 11.5 | 22.4 | 23.9 | 23.9 | 23.9 | 23.9 | 23.9 |
| Rogue | 11.0 | 14.4 | 18.4 | 22.5 | 29.3 | 32.7 | 39.6 | 43.0 |
| Sorcerer | 4.6 | 6.7 | 11.9 | 17.7 | 25.6 | 29.0 | 36.5 | 42.1 |
| Warlock | 5.0 | 8.8 | 15.8 | 18.8 | 26.3 | 26.3 | 30.4 | 30.4 |
| Wizard | 4.6 | 7.1 | 11.8 | 15.2 | 22.4 | 24.2 | 28.9 | 32.5 |
| **Average** | 5.9 | 9.0 | 16.6 | 20.0 | 26.1 | 27.5 | 31.7 | 35.3 |

### Nova DPR (best round)

| Class | L1 | L3 | L5 | L8 | L11 | L14 | L17 | L20 |
|---|---|---|---|---|---|---|---|---|
| Barbarian | 8.2 | 22.4 | 36.3 | 38.9 | 42.6 | 43.6 | 47.2 | 55.7 |
| Bard | 7.0 | 10.5 | 13.9 | 24.4 | 31.4 | 34.9 | 41.9 | 41.9 |
| Cleric | 9.8 | 17.4 | 21.2 | 25.3 | 44.4 | 44.4 | 44.4 | 44.4 |
| Druid | 7.0 | 11.7 | 14.8 | 27.9 | 30.4 | 30.4 | 33.5 | 33.5 |
| Fighter | 15.6 | 16.4 | 35.4 | 38.0 | 57.0 | 57.0 | 59.5 | 79.3 |
| Monk | 8.1 | 11.8 | 20.2 | 22.8 | 25.6 | 25.6 | 28.4 | 28.4 |
| Paladin | 7.8 | 14.1 | 35.8 | 37.1 | 49.7 | 52.8 | 56.0 | 56.0 |
| Ranger | 5.8 | 11.5 | 22.4 | 23.9 | 23.9 | 23.9 | 23.9 | 23.9 |
| Rogue | 11.0 | 14.4 | 18.4 | 22.5 | 29.3 | 32.7 | 39.6 | 43.0 |
| Sorcerer | 10.5 | 18.6 | 29.4 | 38.9 | 56.0 | 62.5 | 66.3 | 66.3 |
| Warlock | 10.5 | 14.7 | 21.7 | 27.9 | 31.4 | 31.4 | 31.4 | 31.4 |
| Wizard | 10.5 | 14.7 | 21.7 | 27.9 | 41.2 | 47.7 | 47.7 | 47.7 |
| **Average** | 9.3 | 14.8 | 24.3 | 29.6 | 38.6 | 40.6 | 43.3 | 46.0 |

### Healing per long rest (all healing resources spent on healing)

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

### Reading the numbers
- **Martial band (sustained "Day" DPR):** Paladin, Fighter and Barbarian lead (L5 ≈ 21–24, L11 ≈ 29–37, L20 ≈ 40–53). Rogue's damage is all at-will and catches up late. Ranger stalls after 5th (no damage scaling after Extra Attack in the SRD). Monk falls behind from 11th.
- **Caster band:** Cleric and Sorcerer are surprisingly competitive in single-target "Day" DPR from 5th (Spirit Guardians, Quickened Fire Bolt); Bard and Druid are lowest. Casters make up for it with area damage, control and utility.
- **Nova:** Paladin (smite stacking), Fighter (Action Surge) and Sorcerer lead; nova matters because many fights end in 3 rounds.
- **Healing per day:** a Life cleric heals 3–4× what a paladin can (Lay on Hands only); a druid or bard 2–3×. A non-caster class with its own healing should land between **Lay on Hands** and a **Bard's Healing Words**: about 10–15 HP per day at 1st level and 60–80 at 5th, unless healing is the subclass's whole job.

## 7. Targets for the Mutant (carried into the Workflow)

| Measure | Target band | Why |
|---|---|---|
| Hit Die | d10 | Armoured, front-line hybrid like Paladin/Ranger/Fighter |
| Saves | one strong + one weak | Every SRD class does this |
| "Day" DPR | within ±15% of the martial average (Paladin/Fighter/Barbarian/Ranger/Monk/Rogue) at L1, 3, 5, 11, 17, 20 | It's a weapon-and-mutation fighter, not a caster |
| Nova DPR | ≤ Paladin's | Paladin nova is already the high end |
| Healing per day | between Lay on Hands and Bard *Healing Word* (L1 ≈ 10–15, L5 ≈ 40–75) for the class; Alembic up to a Druid's | "Equal power to support classes' healing spells" per use; cleric-level totals only for the healing subclass |
| Resource | short-rest pool, never starved at L1–4 | Avoid ki starvation |
| Subclass | at 1st level, features at least every 3–4 levels | Avoid late subclass identity |
| Dead levels | none | Mutations or scaling at every level |
| Capstone | strong, flavourful, comparable to Barbarian/Archdruid | Final Form |
