# 3. Augment Trees

![Chrome freelancer](../art/char_chrome.jpg)

Your Augments are what you've done to your body. Your **Base Form** ([chapter 2A](02A_Forms_and_Evolution.md)) decides which **three trees** you grow along: a **primary** tree you master, a **secondary** you lean on, and a **tertiary** you dabble in. There are six trees, and each one is a body system you've rebuilt. Each can be **grown (Bio)** or **installed (Chrome)**.

| Tree | Stat | Role | Unlocks | Primary of | Secondary of | Tertiary of |
|---|---|---|---|---|---|---|
| [**Hide**](03_Trees/Hide.md) | Grit | Tank, protector | Pulse (Shape), Quake, Shell | Juggernaut | Alembic | — |
| [**Limbs**](03_Trees/Limbs.md) | Grit / Moxie | Melee, grappler, mover | Wave (Shape), Snare | — | Juggernaut, Skitter | Siren |
| [**Senses**](03_Trees/Senses.md) | Nerve | Sniper, scout, spotter | Glare, Veil | Oracle | — | Skitter |
| [**Glands**](03_Trees/Glands.md) | Gumption | Chemist, healer, attrition | Burst (Shape), Toxin, Corrode, Mend | Alembic | — | Juggernaut |
| [**Wiring**](03_Trees/Wiring.md) | Moxie | Speed, reflexes, shock | Shock, Blaze, Haste | Skitter | Siren | Oracle |
| [**Mind**](03_Trees/Mind.md) | Chutzpah | Psionics, hacking, control | Dread, Link | Siren | Oracle | Alembic |

## How Trees Work
- **Ten nodes per tree:** a **Root**, four **Tier I** nodes, four **Tier II** nodes, and an **Apex**. A Form's primary tree also holds that Form's two **Evolution nodes**.
- **You only take nodes from your Form's three trees.**
- **Gates:**

| Node | Needs |
|---|---|
| **Root** | Nothing. You take all three Roots at level 1. |
| **Tier I** | The tree's Root |
| **Tier II** | **Level 4+** and **3 nodes** already in that tree |
| **Apex** | **Level 7+**, **6 other nodes** in that tree, and it must be your **primary or secondary** tree |
| **Evolution node** | Your Form, at level 4 (Evolution I) or level 7 (Evolution II). Granted automatically. |

"Nodes in that tree" counts your standard nodes (Root, Tier I, Tier II); **Evolution nodes don't count toward a gate.**

- **Scaling.** Nodes scale with your **Rank**; you never need a "greater" version. A node is taken once.
- **Push.** Some nodes say **Push**: you may gain **1 Flux** to get the extra effect ([Chapter 5](05_Flux_and_Overload.md)).
- **Unlocks.** Each tree unlocks **Surge parts** ([Chapter 4](04_Surges.md)) the moment you take its Root. Since you take all three Roots at level 1, your Form fixes your Surge parts.

## Gaining Nodes

| When | Primary tree | Secondary or tertiary tree |
|---|---|---|
| **Level 1** | **3 nodes** (Root + 2) | **2 nodes** in the secondary (Root + 1) and **1 node** in the tertiary (its Root) |
| **Each level after** | **+1 node, automatically.** You always get it, and you choose which. | **+1 node** in your secondary **or** tertiary tree (your choice) |
| **Level 4 and 7** | **+ your Form's Evolution node** (on top of the pick) | — |

- **Primary tree full?** Its 10 standard nodes fill up at level 8. From level 9, the automatic primary pick **overflows** into your secondary or tertiary tree.
- **Totals:** 2 × level + 4 nodes, plus Evolution nodes: **6 at level 1, 13 at level 4, 20 at level 7, 26 at level 10.**
- **Respec.** When you level up, you may swap one node for another of the same pick type that you qualify for. The clinic rips it out.

## Material: Bio or Chrome
When you take a tree's Root, choose its **Material**: grown or installed. Every node in that tree shares it. Material changes how the tree looks and adds the rules below. *(v0.1 called this "Form"; that word now means your Base Form.)*

| Material | Looks like | Perk | Cost |
|---|---|---|---|
| **Bio** (grown) | Chitin, scales, extra eyes, glands, tentacles, glowing veins | **Knit:** at the end of each combat, and when you take a Breather, regain HP equal to **Rank × your number of Bio trees**. | Your Overloads roll on the **Bloom** table. |
| **Chrome** (installed) | Plates, pistons, optics, ports, wiring, servo-arms | **Firmware:** once per combat, right after you Prime, you may swap one Primed Surge for any Surge you know that uses a part unlocked by one of your Chrome trees (base parts alone don't count). | Your Overloads roll on the **Glitch** table. You roll defense with **disadvantage against Shock** attacks. **Upkeep:** 25 Scrip per Chrome tree each mission (GRAFT prepays your first), or start the mission with +1 Flux per unpaid tree. |
| **Splice** (you have both) | Meat and metal fighting for the same body | Overload: roll on **both** tables, then choose one result. Each tree keeps its own Material rules. | Your Flux Limit is **−1** (after the minimum of 4). |

Your Evolutions follow your Materials: a Bio Juggernaut's Rampart stage grows bone slabs, a Chrome one bolts on bulkheads.

## The Evolution Nodes at a Glance

| Form | Primary tree | Level 4: Evolution I | Level 7: Evolution II |
|---|---|---|---|
| Juggernaut | Hide | **Siege Hide:** +1 Armor, Armor max 6, reach 10 ft, counts as Huge | **Fortress:** allies within 10 ft take half Area damage; take an ally's lethal hit |
| Skitter | Wiring | **Mantis Reflex:** two Reactions per round; Reflex Spike and Opportunity Strikes use full dice | **Lightning Step:** after you Unleash, a half-dice weapon attack as a Quick action |
| Oracle | Senses | **Foresight:** each round, an Omen d20 that can replace any nearby d20 | **Thousand Eyes:** Target Lock ×3, no surprise or Blindness nearby, wider Crits |
| Alembic | Glands | **Transmute:** Toxin/Corrode riders apply Poisoned *and* Exposed; healing +Gumption | **Panacea:** once per combat, heal the whole party and end their conditions |
| Siren | Mind | **Siren Song:** a Quick mass Taunt that sends enemies at you or an ally you name, at −2 TN | **Crown of Will:** once per combat, a non-Boss fights for you |

## Building With Trees
Your Form decides your trees, but which nodes you take decides your role.

| Form | Leans toward… | …or toward |
|---|---|---|
| **Juggernaut** | Doorway-holder: Plating, Menace, Living Wall, Bulwark | Brawler: Limbs Crusher Grip, Rend, Flurry |
| **Skitter** | Duelist: Capacitor, Reflex Spike, Kinetic Battery | Runner and skirmisher: Slipstream, Arc Jump, Spring Legs, Pounce |
| **Oracle** | Sniper: Target Lock, Long Sight, Deadeye | Spotter: Analyzer, Weak Spot, Spotter, Precog |
| **Alembic** | Medic: Stim Gland, Antibodies, Living Pharmacy | Poisoner: Spit, Catalyst, Spore Cloud, Burst Surges |
| **Siren** | Commander: Commanding Voice, Hive Mind, Haste Surges | Controller: Puppet, Psychic Scream, Snare Waves |
