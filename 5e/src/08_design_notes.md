# Design Notes

## From Mutagen to 5e

| *Mutagen* | *Mutagen 5e* |
|:--|:--|
| Five Base Forms, no classes | One class, the **Mutant**; the Forms are its subclasses, chosen at 1st level |
| Six Augment trees (Hide, Limbs, Senses, Glands, Wiring, Mind) | Five **Mutation trees** plus the open **Body** list. Limbs, the tree no Form used as primary, was cannibalised: natural weapons, Extra Attack, grappling and movement went into the class chassis and the Body list, so no Form had to be cut |
| Grit, Moxie, Nerve, Gumption, Chutzpah | Str/Con, Dex, Wis, Int, Cha. Surge ability: Con (Juggernaut, Skitter), Wis (Oracle), Int (Alembic), Cha (Siren) |
| Levels 1–10, Rank | Levels 1–20, proficiency bonus; Surge dice 1d8 → 4d8 at the 5/11/17 tier jumps |
| Evolutions at 4 and 7, Final Form at 10 | Evolution I at 6, Evolution II at 14, Final Form at 20 |
| Guard, TN, Dodge/Endure/Resist | AC, save DC, Dexterity/Constitution/Wisdom saves |
| Dazed, Held, Exposed, Burning, Shaken | No reactions, restrained, "next attack has advantage", fire damage next turn, frightened |
| Breather / Lockdown | Short rest / long rest |
| Regenerate (Glands node) | **Regeneration**, a 1st-level class feature for every Mutant |
| Threat level, BR/MR | Challenge rating (DMG method, checked by `tools/bestiary.py`) |

## Balance Targets

The class was built to these targets, drawn from the SRD class analysis (research 01) and homebrew conventions (research 02), and checked with `tools/bench.py` (research 05):

- **Damage:** sustained damage over an adventuring day within ±15% of the SRD martial average at levels 1, 3, 5, 11, 17 and 20; a one-round nova no higher than a Paladin's.
- **Healing:** per long rest, more than a Paladin's *Lay on Hands* and less than a Druid or Life Cleric spending every slot on healing; an Alembic may reach a Druid's level.
- **Resources:** a short-rest pool (Flux) that never runs dry at levels 1–4, plus long-rest Regeneration.
- **Structure:** subclass at 1st, a feature at every level, ASIs at 4/8/12/16/19, Extra Attack at 5, one strong and one weak save, a capstone worth reaching.
