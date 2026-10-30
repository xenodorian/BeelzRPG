# Research 2: How Homebrew Classes Are Written

**Purpose.** Homebrew classes that people actually adopt look and read like the official ones. This note collects the format conventions (document layout, class table, feature wording, subclass rhythm) and the community's balance checklists, with sources, and states the conventions *Mutagen 5e* follows.

## 1. Sources consulted (accessed 2026-10-30)

| Source | What it contributes |
|---|---|
| SRD 5.1 class chapters ([`../srd/02_Classes/`](../srd/02_Classes/)) | The reference layout every homebrew copies |
| Black Citadel RPG, *How to Make a Homebrewed Character Class for DnD 5e* — https://blackcitadelrpg.com/homebrewed-character-class-5e/ | Process: core concept → party role → martial/half/full-caster template → Core/Strength/Flavor features → capstone → subclasses → proficiencies and equipment → playtest |
| James Musicus, *Guidelines to Homebrewing Classes in D&D 5e* (r/DnD, 2014) — https://www.reddit.com/r/DnD/comments/2lndfs/5e_homebrew_class_guidelines/ | The "Core / Strength / Flavor" feature taxonomy; "every level gains something" (comment by u/grimmlingur) |
| *Class Design 101* (r/DnD and GM Binder) — https://www.reddit.com/r/DnD/comments/73seey/class_design_101_a_fundamental_guide_to_5th/ , https://www.gmbinder.com/share/-MswLq0pEXYVpWUSzd60 | Dead-level rule, a **point evaluation** of the chassis (target 20–25 points), a balance questionnaire, a class checklist |
| Apothecary Press, *Design Insights: Power Budget* — https://apothecary.press/2021/12/20/design-insights-power-budget/ | ~50% of a class's power in tier 1, ~20% in tier 2; a power spike at 5, 11 (and 10), 17; subclass carries more or less of the budget per class |
| D&D Beyond, *Making Homebrew Subclasses Publishable* — https://dndbeyond-support.wizards.com/hc/en-us/articles/7747240870036-Subclasses-Tutorial | Subclass features go in the class's feature gaps (e.g. Fighter 3/7/10/15/18, Rogue 3/9/13/17, 2024 Barbarian 3/6/10/14) |
| D&D Beyond, *New Player's Guide: How to Homebrew* — https://www.dndbeyond.com/posts/845-new-players-guide-how-to-homebrew-on-d-d-beyond | Write the subclass as a list of level slots first, each tied to a one-sentence theme; compare to same-level features |
| Wizards of the Coast, *Unearthed Arcana: Class Design Variants* (2015) — https://media.wizards.com/2015/downloads/dnd/UA3_ClassDesignVariants.pdf | Official guidance: start from the story, reuse existing mechanics where they fit, compare each feature to others at the same level |
| Dungeon Master's Vault, *How To: Homebrew Class Creation* — https://www.dungeonmastersvault.com/help/how-to-homebrew-class-creation/ | Builder fields: subclass level and title, ASI levels (default 4, 8, 12, 16, 19), "selections" (menus like invocations) vs fixed features |
| The Homebrewery (naturalcrit) snippets and changelog — https://github.com/naturalcrit/homebrewery/blob/master/changelog.md ; GM Binder styling reference — https://www.gmbinder.com/share/-NALi9USK9p9WxJS6lXu ; *Migrating to GM Binder* — https://www.gmbinder.com/share/-KxBTT27RJchekbKQc4k | The visual conventions: two-column pages, framed `classTable`, note and descriptive boxes, stat blocks, coloured table striping, `\page` / `\pagebreak` |
| r/DnDHomebrew, *Making a custom class* — https://www.reddit.com/r/DnDHomebrew/comments/op819p/making_a_custom_class/ | Pre-checks: does it already exist, is it really a subclass, does it step on another class's toes, MAD vs SAD |

## 2. Document layout (the de-facto standard)

Almost every published homebrew class (and every SRD class) runs in this order:

1. **Title and flavour opening**: two or three short in-world vignettes, then "Creating a [Class]" (concept, quick build: which ability is highest, which background).
2. **Class table** (framed `classTable` in Homebrewery): *Level · Proficiency Bonus · Features* plus one column per scaling number (Sneak Attack, Ki Points, Rages, Invocations Known, slots).
3. **Class Features** block:
   - **Hit Points**: *Hit Dice: 1d10 per [class] level · Hit Points at 1st Level: 10 + your Constitution modifier · Hit Points at Higher Levels: 1d10 (or 6) + your Constitution modifier per [class] level after 1st.*
   - **Proficiencies**: Armor, Weapons, Tools, Saving Throws, Skills ("Choose two from…").
   - **Equipment**: "(a) … or (b) …" choices, "in addition to the equipment granted by your background".
