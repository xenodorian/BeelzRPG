# BeelzRPG — MUTAGEN

![Mutagen cover](art/cover.jpg)

**Mutagen** is a tabletop RPG of body-horror, chrome, and bad decisions in the quarantined megacity of Halcyon. No races, no classes: the Mutagen turns you into one of five **Base Forms**, and you grow along its **Augment trees** as flesh (**Bio**) or bolted-on metal (**Chrome**). Twice in your career you **Evolve** into something monstrous. In combat, your body **Surges**: dice pick a few powers from everything you've become, and every one you use pushes you toward **Overload**.

- **One roll:** d20 + Stat (+ Rank) vs a target number. Players roll both attacks *and* defenses.
- **Emotive stats:** **Grit, Moxie, Nerve, Gumption, Chutzpah.**
- **Five Base Forms:** Juggernaut, Skitter, Oracle, Alembic, Siren. Each sets a +3/+2/+1 stat spread and a primary, secondary and tertiary tree.
- **Six 10-node skill trees:** Hide, Limbs, Senses, Glands, Wiring, Mind, plus two Form-exclusive Evolution nodes per Form.
- **Evolutions at levels 4 and 7:** huge stat jumps, +1 Prime, a bigger Sequence die, an always-ready **Signature Surge**, and a new body. Level 10 is your **Final Form**.
- **Surges:** build powers from **Shape + Effect + Twist** parts; your **Sequence die** decides which are ready each fight.
- **Flux & Overload:** power has a price, rolled on the Bloom or Glitch tables.
- **10 missions, 10 levels.**

## Read the Game

| # | Chapter |
|---|---|
| 0 | [Introduction & Setting](chapters/00_Introduction.md) |
| 1 | [Core Rules](chapters/01_Core_Rules.md) |
| 2 | [Character Creation](chapters/02_Character_Creation.md) |
| 2A | [Base Forms & Evolution](chapters/02A_Forms_and_Evolution.md) |
| 3 | [Augment Trees](chapters/03_Augment_Trees.md) · [Hide](chapters/03_Trees/Hide.md) · [Limbs](chapters/03_Trees/Limbs.md) · [Senses](chapters/03_Trees/Senses.md) · [Glands](chapters/03_Trees/Glands.md) · [Wiring](chapters/03_Trees/Wiring.md) · [Mind](chapters/03_Trees/Mind.md) |
| 4 | [Surges & the Sequence](chapters/04_Surges.md) |
| 5 | [Flux & Overload](chapters/05_Flux_and_Overload.md) |
| 6 | [Combat & Conditions](chapters/06_Combat.md) |
| 7 | [Advancement](chapters/07_Advancement.md) |
| 8 | [Gear](chapters/08_Gear.md) |
| 9 | [Running the Game (GM)](chapters/09_Running_the_Game.md) |
| 10 | [Threats](chapters/10_Threats.md) |
| 11 | [Starter Mission: *Pumpstation 9*](chapters/11_Starter_Mission.md) |
| 12 | [Quick Reference](chapters/12_Quick_Reference.md) |
| 13 | [Character Building Guide](chapters/13_Character_Building_Guide.md) |
| — | [Character Sheet (Markdown)](sheets/Character_Sheet.md) · [Printable HTML](sheets/Character_Sheet.html) |
| — | **[Character Builder (web app)](https://xenodorian.github.io/BeelzRPG/builder/)** · [offline file](builder/index.html) |
| — | **[Arcade: Gauntlet mode (web game)](https://xenodorian.github.io/BeelzRPG/arcade/)** · [offline file](arcade/index.html) · [how it works](#arcade-gauntlet-mode) |

**New to the game?** Read chapters 0, 1, 2A and 12, grab a pregen from chapter 11, and play. **Making your own?** Use the [Character Builder](https://xenodorian.github.io/BeelzRPG/builder/) or follow [chapter 13](chapters/13_Character_Building_Guide.md).

## Arcade: Gauntlet mode
**[Play it](https://xenodorian.github.io/BeelzRPG/arcade/)** (or open `arcade/index.html` offline). It's a solo battle simulator built on the real rules: you run a whole party through ten levels of fights back to back.
- **Difficulty is party size:** Easy fields 5 freelancers, Medium 4 and Hard 3. Enemies scale with the rules in ch 10 (the minion budget for the party size, Boss HP and damage × party ÷ 4) plus a threat factor of ×1.25, ×1.6 and ×1.75. On level 1 the extra threat is halved, and on level 2 it's three-quarters.
- **Your party:** start with character creation, then fill each slot.
  - Ways to fill a slot: quick-create (Form, dump, Origin, Kit, Materials, Surges, Knacks), random, a pregen, a character saved in the [Character Builder](builder/index.html), or an imported JSON file.
  - You can save, load, delete, export and import single characters (they share the builder's saved list) and whole named parties.
  - Everyone starts at level 1. Higher-level imports are fitted down.
- **Each level:** a **minion fight** → a **Breather** (half HP, Flux 0) → a **boss fight** → a **level-up** → a **Lockdown** (full HP, injuries cleared, kit restocked).
  - The real Bosses appear at levels 1 (Brood Matriarch), 5 (Warden Krell) and 10 (**Patient Zero**). The other levels use a centrepiece whose Boss Rating matches the level.
- **Combat:** played turn by turn, with every roll shown in the log. The rules covered are:
  - Prime, Amped doubles, the Wild table, Churn, Signatures, Emergence and Final Form;
  - Flux, Overload and the Bloom/Glitch tables;
  - d20 + stat + Rank against Guard, and the player rolling Dodge, Endure or Resist against the enemy's TN;
  - conditions, Down, death marks and injuries;
  - enemy traits (Pack, Heavy areas, Leader, Mender, summons, Shift and so on).
- **Level-up:** the primary node is automatic. You pick the secondary/tertiary nodes, new Surges and Signatures, and Knacks (at 3, 6 and 9). Evolutions come at 4 and 7, and Final Form at 10.
- **Losing:** in standard mode you can retry a lost fight from its start. Each retry wears the enemies down a little (Mercy), and the dead are recovered at the next Lockdown with a permanent Scar or Fault. **Permadeath** mode allows no retries and the dead stay dead.
- Runs autosave and can be resumed. The design notes and simplifications are in [Current_Work.md](Current_Work.md#arcade-gauntlet-mode-arcade).

## Contributing
Start with [Current_Work.md](Current_Work.md): task list, design log, style guide, glossary, and known issues. One chapter per file, so you can work in parallel without conflicts.

*Art in `art/` is AI-generated placeholder art.*
