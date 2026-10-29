# 10. Threats

![Drain Beast](../art/threat_drainbeast.jpg)

Every enemy is built from three parts: **Threat level (T)**, **Role** and **Traits**. Every enemy also carries two ratings that tell you how to use it: a **Boss Rating** and a **Minion Rating**. You can build a new enemy in a few minutes, or read one off the roster below.

## 1. Ratings: BR and MR
- **Boss Rating (BR N):** **one** of this creature, alone, is a fair fight for **4 fully rested level-N freelancers**.
- **Minion Rating (MR N):** **four** of this creature are a fair fight for **4 fully rested level-N freelancers**.

**A fair fight** means, for a fully rested party (full HP, Flux 0, kit full):

| Measure | Fair band | Typical at the rating |
|---|---|---|
| Party wins | **90%+** | 93–99% |
| At least one freelancer goes Down | **40–60%** (50% target) | 40–55% (Bosses 25–35%: their fights are long, so death risk sets the rating) |
| Anyone dies | **5% or less** | 0–5% |
| Rounds | **3–7** | 2–6 |
| Party HP lost | 25–50% | 30–45% |

A creature's rating is the lowest party level at which its fight stays inside *all* of the first three limits. Ratings come from simulated fights with real builder characters of every Form (`tools/encounter_sim.py`, 1,000 fights per level; see `Current_Work.md`, *Enemy Calibration*). **<1** means it is never a fair fight in that use even at level 1 (one Spill Rat). **10+** means no level-10 party can take it in that use (four Feral Evolved).

**Read the gap.** MR − BR says how a creature wants to be used:
- **About 3** (Generalists): fine alone at its BR or in a group at its MR.
- **2 or less: Heavies.** Big Area attacks make them deadly alone, and especially against big or bunched-up parties; in a crowd they get in each other's way (Bulky, Friendly fire, Interference, Territorial). Use one as a centrepiece.
- **4 or more: Packs.** Pack, Flanker, Overwhelm, Crowd, Linked and Frenzy only work with friends. One is a speed bump; four are a fight.

## 2. Threat Level
T runs 1–10. It sets the numbers; the ratings tell you who it's for.

| T | Guard | TN | HP | Damage | Bonus |
|---|---|---|---|---|---|
| 1 | 12 | 13 | 28 | 10 | 2 |
| 2 | 13 | 13 | 30 | 11 | 2 |
| 3 | 14 | 14 | 38 | 16 | 3 |
| 4 | 14 | 16 | 62 | 25 | 5 |
| 5 | 15 | 17 | 74 | 29 | 6 |
| 6 | 16 | 18 | 78 | 30 | 6 |
| 7 | 17 | 20 | 150 | 46 | 9 |
| 8 | 18 | 21 | 158 | 47 | 9 |
| 9 | 19 | 22 | 162 | 48 | 10 |
| 10 | 20 | 23 | 168 | 50 | 10 |

*Beyond T10:* +1 Guard, +1 TN, +8 HP and +4 Damage per T. Round role multipliers to the nearest whole number.

- **Guard** is what players **attack** against. **TN** is the **Attack DC** players **defend** against, and the DC for checks that oppose the creature directly (Taunt, Analyze, Puppet).
- **Damage** is fixed, no rolling. Area attacks deal it to everyone caught who fails (half to those who succeed). **Bonus** is the unit for Traits (about ⅕ of Damage).
- **Why the jumps at T4 and T7?** Freelancers Evolve at levels 4 and 7 and roughly double in power. The table jumps with them, so a T-N Soldier stays a fair fight at level N. The Evolution still lands hard: **last stage's monsters fall apart** (four MR 3 creatures, a Hard fight at level 3, are an Easy fight at level 4).
- **Hits are big.** A failed defense against a same-T Soldier costs about ⅔ of an average freelancer's HP. Defenses succeed about half the time, Brace and cover matter, and healing between hits matters more.

## 3. Role

