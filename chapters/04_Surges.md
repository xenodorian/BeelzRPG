# 4. Surges & the Sequence

![A Surge](../art/surge.jpg)

Mutagen doesn't take orders well. In a fight, your body offers you a few of its powers at random: a spurt of acid, a crackle of arc-light, a shell that snaps shut. These are **Surges**. They are **optional**. Your weapons and Augments always work; Surges are the big, unreliable spikes on top.

## The Short Version
1. You **build** Surges from parts and write them on your **Sequence** (a numbered list).
2. At the start of each fight you **Prime**: roll your **Sequence die** a few times. The Surges you roll are ready.
3. On your turn you may **Unleash** a Primed Surge as your Action. It costs **Flux**.
4. Want more options? **Churn** as a Quick action to roll again.

---

## Building a Surge
A Surge = **one Shape + one Effect** (+ optional **Twist**). Name it and describe what it looks like. *Bolt + Corrode* might be "Acid Spit" for a Bio freelancer or "Etching Laser" for a Chrome one.

You can use any **base** part, plus parts **unlocked** by trees you have the Root of.

### Shapes (how it's delivered)

| Shape | Unlock | Target | Attack stat | Damage on hit |
|---|---|---|---|---|
| **Strike** | base | One creature in melee reach | Grit or Moxie | (Rank+1)**d10** + stat |
| **Bolt** | base | One creature within 60 ft | Nerve | (Rank+1)**d8** + stat |
| **Burst** | Glands | Everything in a 10-ft radius within 60 ft | Nerve | (Rank+1)**d6** |
| **Wave** | Limbs | 15-ft cone or 30-ft line from you | Grit or Nerve | (Rank+1)**d6** |
| **Pulse** | Hide | Any creatures you choose within 10 ft of you | Grit | (Rank+1)**d6** |
| **Infuse** | base | You or one ally within 30 ft | — (no roll) | Uses an Infuse Effect |

**Area Shapes** (Burst, Wave, Pulse): roll one attack and compare it to each target's Guard. **Hit:** full damage + Effect. **Miss:** half damage, no Effect. Allies in a Burst or Wave are hit too (they roll Dodge against your attack total; success = half damage, no rider).

**Dread** Surges may use **Chutzpah** in place of the listed attack stat.

