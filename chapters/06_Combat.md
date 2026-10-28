# 6. Combat

Combat is fast because the GM barely rolls. Players attack enemies' **Guard**; players defend against enemies' **TN**. Enemies move together, so the GM resolves them in one sweep.

## Starting a Fight
1. **Who goes first?**
   - If the freelancers start it (ambush, first shot), **players go first**.
   - If enemies ambush, the group makes a **Nerve** group check (notice) vs the enemies' highest TN. Failure: enemies take a free Enemy Phase first.
   - Otherwise, the group makes a **Moxie** group check vs the enemies' highest TN. Success: players go first. Failure: enemies go first.
2. **Prime.** Every freelancer rolls their Sequence dice ([Surges](04_Surges.md#priming)).
3. Run rounds.

## The Round
Each round has two phases:
1. **Player Phase.** Players take turns in any order they agree on, one at a time.
2. **Enemy Phase.** Every enemy acts. The GM declares each enemy's action; targeted players roll defense.

Then the next round starts. If enemies went first, the round is Enemy Phase then Player Phase.

**Durations.** "Until the end of its next turn" means the end of that creature's next turn. For enemies, their turn is the Enemy Phase. So a condition you put on an enemy during the Player Phase lasts through the coming Enemy Phase.

## Your Turn
On your turn you get a **Move**, an **Action**, and a **Quick action**, in any order. You also get **one Reaction** per round (it refreshes at the start of your turn).

**Move.** Up to your speed (30 ft). Climbing, swimming, crawling, and difficult terrain cost double. Standing from Prone costs half your speed.

### Actions
| Action | What it does |
|---|---|
| **Attack** | Weapon or natural attack: d20 + stat + Rank vs Guard. Damage = **Rank × weapon die + stat**. |
| **Unleash** | Use a Primed Surge ([Chapter 4](04_Surges.md)). |
| **Dash** | Move again. |
| **Brace** | Advantage on all defense rolls until your next turn. |
| **Help** | An ally gets advantage on their next roll before your next turn. Describe how. |
| **Patch** | Use a Medkit charge on a creature you touch: Gumption check, DC 10. Success: it regains **Rank d6 + Gumption** HP (a Down creature stands up). Failure: the charge is still used, but it regains 1 HP. |
| **Analyze** | Gumption + Rank vs a creature's TN. Success: learn its stat block (or one weakness) and it is **Exposed** until the end of its next turn. |
| **Taunt** | Chutzpah + Rank vs a creature's TN. Success: in its next Enemy Phase, it must target you if it can. |
| **Rally** | Chutzpah check, DC 13. Success: every ally who can hear you gains **Rank + Chutzpah** temporary HP. Once per combat per ally. |
| **Grapple / Shove** | Grit + Rank vs Guard. Success: the target is **Held**, or pushed 10 ft, or knocked **Prone** (not Huge). |
| **Other** | Hack a door, haul a lever, run a check. If it takes about 6 seconds, it's an Action. |

### Quick Actions
Draw or stow an item, open a door, drink a stim, speak a few sentences, **Churn**, **Target Lock** (Senses), or anything the rules call Quick.

### Reactions
- **Opportunity Strike:** when an enemy leaves your melee reach, make one weapon attack against it.
- Reactions from Augments (Bulwark, Reflex Spike, Threat Sense, Precog).

## Attacking
Roll **d20 + stat + Rank** against the target's **Guard**.
- **Melee:** Grit (Heavy and power weapons) or Moxie (finesse weapons and claws). See [Gear](08_Gear.md).
- **Ranged:** Nerve. You can shoot to double the listed range with disadvantage. Shooting while an enemy is adjacent to you is at disadvantage.
- **Crit** on a natural 20: roll the damage dice twice.

## Defending
When an enemy attacks you, roll **d20 + defense stat + Rank** against its **TN**. The stat block names the defense:
- **Dodge** (Moxie): claws, bullets, spit, anything you can see coming.
- **Endure** (Grit): gas, blasts, disease, crushing grabs.
- **Resist** (Nerve): fear, psychic attacks, hacking your wetware.

**Single** attacks: success = no damage. **Area** attacks: success = half damage. Failure = full damage plus any rider.

**Enemy Opportunity Strikes.** If you leave an enemy's melee reach on your turn, it gets a free attack on you right then (you defend). Move at half speed to slip away safely.

## Damage
- **Armor** reduces each instance of damage by its value (minimum 1). Armor doesn't reduce Psychic damage or anything that "ignores Armor."
- **Resistance** halves damage of a type; **Vulnerability** doubles it.
- **Temporary HP** soaks damage first and doesn't stack (keep the higher). It fades at the end of combat.
- **Cover:** partial cover gives you +2 to defense rolls (and gives enemies +2 Guard). Full cover means you can't be targeted.
- **Damage types:** Kinetic, Blaze, Shock, Toxin, Corrode, Psychic.

## Conditions
All conditions last **until the end of the affected creature's next turn** unless a rule says otherwise. Reapplying a condition refreshes it; it doesn't stack. **Bosses** end one condition on themselves at the end of every Enemy Phase.

| Condition | Effect |
|---|---|
| **Blinded** | Can't see. Disadvantage on attacks; enemies attacking it have advantage (players: defend with disadvantage). |
| **Burning** | Takes **2 × the source's Rank** Blaze damage at the start of its turn (for enemies: at the start of the Enemy Phase). Spending its Move to roll or douse ends it. |
| **Dazed** | No Reaction or Quick action. A Dazed enemy can't use Specials, and a Dazed Boss gets only one action. |
| **Exposed** | −2 Guard (enemies) or −2 to defense rolls (players). |
| **Held** | Speed 0. Ends early if the holder is moved away, Dazed, or Down. |
| **Poisoned** | Deals half damage. |
| **Prone** | Melee attacks against it have advantage; ranged attacks against it have disadvantage. Standing costs half speed. |
| **Shaken** | Disadvantage on attacks and checks; can't willingly move closer to the source. |
| **Veiled** | Advantage on defense rolls and on its next attack. |
| **Down** | See below. |

> **Enemy advantage → player disadvantage.** Since enemies don't roll, "attacks against a Prone player have advantage" means that player defends with **disadvantage**.

## Going Down
At **0 HP** you are **Down**: fall Prone, drop what you're holding, and you can only crawl 5 ft and speak.
- At the end of each Enemy Phase, roll **Endure (DC 10)**. Failure: mark a **Death mark**. A natural 20: stand up with 1 HP.
- Taking damage while Down marks a Death mark (two on a Crit or failed defense vs a Boss).
- **3 Death marks: you die.**
- Any healing stands you up with that much HP. Death marks clear on a Breather.
- When you go Down, roll on the **Injury** table. Injuries last until your next Lockdown.
- **Last Gasp** ([Chapter 5](05_Flux_and_Overload.md#last-gasp)) can keep you up once per Lockdown.

### Injury Table (d6)
| d6 | Injury (until Lockdown) |
|---|---|
| 1 | **Cracked Ribs.** −5 Max HP. |
| 2 | **Concussion.** Disadvantage on Gumption checks. |
| 3 | **Torn Limb.** Disadvantage on attacks with one chosen limb (your choice: arms or legs → speed −10 ft instead). |
| 4 | **Ruptured Gland / Fried Port.** Your Flux Limit is −2. |
| 5 | **Shell Shock.** Disadvantage on Resist. |
| 6 | **Lucky Break.** Just a scar. No effect. |

## Ending a Fight
Combat ends when one side is gone, flees, or gives up. Unused Primed Surges fade. Enemies at half HP or less with a sense of self-preservation usually try to flee or surrender; at the GM's call, a Chutzpah check can make them.
