# 10. Threats

![Drain Beast](../art/threat_drainbeast.jpg)

Every enemy is built from three parts: **Threat level (T)**, **Role**, and **Traits**. You can build a new one in under a minute, or read one off the examples below.

## 1. Threat Level
T runs 1–10, matching the party level it's meant for.

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

*Beyond T10:* +1 Guard, +½ TN (round down), +10 HP and +3 Damage per T. Role multipliers round down.

- **Guard** is what players **attack** against. It rises fast, because freelancers' primary stats do.
- **TN** is the **Attack DC** players **defend** against, and the DC for checks that oppose it directly (Taunt, Analyze, Puppet). It rises slowly, because defenses do.
- **Damage** is fixed, no rolling. Area attacks deal it to everyone who fails (half to those who succeed).
- **Why the bumps?** Freelancers Evolve at levels 4 and 7. The table *stalls* there (T4 has T3's Guard and TN) and then catches up (the big HP jump at T7). Right after an Evolution, same-level fights feel easier, and the next two missions close the gap. That is intended: Evolutions should feel huge.

## 2. Role

| Role | Guard (vs table) | HP | Damage | Special | Cost |
|---|---|---|---|---|---|
| **Mook** | −1 | Dies to any damage | ½ | Come in groups | ½ |
| **Soldier** | ±0 | ×1 | ×1 | — | 1 |
| **Skirmisher** | +1 | ×¾ | ×1 | Speed 40; moving after its attack never provokes | 1 |
| **Artillery** | ±0 | ×¾ | ×¾ | Attacks are **Area** (10-ft radius) at 90 ft | 1 |
| **Controller** | ±0 | ×1 | ×½ | Every attack carries a rider Trait | 1 |
| **Brute** | −1 | ×2 | ×1½ | Usually Huge | 2 |
| **Elite** | ±0 | ×2 | ×1 | Two attacks per Enemy Phase | 2 |
| **Boss** | +1 | ×1 per PC | ×1 | One action in the Enemy Phase **plus one Interrupt** (an action right after any player's turn, once per round). Ends one condition on itself each Enemy Phase. Has a **Shift** at half HP. | 1 per PC |

## 3. Traits (pick 1–3)

| Trait | Effect |
|---|---|
| **Armored** | Armor 1 (T1–3), 2 (T4–6), or 3 (T7+). |
| **Huge** | Reach 10 ft. Can't be knocked Prone or pushed by non-Huge creatures. |
| **Mover** | Fly, swim, climb, or burrow at its speed. |
| **Pack** | +2 damage if another enemy is adjacent to its target. |
| **Grabby** | Rider: Held. |
| **Venomous** | Rider: Poisoned. |
| **Corrosive** | Rider: Exposed. |
| **Shocking** | Rider: Dazed. (Chrome PCs defend with disadvantage, as always against Shock.) |
| **Fiery** | Rider: Burning (its Rank = T/2, round up). |
| **Terrifying** | Attack uses Resist. Rider: Shaken. |
| **Blinding** | Rider: Blinded. |
| **Mutagenic X** | When it damages a player, they gain X Flux. |
| **Purger** | Ostrander antimutagen. When it damages a player, they lose one Primed Surge of their choice. |
| **Regenerating** | Regains T HP at the start of each Enemy Phase unless it took Blaze or Corrode damage since its last one. |
| **Swarm** | Half damage from Strike/Bolt/single-target weapons; double from Area. Can share spaces. |
| **Shielded** | The first hit against it each round deals half damage. |
| **Explosive** | When it dies, everything within 10 ft takes its Damage (**Area**, Endure). |
| **Mimic** | Hidden until it acts. Its first attack is made with advantage (defender rolls with disadvantage). |
| **Leader** | Other enemies within 30 ft deal +2 damage. |
| **Resistant / Vulnerable (type)** | Half / double damage from one damage type. |
| **Sample** | Carries a harvestable Sample ([Advancement](07_Advancement.md#samples)). Describe its Shape + Effect. |

**Riders** apply when a player fails the defense roll.

## Building an Encounter
**Budget = number of players.** Spend it on enemy Costs at T = party level.

| Difficulty | Budget | Party HP lost, Base stage (L1–3) | Right after an Evolution (L4, L7) | Late in a stage (L6, L9–10) |
|---|---|---|---|---|
| Easy | ×¾ | ~10% | ~5–10% | ~15% |
| Standard | ×1 | ~20–25%, rare Downs | ~13–15% | ~23–29% |
| Hard | ×1¼ | ~35%, someone may go Down | ~18–22% | ~28–35% |
| Deadly | ×1½ | ~40–55%, real risk of death | ~21–37% | ~32–60% |

*From `tools/balance_sim.py` (4 freelancers, 2,000 fights each; it ignores riders, healing and Wild Surges, so real fights run a little easier).*

- Enemies **2+ levels below** the party cost **half**. Enemies **2+ above** cost **double**. Avoid T more than 3 above the party.
- Plan **2–3 Standard fights between Breathers**. The party has two Breathers per Lockdown.
- **After an Evolution,** let the party enjoy it for one mission: run the fights at Standard and watch them tear through. From the next mission on, use Hard fights for set pieces, and add an enemy that can hurt the new body (a Purger squad, a Shock-heavy machine for Chrome, a Swarm for Strike-heavy Forms).
- **From Evolution II, lone big targets melt.** Four L7 freelancers can deal 150+ damage in a round, more than a T7 Elite or Brute has. Spend at least half the budget on **3+ bodies** (Mooks, Soldiers, Skirmishers), and give a centrepiece Elite a damage gate like the Feral Evolved's (it stops at half HP the first time and changes).
- **Final Form** (level 10) makes one fight per Lockdown a rout. Save the finale's real threat for the Boss's Shift, *after* the party has spent it, or let them spend it and enjoy the show.
- Terrain, objectives ("hold the pump for 3 rounds"), and fleeing enemies matter more than numbers. Use them.

## Writing a Stat Block
> **Name** — T#, Role · **Guard** x · **TN** x · **HP** x · **Speed** x
> **Attack:** name (Defense, Single/Area, range) — Damage x, rider.
> **Traits:** ... · **Tactics:** one sentence.

## Example Threats
All stat blocks use the v0.2 table. They're grouped by stage: **Base** (T1–3), **Evolution I** (T4–6) and **Evolution II** (T7–10).

### Base stage (T1–3)
**Spill Rats** — T1 Mook · Guard 11 · TN 12 · HP — · Speed 30 (climb)  
**Attack:** Bite (Dodge, Single, melee) — 3. **Traits:** Mover (climb), Mutagenic 1. **Tactics:** Pour out of pipes in fours; swarm whoever is bleeding.

**Scrapjack Picker** — T1 Skirmisher · Guard 13 · TN 12 · HP 13 · Speed 40  
**Attack:** Hook-blade (Dodge, Single, melee) or Rivet Gun (Dodge, Single, 60 ft) — 7. **Traits:** Pack. **Tactics:** Hit, retreat, and gang up on anyone with visible chrome.

**Ward Tough** — T1 Soldier · Guard 12 · TN 12 · HP 18 · Speed 30  
**Attack:** Pipe or Pistol (Dodge, Single, melee/60 ft) — 7. **Traits:** — . **Tactics:** Wants to be paid, not killed. Surrenders at half HP.

**Bloomhound** — T2 Skirmisher · Guard 14 · TN 12 · HP 16 · Speed 50  
**Attack:** Split-Jaw (Dodge, Single, melee) — 8, Held. **Traits:** Pack, Grabby. **Tactics:** Hunts in pairs; one holds, one bites.

**Turret Drone** — T2 Artillery · Guard 13 · TN 12 · HP 16 · Speed 30 (fly)  
**Attack:** Flechette Spray (Dodge, Area 10 ft, 90 ft) — 6. **Traits:** Mover (fly), Armored (1), Explosive. **Tactics:** Hovers out of reach; targets clustered players.

**Drain Beast** — T2 Brute · Guard 12 · TN 12 · HP 44 · Speed 30 (swim)  
**Attack:** Crush (Endure, Single, reach 10 ft) — 12, Held. **Traits:** Huge, Grabby, Regenerating, Vulnerable (Blaze). **Tactics:** Drags one victim under water and sits on them.

**Ostrander Cleaner** — T3 Soldier · Guard 14 · TN 13 · HP 30 · Speed 30  
**Attack:** Purge Rifle (Dodge, Single, 120 ft) — 10, or Foam Sprayer (Endure, Area 15-ft cone) — 10. **Traits:** Armored (1), Purger. **Tactics:** Advances in pairs behind cover; foams anyone mid-Surge.

**Sporecaller** — T3 Controller · Guard 14 · TN 13 · HP 30 · Speed 30  
**Attack:** Spore Hymn (Endure, Area 10 ft, 60 ft) — 5, Poisoned. **Traits:** Venomous, Mutagenic 1, Leader. **Tactics:** A Bloom priest; stays behind its flock and sings.

### Evolution I stage (T4–6)
**Mirrormaw** — T4 Elite · Guard 14 · TN 13 · HP 80 · Speed 30 (climb)  
**Attack ×2:** Glass Teeth (Dodge, Single, melee) — 12, Exposed. **Traits:** Mimic, Corrosive, Sample (*Bolt + Corrode*). **Tactics:** Looks like a vending machine, a door, or your friend.

**Cleaner Hound** — T4 Skirmisher · Guard 15 · TN 13 · HP 30 · Speed 50  
**Attack:** Injector Bite (Dodge, Single, melee) — 12. **Traits:** Purger, Pack. **Tactics:** Ostrander's chrome dogs. Run in threes, chase whoever just Surged, and drain their Primed Surges.

**Bloom Knight** — T5 Soldier · Guard 15 · TN 14 · HP 48 · Speed 30  
**Attack:** Thorn Glaive (Dodge, Single, reach 10 ft) — 14, Poisoned. **Traits:** Armored (2), Venomous, Mutagenic 1. **Tactics:** Holy warriors of the Children. Stand in front of Sporecallers and never retreat.

**Glasshide** — T5 Brute · Guard 14 · TN 14 · HP 96 · Speed 30  
**Attack:** Crystal Maul (Endure, Single, reach 10 ft) — 21, Prone. **Traits:** Huge, Armored (2), Vulnerable (Shock). **Tactics:** A bear grown into a cathedral of quartz. Charges the loudest thing.

**Lancer Troopers** — T6 Mook · Guard 15 · TN 15 · HP — · Speed 30  
**Attack:** Shock Lance (Dodge, Single, 30 ft) — 8, Dazed. **Traits:** Shocking, Purger. **Tactics:** Ostrander riot line, in sixes. Two hold the door; the rest fan out and lance the Chrome.

**Hunter-Killer Unit** — T6 Elite · Guard 16 · TN 15 · HP 112 · Speed 40  
**Attack ×2:** Mono-wire (Dodge, Single, reach 10 ft) or Arc Pistol (Dodge, Single, 60 ft) — 16, Dazed. **Traits:** Shocking, Armored (2), Sample (*Wave + Shock*). **Tactics:** Ostrander's chrome assassin. Kills the medic first.

### Evolution II stage (T7–10)
**Feral Evolved** — T7 Elite · Guard 17 · TN 16 · HP 144 · Speed 40  
**Attack ×2:** Wrong Claws (Dodge, Single, melee) — 18. **Traits:** Regenerating, Mutagenic 2, Sample (*Strike + Toxin*). **Special:** The first time it would drop below half HP, it stops at half (the extra damage is lost) and **Emerges** like a freelancer: +2 Guard, +3 Damage, and it Shakes everyone within 30 ft (Resist vs its TN). **Tactics:** A freelancer whose second Evolution went wrong. It remembers your names.

**Gutter Leviathan** — T7 Brute · Guard 16 · TN 16 · HP 144 · Speed 20 (swim 40)  
**Attack:** Swallow (Endure, Single, reach 15 ft) — 27, Held (inside it: Blinded, and 9 Toxin at the start of each Enemy Phase until freed). **Traits:** Huge, Mover (swim), Grabby, Armored (3). **Tactics:** Lives in the flooded subway. Surfaces, swallows, dives.

**Seraph Gunship** — T8 Artillery · Guard 18 · TN 17 · HP 63 · Speed 40 (fly)  
**Attack:** Rotary Cannon (Dodge, Area 10 ft, 120 ft) — 15. **Traits:** Mover (fly), Armored (3), Explosive. **Tactics:** An Ostrander drone with angel wings painted on. Circles the rooftops and shreds anyone in the open.

**The Drowned Choir** — T8 Controller · Guard 18 · TN 17 · HP 84 · Speed 20 (swim)  
**Attack:** Undertow Song (Resist, Area 30 ft around it) — 10, Shaken. **Traits:** Terrifying, Mutagenic 2, Swarm. **Tactics:** Fifty drowned voices fused into one. Pulls the Shaken toward the water.

**Choir Thralls** — T9 Mook · Guard 18 · TN 18 · HP — · Speed 30  
**Attack:** Grasping Hands (Endure, Single, melee) — 12, Held. **Traits:** Grabby, Mutagenic 1. **Tactics:** The Choir's converts, still singing. Come in sixes to pin you down for something worse.

**Mother of Rust** — T9 Controller · Guard 19 · TN 18 · HP 92 · Speed 30 (climb)  
**Attack:** Corrosion Tide (Endure, Area 20 ft around her) — 12, Exposed. **Traits:** Corrosive, Leader, Resistant (Corrode), Sample (*Pulse + Corrode*). **Tactics:** The Scrapjacks' queen, a cathedral of rust and stolen limbs. Melts Armor, then lets her thralls feast.

**Hollow Saint** — T10 Skirmisher · Guard 21 · TN 18 · HP 75 · Speed 50 (fly)  
**Attack:** Halo Edge (Dodge, Single, melee) — 27, or Whisper (Resist, Single, 60 ft) — 27, Shaken. **Traits:** Mimic, Terrifying, Mover (fly). **Tactics:** A Bloom martyr that came back beautiful. Appears among the wounded and offers to end the pain.

### Boss: The Brood Matriarch (T1)
**The Brood Matriarch** — T1 Boss · Guard 13 · TN 12 · HP 18 × players · Speed 0 (rooted) → 30 after Shift  
**Actions** (one per Enemy Phase + one Interrupt):
- *Brood-Lash* (Dodge, Single, reach 15 ft) — 7, Held.
- *Screech* (Resist, Area 30 ft around her) — 7, Shaken.
- *Birth:* 2 Spill Rats crawl out of her (max 6 on the field).

**Traits:** Huge, Mutagenic 1, Sample (*Burst + Snare*: "Brood Web").  
**Shift (half HP):** She tears free of the wall. Speed 30, and *Brood-Lash* hits everyone within 15 ft (**Area**).  
**Tactics:** Holds the strongest freelancer, Births when she has fewer than 3 rats, Screeches when 2+ players are near.

### Boss: Warden Krell (T5)
**Warden Krell** — T5 Boss · Guard 16 · TN 14 · HP 48 × players · Speed 30  
**Actions** (one per Enemy Phase + one Interrupt):
- *Purge Carbine* (Dodge, Single, 120 ft) — 14, and the target loses one Primed Surge (Purger).
- *Riot Slam* (Endure, Area 10-ft cone) — 14, Prone.
- *Call the Line:* 3 Lancer Troopers arrive at the nearest door (max 6).

**Traits:** Armored (2), Purger, Leader, Sample (*Bolt + Shock*: "Warden's Lash").  
**Shift (half HP):** His chrome shell splits and he Evolves into something Ostrander swore it would never use. Armor 3, speed 40, and *Riot Slam* becomes a 20-ft Pulse around him.  
**Tactics:** Opens from cover, Purges whoever has the most Primed Surges, and calls the Line the moment the party bunches up.

### Boss: Patient Zero (T10)
**Patient Zero** — T10 Boss · Guard 21 · TN 18 · HP 100 × players · Speed 40 (fly after Shift)  
**Actions** (one per Enemy Phase + one Interrupt):
- *Unmaking Touch* (Endure, Single, reach 15 ft) — 27, and the target gains 2 Flux.
- *The First Song* (Resist, Area 60 ft around it) — 20, Shaken.
- *Bloom:* every Mook or Controller within 60 ft regains all HP or a dead one stands up (once per round).

**Traits:** Huge, Mutagenic 2, Regenerating, Sample (*Burst + Dread*: "The First Song").  
**Shift (half HP):** **Final Form.** It becomes the thing the Spill was always trying to make: Guard +1, *Unmaking Touch* becomes **Area** (everyone within 15 ft), and it gets a second Interrupt each round.  
**Tactics:** The first person ever to take the Mutagen, still alive in the reactor core. It is curious about the freelancers, because they are what it was supposed to become. It talks before it fights, and its Shift should land after the party has spent their Final Forms.

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