### Effects (what it does)
**Damage Effects** go with Strike, Bolt, Burst, Wave, or Pulse. The rider applies on a hit (conditions are in [Combat](06_Combat.md#conditions)).

| Effect | Unlock | Damage type | Rider on hit |
|---|---|---|---|
| **Kinetic** | base | Kinetic | +1 damage die, and you may push the target 10 ft |
| **Blaze** | Wiring | Blaze | Burning |
| **Shock** | Wiring | Shock | Dazed |
| **Toxin** | Glands | Toxin | Poisoned |
| **Corrode** | Glands | Corrode | Exposed |
| **Snare** | Limbs | Kinetic | Held |
| **Quake** | Hide | Kinetic | Prone (not Huge) |
| **Glare** | Senses | Blaze | Blinded |
| **Dread** | Mind | Psychic | Shaken |

**Infuse Effects** go only with Infuse. No roll, no miss.

| Effect | Unlock | What happens |
|---|---|---|
| **Mend** | Glands | Target regains (Rank+1)d8 + Gumption HP and ends Burning and Poisoned. A Down target stands up. |
| **Shell** | Hide | Target gains (Rank+1)d6 + Grit temporary HP and +1 Armor until the end of next round. |
| **Haste** | Wiring | An **ally** (not you) immediately takes a Move and one Action (not Unleash), with advantage on any roll that Action needs. |
| **Veil** | Senses | Target is **Veiled** until the end of next round: advantage on defense rolls and on its next attack. |
| **Link** | Mind | Target and up to Rank other allies within 30 ft get advantage on their next d20 roll before the end of next round. |

### Twists (optional, +1 Flux each)
A Surge can carry **one Twist** (two **different** Twists from Rank 3). Each Twist adds **+1 Flux** to its cost. Twists are always available.

| Twist | Works with | Effect |
|---|---|---|
| **Chain** | Strike, Bolt | After resolving, repeat it against a second target within 15 ft of the first for half damage. |
| **Linger** | Burst, Wave, Pulse | The area stays until the end of next round. An enemy that enters it or starts its turn there takes 2 × Rank damage and the rider (no roll). |
| **Leech** | Any damage | Regain HP equal to half the damage dealt to one target. |
| **Overcharge** | Any damage | +2 damage dice. |
| **Sure** | Any | Roll the attack with advantage, or Infuse one extra ally. |
| **Reach** | Any | Double range or area size. Strike reaches 15 ft. |
| **Hush** | Any | Silent and invisible in origin; using it doesn't reveal you or break stealth. |

> **Budget check.** A plain weapon hit at level 1 averages ~7 damage. A Bolt Surge averages ~12 *and* applies a condition. That's the trade: Surges are stronger, but you don't choose which ones you get, and each one pushes you toward Overload.

---

## The Sequence
Your **Sequence** is a numbered list of your Surges. Its size is your **Sequence die**:

| Level | 1 | 2–3 | 4–5 | 6–7 | 8–10 |
|---|---|---|---|---|---|
| **Sequence die** | d4 | d6 | d8 | d10 | d12 |
| **Surges known** | level + 2 (3 at level 1, 12 at level 10) |||||
| **Prime** | 2 at levels 1–4, **3** at levels 5+ |||||

Write your Surges in slots 1, 2, 3... Any slot without a Surge is **Wild** (see below). Because the die grows a step before you learn enough to fill it, you'll usually have one or two Wild slots, until level 10, when your Sequence is full.

You can leave a slot Wild on purpose. When you gain a level, you may **rewrite** one known Surge into a different build.

## Priming
At the start of each combat (after initiative), each freelancer rolls their **Sequence die** once per point of **Prime**. Each result's Surge is **Primed**: ready to Unleash this fight. Mark them.

- **Doubles:** if two dice show the same Surge, it is Primed once and **Amped**: it costs **0 Flux** when Unleashed.
- **Wild:** if a die shows a Wild slot, roll on the **Wild Surge table** right away. That result is Primed. Each Wild die rolls separately; Wild results never count as doubles.
- **Juice:** spend 1 Juice to set one Sequence die to any result before you check for doubles.
- **Chrome Firmware** (see [Augment Trees](03_Augment_Trees.md)) lets you swap one Primed Surge after rolling.

Unused Primed Surges fade when combat ends.

## Unleashing
**Unleash** is an Action. Choose a Primed Surge, pay its **Flux** (1 + 1 per Twist; 0 if Amped), and resolve it. It is no longer Primed.

**Missed?** If a Strike or Bolt Surge misses, the Flux is still paid but the Surge **stays Primed** (still Amped, if it was). Your body tried; it'll try again.

## Churning
**Churn** is a Quick action: gain **1 Flux** and roll your Sequence die once; that Surge is Primed (doubles with an already Primed Surge make it Amped). You **can't Churn on a turn you Unleash** (before or after); a Misfire's free Churn is the only exception. You can't hold more Primed Surges than **Prime + 1**; if you would, choose which to drop.

## Surges Outside Combat
In any tense scene where the GM calls for initiative-style timing (a chase, a heist gone loud), Surges work the same way. In calm scenes you can't Prime; the Mutagen only answers when you're afraid.

---

## Wild Surge Table (d12)
When a Wild slot is Primed, roll here. Unless it says otherwise, it costs 1 Flux to Unleash like any Surge.

| d12 | Wild Surge |
|---|---|
| 1 | **Misfire.** Your body sputters. This slot isn't Primed; instead, immediately Churn once for free (no Flux, no action). |
| 2 | **Spore Bloom.** Burst + Toxin with +2 dice, centred on **you** (you're unaffected). Allies in it roll Dodge. |
| 3 | **Arc Storm.** Bolt + Shock that hits up to three targets at full damage. You are Dazed afterward. |
| 4 | **Hardening.** Shell on you and every ally within 10 ft. Your speed is 0 until your next turn. |
| 5 | **Blood Price.** Strike + Kinetic with +2 more dice. You take Rank d6 damage (ignores Armor). |
| 6 | **Echo.** Unleash a copy of any Surge an ally currently has Primed (it stays Primed for them). |
| 7 | **Mitosis.** A shuddering copy of you appears adjacent. It acts on your turn (Move + one weapon attack, using your numbers). When an enemy attacks it, you roll Dodge for it; any failure destroys it. It melts at the end of combat. |
| 8 | **Phase Step.** Teleport up to 60 ft, then Strike + Kinetic a creature next to you. |
| 9 | **Gravity Knot.** Burst with both Quake and Snare riders. |
| 10 | **Feedback.** Pulse + Dread with a 20-ft radius. Costs 2 Flux. |
| 11 | **Flush.** Costs 0 Flux. Set your Flux to 0 and regain Rank d8 HP. |
| 12 | **Perfect Expression.** Unleash it as a Quick action for 0 Flux: Prime any two of your Surges as Amped (this can exceed your Primed maximum). |

---

## Sample Surges
Steal these, rename them, or build your own.

| Name | Build | Flux | Notes |
|---|---|---|---|
| Mantis Lunge | Strike + Kinetic | 1 | The default "hit it really hard" |
| Acid Spit | Bolt + Corrode | 1 | Opens a target up for the whole team |
| Arc Lash | Wave + Shock (line) | 1 | Dazes a hallway of enemies |
| Firebloom | Burst + Blaze + Linger | 2 | A burning zone that controls space |
| Pin | Strike + Snare | 1 | Stops a runner cold |
| Stomp | Pulse + Quake | 1 | Everything around you falls down |
| Nightmare | Bolt + Dread (Chutzpah) | 1 | Talk-face's attack |
| Flashbulb | Burst + Glare | 1 | Blinds the firing squad |
| Field Dressing | Infuse + Mend | 1 | Your medic's best friend |
| Carapace Flex | Infuse + Shell | 1 | Brace for impact |
| Overdrive Shot | Infuse + Haste | 1 | Give the sniper another turn |
| Vampire Bite | Strike + Toxin + Leech | 2 | Drink their strength |
| Ghost Line | Bolt + Kinetic + Hush | 2 | Silent sniper kill |
| Hive Whisper | Infuse + Link + Sure | 2 | Everyone gets advantage |