| Role | Guard | HP | Damage | Actions | Typical BR | Typical MR |
|---|---|---|---|---|---|---|
| **Mook** | −1 | ×¼ | ×½ | 1 | T − 5 | T − 3 |
| **Soldier** | ±0 | ×1 | ×1 | 1 | T − 3 | **T** |
| **Skirmisher** | +1 | ×¾ | ×1 | 1; speed 40, moving after its attack never provokes | T − 3 | T |
| **Artillery** | ±0 | ×¾ | ×¾ | 1; attacks are Area (10 ft) at 90 ft | T − 3 | T + 1 |
| **Controller** | ±0 | ×1 | ×½ | 1; every attack carries a rider | T − 4 | T − 2 |
| **Brute** | −1 | ×2 | ×1½ | 1; usually Huge | T − 2 | T + 3 |
| **Elite** | ±0 | ×2 | ×1 | 2 attacks | T − 2 | T + 3 |
| **Heavy** (a Brute with the Heavy package, §4) | −1 | ×2 | ×1½ Area | 1 | T + 1 | T + 2 |
| **Boss** | +1 | ×1 **per freelancer** | ×1 for 4 freelancers (×¼ per freelancer) | 1 + one **Interrupt** (an action right after any player's turn, once per round); ends one condition on itself each Enemy Phase; **Shift** at half HP | **T + 1** | T + 4 |

*Typical ratings are measured at T2, T5 and T8 with no Traits (`tools/sim_results/09_builder_traits.md`). A Soldier's MR is its T: that's what the table is calibrated on.*

## 4. Traits
Pick 1–3. **ΔBR / ΔMR** is how much each Trait moves the ratings (measured; ½ = half a rating step). Traits marked 0 / 0 change how a fight *feels* (Flux, Surges, positioning) more than how dangerous it is.

**Group Traits** (they only work with friends; this is what makes a Pack):

| Trait | Effect | ΔBR | ΔMR |
|---|---|---|---|
| **Pack** | +1 TN and +Bonus damage for each earlier attack by a Pack ally on the same target this round (max +3 TN / +3 Bonus) | 0 | **+1** |
| **Flanker** | Attacks with advantage (the target defends with disadvantage) while another Flanker is fighting | 0 | **+1** |
| **Overwhelm** | When a freelancer is attacked by a third Overwhelm creature in one round, they are Prone and Held | 0 | +½ |
| **Crowd** | +Bonus ÷ 2 damage per other enemy fighting (max ×3) | 0 | +½ |
| **Linked** | Damage to one Linked creature is split evenly among all Linked creatures alive | 0 | +½ |
| **Frenzy** | +Bonus damage per ally killed this fight (max +3 Bonus) | 0 | +½ |
| **Leader** | Other enemies deal +Bonus damage | 0 | +½ |
| **Mender** | Instead of attacking, heals the most-hurt non-Mook ally below 60% HP for ¼ of the T row's HP | 0 | 0 |
| **Shield Wall** | +1 Guard per other Shield Wall ally fighting (max +2, Mooks +3) | 0 | 0 |
| **Explosive** | When it dies, everything within 10 ft takes ½ its Damage (**Area**, Endure) | 0 | +½ |

**Heavy package and its horde penalties** (what makes a Heavy):

| Trait | Effect | ΔBR | ΔMR |
|---|---|---|---|
| **Heavy** | Its main attack is an **Area** (20 ft around it or a 20-ft burst; 30 ft for the biggest) at ×1 of its Damage, **Recharge 4–6** (or *skips its next Enemy Phase* after using it); its other attack is Single at ×0.4 | +1 | **+4** |
| **Engulf +X** | The Area attack deals +X (2 × Bonus) to everyone caught for each freelancer caught beyond the first (max +2X) | (in Heavy) | (in Heavy) |
| **Friendly fire** | The Area attack also hits its allies in the area | (in Heavy) | (in Heavy) |
| **Apex** | While it is the only enemy standing: +2 TN and ×1½ Damage (Engulf is added after) | **+1½** | +½ |
| **Bulky** | Before using an Area attack, roll a d6 for each non-Mook ally fighting; on any 1–3 it uses its Single attack instead | 0 | **−4** |
| **Interference** | Only one Interference creature can use an Area attack each Enemy Phase | 0 | 0 to −½ |
| **Territorial** | While a rival of its kind lives, on d6 1–4 it attacks the rival instead | 0 | about −1 |

**Every Heavy needs at least one horde penalty** (Bulky, Interference or Territorial). Without one, four Heavies are a massacre (MR +4).

**Who's caught by an Area?** Whoever is inside it. The sims assume a party of 4 that isn't trying to bunch up or spread out: a 10-ft area catches the target and about 1 in 3 of the others, 20 ft about 1 in 2, 30 ft about 2 in 3, and each freelancer beyond four adds ~8% to those odds. If your table fights shoulder to shoulder in corridors, Heavies hit harder than their rating; tell players that spreading out is the counter.

**Solo and utility Traits:**

| Trait | Effect | ΔBR | ΔMR |
|---|---|---|---|
| **Armored X** | Armor 1 (T1–3), 2 (T4–6) or 3 (T7+) | 0 | 0 |
| **Huge** | Reach 10 ft. Can't be knocked Prone or pushed by non-Huge creatures | 0 | 0 |
| **Mover** | Fly, swim, climb or burrow at its speed | 0 | 0 |
| **Mimic** | Hidden until it acts; its first attack has advantage | 0 | +½ |
| **Hunter** | Half its attacks go to the freelancer with the lowest HP | 0 | +½ |
| **Shielded** | The first hit against it each round deals half damage | 0 | +½ |
| **Swarm** | Half damage from Single attacks and weapons; double from Area. Can share spaces | 0 | 0 |
| **Regenerating X** | Regains X HP (T row HP ÷ 10) at the start of each Enemy Phase unless it took Blaze or Corrode damage since its last one | 0 | 0 |
| **Damage Gate** | The first time it would drop below half HP it stops at half (extra damage is lost) and Shifts | — | — |
| **Cowardly** | At half HP or less, it surrenders on a d6 roll of 4–6 at the start of each Enemy Phase | −½ | 0 |
| **Mutagenic X** | When it damages a player, they gain X Flux | 0 | 0 |
| **Purger** | Ostrander antimutagen. When it damages a player, they lose one Primed Surge of their choice | 0 | 0 |
| **Damper Field** | While it lives, every Unleash costs +1 Flux | 0 | 0 |
| **Rider** (Grabby: Held · Venomous: Poisoned · Corrosive: Exposed · Shocking: Dazed · Fiery: Burning, its Rank = T ÷ 2 round up · Terrifying: uses Resist, Shaken · Blinding: Blinded) | Applies when a player fails the defense roll. Chrome freelancers defend against Shock with disadvantage, as always | 0 | 0 |
| **Resistant / Vulnerable (type)** | Half / double damage from one damage type | 0 | 0 |
| **Sample** | Carries a harvestable Sample ([Advancement](07_Advancement.md#samples)). Describe its Shape + Effect | — | — |

*ΔMR for group Traits comes from fair-count ratios at L2/L5/L8 (`tools/sim_results/09b_trait_steps.md`); ΔBR and the rest from T5 ratings (`09_builder_traits.md`). The ½-step values for Mimic, Hunter and Shielded are T5-only and rounded down; Territorial and Damage Gate weren't measured on their own (— / about).*

**Building a new enemy:** pick T and Role, read its typical BR/MR, add the Traits' ΔBR/ΔMR, and round. That's within about one step of what the simulator says. If you want it exact, add it to `tools/encounter_roster.py` and run `python3 tools/encounter_sim.py rate "Name"`.

## 5. Building an Encounter
**1. Budget.** A **Hard** (fair) fight is worth **one unit per freelancer**, with a small correction for very small and very large groups:

| Freelancers | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|
| Hard budget (units) | 1¾ | 2¾ | **4** | 5½ | 7 |

**2. Difficulty.** Multiply the budget:

| Difficulty | Budget | What it costs a fully rested party of 4 (sims) |
|---|---|---|
| **Easy** | ×½ | ~10% HP; Downs rare (3–6%) |
| **Standard** | ×¾ | ~20% HP; someone goes Down in ~1 fight in 5 |
| **Hard** | ×1 (fair) | ~30–40% HP; someone goes Down about half the time; deaths rare |
| **Deadly** | ×1¼ | ~50–60% HP; Downs likely; 10–25% chance the party loses or someone dies |
| *Overwhelming* | ×1½+ | The party loses about half the time. Don't, unless running is an option |

**3. Spend it.** A creature's units depend on how far its rating is from the party level:

| Rating − party level | −3 | −2 | −1 | 0 | +1 | +2 | +3 |
|---|---|---|---|---|---|---|---|
| **In a group** (use **MR**) | ⅓ | ½ | ¾ | **1** | 1½ | 2 | 3 |
| **As a centrepiece** (use **BR**) | 1½ | 2 | 3 | **4** | 6 | 8 | 11 |

Value at most **one** creature per encounter by BR (the centrepiece); everything else uses MR. A centrepiece Boss already scaled for the party (§6) is worth the whole Hard budget.

**4. Check the stage.** Freelancers double in power at each Evolution, so ratings don't carry across one:
- A creature rated in the party's **next** stage (e.g. MR 4 against level 3) counts **double** its units. Avoid more than one.
- A creature rated in the party's **previous** stage (e.g. MR 3 against level 4) counts as **one step lower** than the table says.

**Worked example.** Four level-5 freelancers, Hard fight, budget 4: a Glasshide as the centrepiece (BR 5 → 4 units) is the whole fight. Or a Bloom Knight (MR 5 → 1) + two Stitchwork Brood (MR 6 → 1½ each) = 4. For a Standard fight (3 units), take 3 Cleaner Hounds (MR 5 → 1 each).

## 6. Party Size
Use the budget table above, plus three adjustments the sims found:
- **Bosses:** HP ×1 per freelancer and Damage × (freelancers ÷ 4), summoned creatures' Damage too. With 3 freelancers: ×¾; with 5: ×1¼. Without this, a Boss fair for 4 is a near-TPK for 3 (Matriarch: 77% win, 16% death) and a walkover for 5 (13% Down).
- **Heavies vs 5+ freelancers** count **×1½** units. More bodies means more of them inside every Area, and Engulf punishes it: against 5 a Heavy's ratings drop only ~½–¾, other creatures' drop ~1.
- **Quick shift:** if you'd rather move ratings than budgets, a creature's BR and MR are about **+1 against 3 freelancers, −1 against 5** (+2 / −1½ for 2 / 6). Heavies: +1 / −½ to −¾ (as minions vs 3: only +½).

## 7. At the Table
- **From Evolution II, lone big targets melt.** Four L7 freelancers can deal 150+ damage a round. Elites and Bosses rated for them already account for that, but anything rated in the previous stage dies before it acts. Use the stage rule above.
- **Heavies want room; Packs want company.** Put a Heavy in an open hall with the party bunched at a chokepoint and it lives up to its BR. Put four Rats on one freelancer and they live up to their MR.
- **Final Form** (level 10) turns one fight per Lockdown into a rout. The ratings assume it's off. Save the finale's real threat for the Boss's Shift.
- **On a battle map,** Areas catch more freelancers than the ratings assume unless the party spreads out (the ratings model a party that neither clumps nor spreads on purpose). The [arcade](../arcade/index.html), which plays every fight on a grid, needed about 20% less enemy strength than off-map to hit the same win rates. If your table uses a grid, start Heavies one step lower or remind players to spread out. See [Playing on a Grid](06_Combat.md#optional-playing-on-a-grid).
- Terrain, objectives ("hold the pump for 3 rounds"), and fleeing enemies matter more than numbers. Use them.

## Writing a Stat Block
> **Name** — T#, Role · **BR x · MR y** · Kind · Guard x · TN x · HP x · Speed x
> **Attack:** name (Defense, Single/Area, range) — Damage x, rider.
> **Traits:** ... · **Tactics:** one sentence.

## Roster
Kinds: **Pack** (MR well above BR), **Heavy** (BR close to MR), **Generalist**, **Control** (riders, Leader, Mender), **Boss**. All stat blocks use the table above; ratings are for 4 freelancers (§6 for other sizes). Stat blocks are generated from `tools/encounter_roster.py` by `tools/threat_blocks.py`; change the data there, then regenerate.

| Creature | T | Role | Kind | BR | MR | Faction | Standout |
|---|---|---|---|---|---|---|---|
| [Scrapjack Picker](#scrapjack-picker) | 1 | Skirmisher | Pack | <1 | 2 | Scrapjacks | Pack + Flanker |
| [Spill Rats](#spill-rats) | 1 | Mook | Pack | <1 | 1 | Spill fauna | Pack + Overwhelm: four on one freelancer pin them |
| [Ward Tough](#ward-tough) | 1 | Soldier | Generalist | <1 | 1 | Drowned Wards | Cowardly: surrenders |
| [The Brood Matriarch](#the-brood-matriarch) | 1 | Boss | Boss | 1 | 5 | Spill fauna | Births Brood Spawn; Screech |
| [Bloomhound](#bloomhound) | 2 | Skirmisher | Pack | <1 | 2 | Spill fauna | Flanker + Frenzy; Held |
| [Drain Beast](#drain-beast) | 2 | Brute | Heavy | 2 | 4 | Spill fauna | Engulf Tail Thrash; Bulky; Regenerating |
| [Turret Drone](#turret-drone) | 2 | Artillery | Generalist | <1 | 2 | Ostrander Remnant | Flying 10-ft Area; Explosive |
| [Boiler Hulk](#boiler-hulk) | 3 | Brute | Heavy | 3 | 4 | Scrapjacks | Engulf Steam Vent, then skips a phase |
| [Ostrander Cleaner](#ostrander-cleaner) | 3 | Soldier | Generalist | <1 | 3 | Ostrander Remnant | Shield Wall; Purge Rifle |
| [Sporecaller](#sporecaller) | 3 | Controller | Control | <1 | 3 | Children of the Bloom | Leader + Mender; Poisoned area |
| [Cleaner Hound](#cleaner-hound) | 4 | Skirmisher | Pack | <1 | 5 | Ostrander Remnant | Pack + Flanker; Purge bite |
| [Gas Bloat](#gas-bloat) | 4 | Brute | Heavy | 4 | 6 | Children of the Bloom | 30-ft Engulf; Explosive |
| [Mirrormaw](#mirrormaw) | 4 | Elite | Generalist | 4 | 7 | Spill fauna | Mimic; two attacks |
| [Bloom Knight](#bloom-knight) | 5 | Soldier | Generalist | 3 | 5 | Children of the Bloom | Armored 2; Poisoned |
| [Damper Drone](#damper-drone) | 5 | Controller | Control | 2 | 5 | Ostrander Remnant | Damper Field: Unleash +1 Flux |
| [Glasshide](#glasshide) | 5 | Brute | Heavy | 5 | 6 | Spill fauna | Engulf; Territorial; Vulnerable (Shock) |
| [Stitchwork Brood](#stitchwork-brood) | 5 | Soldier | Pack | 2 | 6 | Children of the Bloom | Linked + Crowd |
| [Warden Krell](#warden-krell) | 5 | Boss | Boss | 5 | 10+ | Ostrander Remnant | Calls the Line; Purge; Leader |
| [Hunter-Killer Unit](#hunter-killer-unit) | 6 | Elite | Generalist | 6 | 10 | Ostrander Remnant | Hunter; two Dazing attacks |
| [Lancer Troopers](#lancer-troopers) | 6 | Mook | Pack | 1 | 4 | Ostrander Remnant | Shield Wall + Purger |
| [Feral Evolved](#feral-evolved) | 7 | Elite | Generalist | 7 | 10+ | Spill fauna | Damage Gate + Shift |
| [Gutter Leviathan](#gutter-leviathan) | 7 | Brute | Heavy | 7 | 9 | Spill fauna | 30-ft Engulf; Bulky; Territorial |
| [Razorwing Flock](#razorwing-flock) | 7 | Skirmisher | Pack | 3 | 7 | Spill fauna | Pack + Flanker + Frenzy |
| [Bloom Husks](#bloom-husks) | 8 | Mook | Pack | 4 | 7 | Children of the Bloom | Overwhelm + Crowd |
| [Ostrander Paladin](#ostrander-paladin) | 8 | Soldier | Generalist | 6 | 8 | Ostrander Remnant | Shielded; Armored 3 |
| [Seraph Gunship](#seraph-gunship) | 8 | Artillery | Heavy | 8 | 10+ | Ostrander Remnant | 20-ft Engulf at 120 ft; Interference |
| [The Drowned Choir](#the-drowned-choir) | 8 | Controller | Control | 8 | 10+ | Drowned Wards | Swarm; Leader; psychic 30-ft area |
| [Choir Thralls](#choir-thralls) | 9 | Mook | Pack | 4 | 8 | Drowned Wards | Overwhelm + Pack |
| [Mother of Rust](#mother-of-rust) | 9 | Controller | Control | 9 | 10+ | Scrapjacks | Leader + Mender; Exposed area |
| [Hollow Saint](#hollow-saint) | 10 | Skirmisher | Generalist | 5 | 9 | Children of the Bloom | Mimic + Hunter |
| [Reactor Wraith](#reactor-wraith) | 10 | Brute | Heavy | 10 | 10+ | Spill fauna | 30-ft Engulf; Interference; Bulky |
| [The Many](#the-many) | 10 | Soldier | Pack | 6 | 10 | Children of the Bloom | Linked + Frenzy |
| [Patient Zero](#patient-zero) | 10 | Boss | Boss | 10 | 10+ | Children of the Bloom | Blooms Husks; 60-ft Song; triple Shift |

**By party level** (main uses; what a fair fight looks like at each level):

| Level | Alone (BR) | Four of them (MR) |
|---|---|---|
| 1 | Brood Matriarch | Spill Rats, Ward Tough |
| 2 | Drain Beast | Scrapjack Picker, Bloomhound, Turret Drone |
| 3 | Boiler Hulk, Bloom Knight | Ostrander Cleaner, Sporecaller |
| 4 | Mirrormaw, Gas Bloat | Lancer Troopers, Drain Beast, Boiler Hulk |
| 5 | Glasshide, Warden Krell | Cleaner Hound, Bloom Knight, Damper Drone |
| 6 | Hunter-Killer Unit, Ostrander Paladin, The Many | Stitchwork Brood, Gas Bloat, Glasshide |
| 7 | Feral Evolved, Gutter Leviathan | Razorwing Flock, Bloom Husks, Mirrormaw |
| 8 | Seraph Gunship, The Drowned Choir | Ostrander Paladin, Choir Thralls |
| 9 | Mother of Rust | Hollow Saint, Gutter Leviathan |
| 10 | Reactor Wraith, Patient Zero | The Many, Hunter-Killer Unit |

### Base stage (T1–3)

#### Scrapjack Picker
**Scrapjack Picker** — T1 Skirmisher · **BR <1 · MR 2** · Pack · Guard 13 · TN 13 · HP 13 · Speed 40  
**Attack:** *Hook-blade or Rivet Gun* (Dodge, Single, melee or 60 ft) — **6**.  
**Traits:** **Pack** (+1 TN and +2 damage for each earlier Pack attack on the same target this round, max +3/+6) · **Flanker** (advantage while another Flanker is fighting).  
*Scavengers in welded scrap armour, magnets on their gloves.* **Tactics:** Gang up on whoever has visible chrome; scatter when two are down.

#### Spill Rats
**Spill Rats** — T1 Mook · **BR <1 · MR 1** · Pack · Guard 11 · TN 13 · HP 11 · Speed 30 (climb)  
**Attack:** *Bite* (Dodge, Single, melee) — **8**.  
**Traits:** **Pack** (+1 TN and +2 damage for each earlier Pack attack on the same target this round, max +3/+6) · **Overwhelm** (the 3rd attack from its group on one freelancer in a round leaves them Prone and Held) · **Mutagenic 1**.  
*Hairless, glowing, wrong number of legs.* **Tactics:** Pour out of pipes in fours or more; all bite the same freelancer.

#### Ward Tough
**Ward Tough** — T1 Soldier · **BR <1 · MR 1** · Generalist · Guard 12 · TN 13 · HP 32 · Speed 30  
**Attack:** *Pipe or Pistol* (Dodge/Endure/Resist (GM picks), Single, melee or 60 ft) — **10**.  
**Traits:** **Cowardly** (at half HP or less, surrenders on d6 4–6 each Enemy Phase).  
*Waders, a rebar club, a family to feed.* **Tactics:** Wants to be paid, not killed. Surrenders at half HP.

#### Bloomhound
**Bloomhound** — T2 Skirmisher · **BR <1 · MR 2** · Pack · Guard 14 · TN 13 · HP 14 · Speed 50  
**Attack:** *Split-Jaw* (Dodge, Single, melee) — **7**, Held.  
**Traits:** **Flanker** (advantage while another Flanker is fighting) · **Frenzy** (+2 damage per ally killed this fight, max +6).  
*A dog that opens like a flower.* **Tactics:** Hunts in packs; one holds, the rest bite. Goes wild when a packmate dies.

#### Drain Beast
**Drain Beast** — T2 Brute · **BR 2 · MR 4** · Heavy · Guard 12 · TN 13 · HP 63 · Speed 30 (swim)  
**Attack:** *Tail Thrash* (Endure, Area, 20 ft around it) — **10**. **Engulf +3:** +3 damage to everyone caught for each freelancer caught beyond the first (max +2 freelancers). **Friendly fire:** also hits its allies in the area. Recharge 4–6 · *Crush* (Endure, Single, reach 10 ft) — **5**, Held.  
**Traits:** **Apex** (while it is the only enemy standing: +2 TN, ×1½ Damage) · **Huge** · **Bulky** (before an Area attack, roll d6 per non-Mook ally; any 1–3 = it uses its single attack) · **Regenerating 3**.  
*A drowned bull crocodile the size of a bus.* **Tactics:** Thrashes when it is surrounded; drags one victim under when it is not.

#### Turret Drone
**Turret Drone** — T2 Artillery · **BR <1 · MR 2** · Generalist · Guard 13 · TN 13 · HP 21 · Speed 30 (fly)  
**Attack:** *Flechette Spray* (Dodge, Area, 10-ft burst, 90 ft) — **5**.  
**Traits:** **Armored 1** · **Mover (fly)** · **Explosive 6**.  
*A coffee-can drone with a shotgun.* **Tactics:** Hovers out of reach; fires into clusters.

#### Boiler Hulk
**Boiler Hulk** — T3 Brute · **BR 3 · MR 4** · Heavy · Guard 13 · TN 14 · HP 67 · Speed 30  
**Attack:** *Steam Vent* (Endure, Area, 20 ft around it) — **19**. **Engulf +5:** +5 damage to everyone caught for each freelancer caught beyond the first (max +2 freelancers). **Friendly fire:** also hits its allies in the area. Afterwards it skips its next Enemy Phase · *Furnace Fist* (Dodge, Single, melee) — **8**, Burning.  
**Traits:** **Armored 1** · **Apex** (while it is the only enemy standing: +2 TN, ×1½ Damage) · **Huge** · **Bulky** (before an Area attack, roll d6 per non-Mook ally; any 1–3 = it uses its single attack).  
*A walking furnace bolted onto a press-ganged Ward diver.* **Tactics:** Wades into the middle of the party and vents. Vents again whether or not its crew is close.

#### Ostrander Cleaner
**Ostrander Cleaner** — T3 Soldier · **BR <1 · MR 3** · Generalist · Guard 14 · TN 14 · HP 24 · Speed 30  
**Attack:** *Purge Rifle* (Dodge, Single, 120 ft) — **10**, loses one Primed Surge · *Foam Sprayer* (Endure, Area, 15-ft cone) — **8**.  
**Traits:** **Armored 1** · **Shield Wall** (+1 Guard per other Shield Wall ally fighting, max +2).  
*Hazmat suit, antimutagen rifle, no face.* **Tactics:** Advances in pairs behind riot shields; foams anyone mid-Surge.

#### Sporecaller
**Sporecaller** — T3 Controller · **BR <1 · MR 3** · Control · Guard 14 · TN 14 · HP 19 · Speed 30  
**Attack:** *Spore Hymn* (Endure, Area, 20-ft burst, 60 ft) — **4**, Poisoned.  
**Traits:** **Leader** (other enemies deal +3 damage) · **Mender** (instead of attacking, heals the most-hurt non-Mook ally below 60% HP for 10) · **Mutagenic 1**.  
*A Bloom priest with a mouth full of flowers.* **Tactics:** Stays behind its flock, sings, and knits their wounds shut.

### Evolution I stage (T4–6)

#### Cleaner Hound
**Cleaner Hound** — T4 Skirmisher · **BR <1 · MR 5** · Pack · Guard 15 · TN 16 · HP 33 · Speed 50  
**Attack:** *Injector Bite* (Dodge, Single, melee) — **18**, loses one Primed Surge.  
**Traits:** **Pack** (+1 TN and +5 damage for each earlier Pack attack on the same target this round, max +3/+15) · **Flanker** (advantage while another Flanker is fighting).  
*Ostrander's chrome dogs.* **Tactics:** Run in threes or fours, chase whoever just Surged, and drain their Primed Surges.

#### Gas Bloat
**Gas Bloat** — T4 Brute · **BR 4 · MR 6** · Heavy · Guard 13 · TN 16 · HP 105 · Speed 20  
**Attack:** *Spore Gout* (Endure, Area, 30 ft around it) — **15**, Poisoned. **Engulf +6:** +6 damage to everyone caught for each freelancer caught beyond the first (max +2 freelancers). **Friendly fire:** also hits its allies in the area. Recharge 5–6 · *Slam* (Dodge, Single, melee) — **9**.  
**Traits:** **Apex** (while it is the only enemy standing: +2 TN, ×1½ Damage) · **Explosive 15** · **Bulky** (before an Area attack, roll d6 per non-Mook ally; any 1–3 = it uses its single attack).  
*A Bloom convert swollen into a weather balloon of spores.* **Tactics:** Drifts into the biggest crowd it can find and bursts.

#### Mirrormaw
**Mirrormaw** — T4 Elite · **BR 4 · MR 7** · Generalist · Guard 14 · TN 16 · HP 155 · Speed 30 (climb)  
**Attack ×2:** *Glass Teeth* (Dodge, Single, melee) — **31**, Exposed.  
**Traits:** **Mimic**.  
*Looks like a vending machine, a door, or your friend.* **Tactics:** Waits. Bites the one who touches it.

#### Bloom Knight
**Bloom Knight** — T5 Soldier · **BR 3 · MR 5** · Generalist · Guard 15 · TN 17 · HP 70 · Speed 30  
**Attack:** *Thorn Glaive* (Dodge, Single, reach 10 ft) — **27**, Poisoned.  
**Traits:** **Armored 2** · **Mutagenic 1**.  
*Holy warrior grown from a single rosebush.* **Tactics:** Stands in front of Sporecallers and never retreats.

#### Damper Drone
**Damper Drone** — T5 Controller · **BR 2 · MR 5** · Control · Guard 15 · TN 17 · HP 62 · Speed 30 (fly)  
**Attack:** *Null Pulse* (Resist, Area, 10-ft burst, 60 ft) — **12**, Dazed.  
**Traits:** **Armored 1** · **Damper Field** (while it lives, every Unleash costs +1 Flux) · **Mover (fly)**.  
*A floating antimutagen censer.* **Tactics:** Hangs back over the Ostrander line; its field makes every Surge cost more.

#### Glasshide
**Glasshide** — T5 Brute · **BR 5 · MR 6** · Heavy · Guard 14 · TN 17 · HP 123 · Speed 30  
**Attack:** *Shatter Roar* (Endure, Area, 20 ft around it) — **29**. **Engulf +10:** +10 damage to everyone caught for each freelancer caught beyond the first (max +2 freelancers). **Friendly fire:** also hits its allies in the area. Recharge 4–6 · *Crystal Maul* (Endure, Single, reach 10 ft) — **14**, Prone.  
**Traits:** **Armored 2** · **Apex** (while it is the only enemy standing: +2 TN, ×1½ Damage) · **Huge** · **Territorial** (while a rival of its kind lives, d6 1–4: it attacks the rival instead) · **Bulky** (before an Area attack, roll d6 per non-Mook ally; any 1–3 = it uses its single attack) · **Vulnerable (Shock)**.  
*A bear grown into a cathedral of quartz.* **Tactics:** Charges the loudest thing. Fights any other Glasshide on sight.

#### Stitchwork Brood
**Stitchwork Brood** — T5 Soldier · **BR 2 · MR 6** · Pack · Guard 15 · TN 17 · HP 66 · Speed 30  
**Attack:** *Sutured Claws* (Dodge/Endure/Resist (GM picks), Single, melee) — **26**.  
**Traits:** **Linked** (damage to one is split evenly among all Linked creatures) · **Crowd** (+3 damage per other enemy fighting, max +9).  
*Bloom converts sewn into one nervous system with living thread.* **Tactics:** Move as one; a wound on one bleeds on all of them.

#### Hunter-Killer Unit
**Hunter-Killer Unit** — T6 Elite · **BR 6 · MR 10** · Generalist · Guard 16 · TN 18 · HP 195 · Speed 40  
**Attack ×2:** *Mono-wire or Arc Pistol* (Dodge, Single, reach 10 ft or 60 ft) — **38**, Dazed.  
**Traits:** **Armored 2** · **Hunter** (half its attacks go to the lowest-HP freelancer).  
*Ostrander's chrome assassin.* **Tactics:** Kills the medic first.

#### Lancer Troopers
**Lancer Troopers** — T6 Mook · **BR 1 · MR 4** · Pack · Guard 15 · TN 18 · HP 31 · Speed 30  
**Attack:** *Shock Lance* (Dodge, Single, 30 ft) — **23**, Dazed.  
**Traits:** **Shield Wall** (+1 Guard per other Shield Wall ally fighting, max +3) · **Purger**.  
*Ostrander riot line.* **Tactics:** Locked shields in sixes. Two hold the door; the rest lance the Chrome.

### Evolution II stage (T7–10)

#### Feral Evolved
**Feral Evolved** — T7 Elite · **BR 7 · MR 10+** · Generalist · Guard 17 · TN 20 · HP 300 · Speed 40  
**Attack ×2:** *Wrong Claws* (Dodge, Single, melee) — **46**.  
**Traits:** **Regenerating 8** · **Mutagenic 2** · **Damage Gate** (the first time it would drop below half HP it stops at half and Shifts).  
**Shift (half HP):** +2 Guard; +9 Damage; everyone within 30 ft is Shaken (Resist vs TN).  
*A freelancer whose second Evolution went wrong.* **Tactics:** It remembers your names.

#### Gutter Leviathan
**Gutter Leviathan** — T7 Brute · **BR 7 · MR 9** · Heavy · Guard 16 · TN 20 · HP 270 · Speed 20 (swim 40)  
**Attack:** *Undertow* (Endure, Area, 30 ft around it) — **30**, Prone. **Engulf +10:** +10 damage to everyone caught for each freelancer caught beyond the first (max +2 freelancers). **Friendly fire:** also hits its allies in the area. Recharge 4–6 · *Swallow* (Endure, Single, reach 15 ft) — **15**, Held.  
**Traits:** **Armored 3** · **Apex** (while it is the only enemy standing: +2 TN, ×1½ Damage) · **Huge** · **Bulky** (before an Area attack, roll d6 per non-Mook ally; any 1–3 = it uses its single attack) · **Territorial** (while a rival of its kind lives, d6 1–4: it attacks the rival instead).  
*The thing that lives in the flooded subway.* **Tactics:** Surfaces, drowns everyone near the water, dives. Two never share a tunnel.

#### Razorwing Flock
**Razorwing Flock** — T7 Skirmisher · **BR 3 · MR 7** · Pack · Guard 18 · TN 20 · HP 55 · Speed 60 (fly)  
**Attack:** *Razor Dive* (Dodge, Single, melee) — **23**.  
**Traits:** **Flanker** (advantage while another Flanker is fighting) · **Frenzy** (+9 damage per ally killed this fight, max +27) · **Pack** (+1 TN and +9 damage for each earlier Pack attack on the same target this round, max +3/+27).  
*Pigeons the Spill turned into flying knives.* **Tactics:** Dive one target from every side; scream and dive harder when one falls.

#### Bloom Husks
**Bloom Husks** — T8 Mook · **BR 4 · MR 7** · Pack · Guard 17 · TN 21 · HP 62 · Speed 30  
**Attack:** *Root Grip* (Endure, Single, melee) — **37**, Held.  
**Traits:** **Overwhelm** (the 3rd attack from its group on one freelancer in a round leaves them Prone and Held) · **Crowd** (+4 damage per other enemy fighting, max +13).  
*Bodies the Bloom finished with, still walking.* **Tactics:** Shamble in crowds; three on one freelancer drag them down.

#### Ostrander Paladin
**Ostrander Paladin** — T8 Soldier · **BR 6 · MR 8** · Generalist · Guard 18 · TN 21 · HP 140 · Speed 30  
**Attack:** *Lance Cannon* (Dodge/Endure/Resist (GM picks), Single, 90 ft) — **42**.  
**Traits:** **Armored 3** · **Shielded**.  
*A powered exo-frame with a saint painted on the chest.* **Tactics:** Walks through gunfire to plant its lance; never breaks formation.

#### Seraph Gunship
**Seraph Gunship** — T8 Artillery · **BR 8 · MR 10+** · Heavy · Guard 18 · TN 21 · HP 170 · Speed 40 (fly)  
**Attack:** *Rotary Cannon* (Dodge, Area, 20-ft burst, 120 ft) — **51**. **Engulf +26:** +26 damage to everyone caught for each freelancer caught beyond the first (max +2 freelancers). Recharge 4–6 · *Door Gun* (Dodge, Single, 120 ft) — **20**.  
**Traits:** **Armored 3** · **Apex** (while it is the only enemy standing: +2 TN, ×1½ Damage) · **Mover (fly)** · **Interference** (only one Interference creature can use an Area attack per Enemy Phase) · **Explosive 24**.  
*An Ostrander drone with angel wings painted on.* **Tactics:** Circles the rooftops and shreds anyone in the open. Gunships share one fire-control net.

#### The Drowned Choir
**The Drowned Choir** — T8 Controller · **BR 8 · MR 10+** · Control · Guard 18 · TN 21 · HP 365 · Speed 20 (swim)  
**Attack:** *Undertow Song* (Resist, Area, 30 ft around it) — **36**, Shaken (psychic: ignores Armor).  
**Traits:** **Swarm** · **Mutagenic 2** · **Leader** (other enemies deal +9 damage).  
*Fifty drowned voices fused into one.* **Tactics:** Sings the living toward the water; its thralls sing louder near it.

#### Choir Thralls
**Choir Thralls** — T9 Mook · **BR 4 · MR 8** · Pack · Guard 18 · TN 22 · HP 63 · Speed 30  
**Attack:** *Grasping Hands* (Endure, Single, melee) — **38**, Held.  
**Traits:** **Overwhelm** (the 3rd attack from its group on one freelancer in a round leaves them Prone and Held) · **Pack** (+1 TN and +10 damage for each earlier Pack attack on the same target this round, max +3/+30) · **Mutagenic 1**.  
*The Choir's converts, still singing.* **Tactics:** Come in sixes to pin you down for something worse.

#### Mother of Rust
**Mother of Rust** — T9 Controller · **BR 9 · MR 10+** · Control · Guard 19 · TN 22 · HP 486 · Speed 30 (climb)  
**Attack:** *Corrosion Tide* (Endure, Area, 20 ft around her) — **55**, Exposed.  
**Traits:** **Leader** (other enemies deal +10 damage) · **Mender** (instead of attacking, heals the most-hurt non-Mook ally below 60% HP for 40).  
*The Scrapjacks' queen, a cathedral of rust and stolen limbs.* **Tactics:** Melts Armor, rebuilds her crew from scrap, and lets them feast.

#### Hollow Saint
**Hollow Saint** — T10 Skirmisher · **BR 5 · MR 9** · Generalist · Guard 21 · TN 23 · HP 95 · Speed 50 (fly)  
**Attack:** *Halo Edge or Whisper* (Dodge/Endure/Resist (GM picks), Single, melee or 60 ft) — **38**, Shaken.  
**Traits:** **Mimic** · **Hunter** (half its attacks go to the lowest-HP freelancer).  
*A Bloom martyr that came back beautiful.* **Tactics:** Appears among the wounded and offers to end the pain.

#### Reactor Wraith
**Reactor Wraith** — T10 Brute · **BR 10 · MR 10+** · Heavy · Guard 19 · TN 23 · HP 271 · Speed 30 (fly)  
**Attack:** *Meltdown* (Endure, Area, 30 ft around it) — **48**. **Engulf +16:** +16 damage to everyone caught for each freelancer caught beyond the first (max +2 freelancers). **Friendly fire:** also hits its allies in the area. Afterwards it skips its next Enemy Phase · *Irradiate* (Endure, Single, 30 ft) — **24**, Burning.  
**Traits:** **Armored 2** · **Apex** (while it is the only enemy standing: +2 TN, ×1½ Damage) · **Huge** · **Interference** (only one Interference creature can use an Area attack per Enemy Phase) · **Bulky** (before an Area attack, roll d6 per non-Mook ally; any 1–3 = it uses its single attack).  
*The ghost of a cooling tower.* **Tactics:** Hovers into the middle of the fight and goes critical. Wraiths drain each other.

#### The Many
**The Many** — T10 Soldier · **BR 6 · MR 10** · Pack · Guard 20 · TN 23 · HP 142 · Speed 30  
**Attack:** *Thousand Hands* (Dodge/Endure/Resist (GM picks), Single, melee) — **42**.  
**Traits:** **Linked** (damage to one is split evenly among all Linked creatures) · **Frenzy** (+10 damage per ally killed this fight, max +30).  
*Patient Zero's first congregation, grown together at the roots.* **Tactics:** Surround; when one falls the rest scream in one voice and push harder.

### Bosses

#### The Brood Matriarch
**The Brood Matriarch** — T1 Boss · **BR 1 · MR 5** · Boss · Guard 13 · TN 13 · HP 58 · Speed 0 (rooted); 30 after Shift  
**Actions** (one per Enemy Phase + one Interrupt): *Brood-Lash* (Dodge, Single, reach 15 ft) — **6**, Held · *Screech* (Resist, Area, 30 ft around her) — **4**, Shaken. Recharge 5–6 · *Birth:* 2 Brood Spawn join the fight (max 4), Recharge 5–6 — each: Guard 11 · TN 13 · HP 4 · Bite (Dodge) 3.  
**Traits:** **Huge** · **Mutagenic 1**.  
**Shift (half HP):** ends every condition on itself; *Brood-Lash* (Dodge, Single, reach 15 ft) — **5** to each of 2 targets, Held.  
*A womb the size of a truck, rooted into the pipes.* **Tactics:** Holds the strongest freelancer, Births when she has fewer than 3 rats, Screeches when 2+ freelancers are near.

#### Warden Krell
**Warden Krell** — T5 Boss · **BR 5 · MR 10+** · Boss · Guard 16 · TN 17 · HP 234 · Speed 30  
**Actions** (one per Enemy Phase + one Interrupt): *Purge Carbine* (Dodge, Single, 120 ft) — **14**, loses one Primed Surge · *Riot Slam* (Endure, Area, 15-ft cone) — **11**, Prone. Recharge 5–6 · *Call the Line:* 2 Riot Line Troopers join the fight (max 4), Recharge 6 — each: Guard 15 · TN 18 · HP 15 · Shock Lance (Dodge) 7, Dazed.  
**Traits:** **Armored 2** · **Leader** (other enemies deal +6 damage).  
**Shift (half HP):** +1 Armor; ends every condition on itself; *Riot Slam* (Endure, Area, 20 ft around him) — **11**, Prone. Recharge 5–6.  
*The Ostrander officer who ran the Lockdown camps.* **Tactics:** Opens from cover, Purges whoever has the most Primed Surges, and calls the Line the moment the party bunches up.

#### Patient Zero
**Patient Zero** — T10 Boss · **BR 10 · MR 10+** · Boss · Guard 21 · TN 23 · HP 282 · Speed 40 (fly after Shift)  
**Actions** (one per Enemy Phase + one Interrupt): *Unmaking Touch* (Endure, Single, reach 15 ft) — **25**, +2 Flux · *The First Song* (Resist, Area, 60 ft around it) — **15**, Shaken (psychic: ignores Armor). Recharge 5–6 · *Bloom:* 2 Husks join the fight (max 4), Recharge 5–6 — each: Guard 17 · TN 21 · HP 16 · Root Grip (Endure) 11, Held.  
**Traits:** **Huge** · **Regenerating 8**.  
**Shift (half HP):** +1 Guard; +1 Interrupt; *Unmaking Touch* (Endure, Single, reach 15 ft) — **20** to each of 3 targets, +2 Flux.  
*The first person ever to take the Mutagen, still alive in the reactor core.* **Tactics:** Talks before it fights. Its Shift should land after the party has spent their Final Forms.

## Quick Reskins (d6)
Need a monster now? Pick a stat block above and roll a new look.

| d6 | Bio twist | Chrome twist |
|---|---|---|
| 1 | Fused from several animals | Built from a dead vehicle |
| 2 | Coated in fungus or moss | Runs on stolen Mutagen batteries |
| 3 | Too many eyes | One huge lens |
| 4 | Translucent; organs visible | Wrapped in Ostrander warning tape |
| 5 | Sings or hums | Plays old advertising jingles |
| 6 | Was clearly once a person | Is clearly still a person inside |
