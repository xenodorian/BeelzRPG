# 14. Appendix: Arcade vs Tabletop

The [arcade](../arcade/index.html) (*Gauntlet mode*) plays these rules on a battle map, with the computer running the enemies. Almost everything it does is the tabletop rule, read on a grid ([Positioning](06_Combat.md#positioning-theatre-of-the-mind-or-grid)). This appendix lists what it does **differently**, so nobody mistakes a video-game setting for a rule. When the two disagree, **this book wins**.

The full audit (every mechanic checked against the engine and the simulators, 2026-10-29) is in `Current_Work.md`, *Rules Audit*.

## Difficulty Settings (not rules)
- **Party size is the difficulty.** Easy, Medium and Hard field 5, 4 and 3 freelancers.
- **Threat factors.** On top of the book's Hard budget, the arcade multiplies minion budgets and Boss HP by ×1.0 / ×1.22 / ×1.38 (Boss damage by half of that), ramping in over levels 1–3. These are tuned so a whole 20-fight run is winnable but not certain. Use the book's budgets at the table ([Threats](10_Threats.md#5-building-an-encounter)).
- **Mercy.** In standard mode a lost fight can be retried from its start; each retry takes 6% off the enemies' HP and 4% off their damage. There's no tabletop equivalent: at the table, a lost fight is a story event ([Going Down](06_Combat.md#going-down)).
- **GRAFT recovery.** In standard mode a freelancer who dies comes back at the next Lockdown with a permanent Scar or Fault. **Permadeath** mode plays death straight.
- **Fixed rhythm.** Every level is a minion fight, a Breather, a Boss (or centrepiece) fight, a level-up and a Lockdown. Minion fights use one or two creature types from one faction (at most 8 creatures); levels without one of the three Bosses use the closest-rated Elite, Brute, Controller, Artillery or Soldier, scaled like a Boss.

## Automation (the computer plays a part for you)
- **Auto-play** ("Auto this turn", "Auto: rest of round", "Auto-battle") is a computer player. It is not a rule and it's not optimal.
- **Reactions fire on their own** when they help: Bulwark, Threat Sense, Precog (only for big hits), Unbreakable, Reflex Spike, Fortress, Omen, Deadeye, Hair Trigger, Opportunity Strikes. At the table you declare them.
- **Last Gasp** fires automatically the first time you would drop to 0 HP each Lockdown. At the table it's your choice.
- **Choices made for you:** a Splice's Overload keeps the better of the two tables; Bloom Lore rerolls bad results; Hive Mind gives its extra Prime to the ally with the fewest; Puppet picks its own target; Perfect Expression and Echo take the best Surges; Red Mist attacks the nearest creature; the primary node at level-up is picked automatically.
- **Enemy tactics** are a fixed AI ([Running the Game](09_Running_the_Game.md#running-the-enemy-phase) lists the same tendencies as GM defaults). If nobody has been hurt for three rounds, the auto-player stops playing safe and walks in, so fights can't stall.

## Information
- **Enemy stats are visible** (Guard, TN, HP, attacks, ratings). At the table you learn them with Analyze; in the arcade Analyze still matters for Exposed and Weak Spot.
- Dice resolve at once, so there's **no Juice reroll** of a d20. Juice can still set a Sequence die and Shrug a condition.

## Simplifications
- **Initiative** is always the Moxie group check (no ambushes or surprise rounds).
- **Haste** gives the ally one immediate Action (not Unleash) with advantage, but no Move.
- **Mitosis** makes one weapon attack at the end of each of your turns and is destroyed by a failed Dodge (35% of the attacks aimed at you go for it).
- **Scars, Faults and injuries** gained in a fight apply from the next fight.
- **Grapple / Shove** offer Held or Prone (no push).
- **Not modelled:** cover, difficult terrain, elevation, Shaken's "can't move closer", Swarms sharing a square, Spore Cloud's "against attacks from outside" (it just Veils), and these node features: Adaptive, Arc Jump, Wall Run, Many Hands' second grab and Extra Arm's Push. Out-of-combat features (Read the Room, Keen, Uplink's mind-speech, Knacks) have nothing to do in a fight-only game.
- **Every creature fills one square**, Huge ones included.

## The Simulators Behind the Ratings
The Boss and Minion Ratings in [Threats](10_Threats.md) come from `tools/encounter_sim.py`, which plays **without a map**. It abstracts positioning: an enemy Area catches each other freelancer with a fixed chance (30% / 45% / 65% for small / medium / large Areas), 15% of freelancer turns and 10% of enemy actions are spent moving instead of attacking, a Held melee enemy loses half its actions, and Fortress's Area halving is applied half the time. Those are modelling choices for theatre-of-the-mind play, not rules. Checked against the grid (`tools/grid_budget.js`), the budgets hold on a map except for Heavies, which cost ×1¼ on a grid ([Threats §7](10_Threats.md#7-at-the-table)).