4. **Features in level order**, each as a `####`-level heading; text written in second person, present tense, with the level in the first sentence for anything after 1st ("Starting at 5th level, you…", "Beginning at 11th level…").
5. **Subclass header** ("Primal Paths", "Sacred Oaths") with one sentence on what the choice means, then each subclass with its features in level order.
6. **Option menus** (invocations, maneuvers, Metamagic) at the end of the class, alphabetical, each with prerequisites in italics: *Prerequisite: 5th level, Pact of the Blade feature.*
7. **Multiclassing**: prerequisite ability scores and the proficiencies gained.
8. Back matter: spell lists, new spells, feats, magic items, monsters, credits and licence.

**Wording conventions** (SRD style):
- Uses and recovery always in the same shape: *"Once you use this feature, you can't use it again until you finish a short or long rest."* Or a count: *"You can use this feature a number of times equal to your [ability] modifier (minimum of once). You regain all expended uses when you finish a long rest."*
- Save DCs written as a formula once: *"[Feature] save DC = 8 + your proficiency bonus + your Constitution modifier."*
- Action economy stated first: *"As a bonus action, you can…"*, *"When a creature you can see hits you with an attack, you can use your reaction to…"*.
- Conditions in lower case and named exactly as in the SRD (*frightened*, *restrained*, *prone*, *poisoned*, *blinded*); damage types exactly (*lightning*, *thunder*, *force*, *acid*, *psychic*).
- No new conditions if an SRD one fits; no new damage types.
- Features scale with level in a table column or a sentence ("This damage increases to 2d8 at 5th level…").

## 3. Structural rules of thumb

| Rule | Source | Our decision |
|---|---|---|
| ASIs at 4, 8, 12, 16, 19 | SRD; DM's Vault default | Same |
| Proficiency bonus +2→+6 by level | SRD | Same |
| Tier spikes at 5 (Extra Attack or 3rd-level spells), 11, 17; capstone at 20 | SRD; Power Budget | Extra Attack at 5; bigger Surge dice at 5, 11, 17; Final Form at 20 |
| No dead levels: every level gives a feature, an improvement or a menu pick | Class Design 101; Musicus thread | Every Mutant level has a feature or a new Mutation/Surge |
| ~50% of power in tier 1 | Power Budget | Core features (Surges, Flux, Regeneration, Form) all at 1–3, but not so front-loaded that a 1–2 level dip is the best use (see below) |
| Subclass features fill the class's gaps | D&D Beyond | Form at 1st; Form features at 1, 3, 6, 10, 14, 18 (an Evolution feature at 6 and 14) |
| Menus for non-casters ("selections") | Warlock invocations, Battle Master maneuvers; DM's Vault | **Mutations**: a menu with tree and level prerequisites |
| Strong + weak saving throw | SRD (all classes) | Constitution (strong) + Strength (weak) |
| Avoid multiclass-dip abuse (front-loaded armour, healing, damage at 1–2) | r/dndnext multiclassing thread; Class Design 101 "multiclass potential" | Medium armour and shields only; Regeneration's healing pool scales with Mutant level; multiclassing into Mutant grants light armour only |
| Point evaluation: 20–25 points for the chassis | Class Design 101 | Scored in Research 5 |
| Compare each feature to same-level features of other classes | UA Class Design Variants; DMG advice quoted by D&D Beyond | Done per feature in Research 5 |

## 4. Visual style (for the PDF)

Homebrewery/GM Binder "PHB look", which players recognise:
- Letter pages, **two columns**, serif body (Bookinsanity/Book Antiqua style), small-caps red-brown headings (Mr Eaves style), a gold rule under `###` headings.
- Framed **class table** spanning one column (or the page when wide), alternating row tint (`#e0e5c1` on parchment).
- **Note boxes** (green-tinted, for rules notes), **descriptive boxes** (read-aloud flavour), **stat blocks** (tan background, orange-red rules, the SRD monster layout: AC, HP, Speed, ability row, saves/skills/senses/languages/CR, traits, Actions).
- Page footer with page number and section name; art at the top or bottom of columns.

*Mutagen 5e* follows the layout with our own palette (biotech green on parchment instead of red) so it reads as homebrew rather than an imitation of official books, and with fonts that ship with the box (DejaVu/Liberation).

## 5. Pre-design questionnaire (Class Design 101), answered up front

- **Is it the best at something?** Self-sustaining front-liner: it heals itself and others without spells and adapts mid-fight. It pays with no spellcasting, randomness in which Surges are cheap, and Overload risk.
- **Worst at something?** Utility magic (no rituals, no teleport, no resurrection) and social skills unless built as a Siren.
- **Why pick it over a Paladin, Barbarian or Druid?** It's the only class whose powers are built from parts (Shape + Effect), drawn at random each fight, and whose body visibly changes at 6th, 14th and 20th level.
- **Why pick another class?** If you want reliable spells, pure skills (Rogue/Bard) or the strongest auras (Paladin).
- **Could multiclassing make it?** Not cleanly: Barbarian/Druid gets the body, not the Surge-building or the Flux push-your-luck.
- **Should it be a subclass?** No: it needs its own resource and menu (Surges, Mutations, Flux), like the Monk or Warlock, and its five Forms differ as much as Barbarian paths.
