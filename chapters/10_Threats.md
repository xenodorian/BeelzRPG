# 10. Threats

![Drain Beast](../art/threat_drainbeast.jpg)

Every enemy is built from three parts: **Threat level (T)**, **Role**, and **Traits**. You can build a new one in under a minute, or read one off the examples below.

## 1. Threat Level
T runs 1–10, matching the party level it's meant for.

| T | TN | HP | Damage |
|---|---|---|---|
| 1 | 12 | 18 | 7 |
| 2 | 12 | 25 | 9 |
| 3 | 13 | 32 | 10 |
| 4 | 13 | 39 | 12 |
| 5 | 14 | 46 | 13 |
| 6 | 14 | 53 | 15 |
| 7 | 15 | 60 | 16 |
| 8 | 15 | 67 | 18 |
| 9 | 16 | 74 | 19 |
| 10 | 16 | 81 | 21 |

*Formulas:* TN = 11 + T/2 (round up). HP = 7T + 11. Damage = 6 + 1.5T (round down). Use them to go beyond T10. Role multipliers round down.

- **TN** is the **Attack DC** players defend against and, by default, the **Guard** players attack against.
- **Damage** is fixed, no rolling. Area attacks deal it to everyone who fails (half to those who succeed).

## 2. Role

| Role | Guard | HP | Damage | Special | Cost |
|---|---|---|---|---|---|
| **Mook** | TN −1 | Dies to any damage | ½ | Come in groups | ½ |
| **Soldier** | TN | ×1 | ×1 | — | 1 |
| **Skirmisher** | TN +1 | ×¾ | ×1 | Speed 40; moving after its attack never provokes | 1 |
| **Artillery** | TN | ×¾ | ×¾ | Attacks are **Area** (10-ft radius) at 90 ft | 1 |
| **Controller** | TN | ×1 | ×½ | Every attack carries a rider Trait | 1 |
| **Brute** | TN −1 | ×2 | ×1½ | Usually Huge | 2 |
| **Elite** | TN | ×2 | ×1 | Two attacks per Enemy Phase | 2 |
| **Boss** | TN +1 | ×1 per PC | ×1 | One action in the Enemy Phase **plus one Interrupt** (an action right after any player's turn, once per round). Ends one condition on itself each Enemy Phase. Has a **Shift** at half HP. | 1 per PC |

## 3. Traits (pick 1–3)

| Trait | Effect |
|---|---|
| **Armored** | Armor 1 (T1–4) or 2 (T5+). |
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

| Difficulty | Budget | Expect |
|---|---|---|
| Easy | ×¾ | ~15% of party HP lost |
| Standard | ×1 | ~25% of party HP lost, rare Downs |
| Hard | ×1¼ | ~35–45%, someone probably goes Down |
| Deadly | ×1½ | ~45–70%, real risk of death |

- Enemies **2+ levels below** the party cost **half**. Enemies **2+ above** cost **double**. Avoid T more than 3 above the party.
- Plan **2–3 Standard fights between Breathers**. The party has two Breathers per Lockdown.
- Terrain, objectives ("hold the pump for 3 rounds"), and fleeing enemies matter more than numbers. Use them.

## Writing a Stat Block
> **Name** — T#, Role · **Guard** x · **TN** x · **HP** x · **Speed** x
> **Attack:** name (Defense, Single/Area, range) — Damage x, rider.
> **Traits:** ... · **Tactics:** one sentence.

## Example Threats
**Spill Rats** — T1 Mook · Guard 11 · TN 12 · HP — · Speed 30 (climb)  
**Attack:** Bite (Dodge, Single, melee) — 3. **Traits:** Mover (climb), Mutagenic 1. **Tactics:** Pour out of pipes in fours; swarm whoever is bleeding.

**Scrapjack Picker** — T1 Skirmisher · Guard 13 · TN 12 · HP 13 · Speed 40  
**Attack:** Hook-blade (Dodge, Single, melee) or Rivet Gun (Dodge, Single, 60 ft) — 7. **Traits:** Pack. **Tactics:** Hit, retreat, and gang up on anyone with visible chrome.

**Ward Tough** — T1 Soldier · Guard 12 · TN 12 · HP 18 · Speed 30  
**Attack:** Pipe or Pistol (Dodge, Single, melee/60 ft) — 7. **Traits:** — . **Tactics:** Wants to be paid, not killed. Surrenders at half HP.

**Bloomhound** — T2 Skirmisher · Guard 13 · TN 12 · HP 18 · Speed 50  
**Attack:** Split-Jaw (Dodge, Single, melee) — 9, Held. **Traits:** Pack, Grabby. **Tactics:** Hunts in pairs; one holds, one bites.

**Turret Drone** — T2 Artillery · Guard 12 · TN 12 · HP 18 · Speed 30 (fly)  
**Attack:** Flechette Spray (Dodge, Area 10 ft, 90 ft) — 6. **Traits:** Mover (fly), Armored, Explosive. **Tactics:** Hovers out of reach; targets clustered players.

**Drain Beast** — T2 Brute · Guard 11 · TN 12 · HP 50 · Speed 30 (swim)  
**Attack:** Crush (Endure, Single, reach 10 ft) — 13, Held. **Traits:** Huge, Grabby, Regenerating, Vulnerable (Blaze). **Tactics:** Drags one victim under water and sits on them.

**Ostrander Cleaner** — T3 Soldier · Guard 13 · TN 13 · HP 32 · Speed 30  
**Attack:** Purge Rifle (Dodge, Single, 120 ft) — 10, or Foam Sprayer (Endure, Area 15-ft cone) — 10. **Traits:** Armored, Purger. **Tactics:** Advances in pairs behind cover; foams anyone mid-Surge.

**Sporecaller** — T3 Controller · Guard 13 · TN 13 · HP 32 · Speed 30  
**Attack:** Spore Hymn (Endure, Area 10 ft, 60 ft) — 5, Poisoned. **Traits:** Venomous, Mutagenic 1, Leader. **Tactics:** A Bloom priest; stays behind its flock and sings.

**Mirrormaw** — T4 Elite · Guard 13 · TN 13 · HP 78 · Speed 30 (climb)  
**Attack ×2:** Glass Teeth (Dodge, Single, melee) — 12, Exposed. **Traits:** Mimic, Corrosive, Sample (*Bolt + Corrode*). **Tactics:** Looks like a vending machine, a door, or your friend.

**Glasshide** — T5 Brute · Guard 13 · TN 14 · HP 92 · Speed 30  
**Attack:** Crystal Maul (Endure, Single, reach 10 ft) — 19, Prone. **Traits:** Huge, Armored, Vulnerable (Shock). **Tactics:** A bear grown into a cathedral of quartz. Charges the loudest thing.

**Hunter-Killer Unit** — T6 Elite · Guard 14 · TN 14 · HP 106 · Speed 40  
**Attack ×2:** Mono-wire (Dodge, Single, reach 10 ft) or Arc Pistol (Dodge, Single, 60 ft) — 15, Dazed. **Traits:** Shocking, Armored, Sample (*Wave + Shock*). **Tactics:** Ostrander's chrome assassin. Kills the medic first.

**The Drowned Choir** — T8 Controller · Guard 15 · TN 15 · HP 67 · Speed 20 (swim)  
**Attack:** Undertow Song (Resist, Area 30 ft around it) — 9, Shaken. **Traits:** Terrifying, Mutagenic 2, Swarm. **Tactics:** Fifty drowned voices fused into one. Pulls the Shaken toward the water.

### Boss: The Brood Matriarch
**The Brood Matriarch** — T1 Boss · Guard 13 · TN 12 · HP 18 × players · Speed 0 (rooted) → 30 after Shift  
**Actions** (one per Enemy Phase + one Interrupt):
- *Brood-Lash* (Dodge, Single, reach 15 ft) — 7, Held.
- *Screech* (Resist, Area 30 ft around her) — 7, Shaken.
- *Birth:* 2 Spill Rats crawl out of her (max 6 on the field).
**Traits:** Huge, Mutagenic 1, Sample (*Burst + Snare*: "Brood Web").  
**Shift (half HP):** She tears free of the wall. Speed 30, and *Brood-Lash* hits everyone within 15 ft (**Area**).  
**Tactics:** Holds the strongest freelancer, Births when she has fewer than 3 rats, Screeches when 2+ players are near.

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
