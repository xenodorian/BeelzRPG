#!/usr/bin/env python3
"""Mutagen 5e bestiary: stat-block data, DMG-method CR check, Markdown output.

Run: python3 5e/tools/bestiary.py            -> writes 5e/src/07_bestiary.md, prints a CR audit
     python3 5e/tools/bestiary.py --check    -> exit 1 if a listed CR is more than 1 step from the computed CR

CR method (DMG ch. 9 "Creating a Monster"): defensive CR from effective HP, shifted one step per 2 points of AC
above/below the table; offensive CR from damage per round (average of the first three rounds), shifted one step per
2 points of attack bonus or save DC; final CR = mean of the two. Effective HP adds resistance multipliers, 3 rounds of
regeneration and legendary resistances; DPR adds legendary actions.
"""
import math, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CRS = ['0', '1/8', '1/4', '1/2'] + [str(i) for i in range(1, 31)]
#            CR    AC  HPmax  ATK  DPRmax DC
TABLE = [('0', 13, 6, 3, 1, 13), ('1/8', 13, 35, 3, 3, 13), ('1/4', 13, 49, 3, 5, 13), ('1/2', 13, 70, 3, 8, 13),
         ('1', 13, 85, 3, 14, 13), ('2', 13, 100, 3, 20, 13), ('3', 13, 115, 4, 26, 13), ('4', 14, 130, 5, 32, 14),
         ('5', 15, 145, 6, 38, 15), ('6', 15, 160, 6, 44, 15), ('7', 15, 175, 6, 50, 15), ('8', 16, 190, 7, 56, 16),
         ('9', 16, 205, 7, 62, 16), ('10', 17, 220, 7, 68, 16), ('11', 17, 235, 8, 74, 17), ('12', 17, 250, 8, 80, 17),
         ('13', 18, 265, 8, 86, 18), ('14', 18, 280, 8, 92, 18), ('15', 18, 295, 8, 98, 18), ('16', 18, 310, 9, 104, 18),
         ('17', 19, 325, 10, 110, 19), ('18', 19, 340, 10, 116, 19), ('19', 19, 355, 10, 122, 19), ('20', 19, 400, 10, 140, 19),
         ('21', 19, 445, 11, 158, 20), ('22', 19, 490, 11, 176, 20), ('23', 19, 535, 11, 194, 20), ('24', 19, 580, 12, 212, 21)]
XP = {'0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800, '6': 2300, '7': 2900,
      '8': 3900, '9': 5000, '10': 5900, '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000, '16': 15000,
      '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000, '23': 50000, '24': 62000}
PB = lambda cr: 2 if CRS.index(cr) <= CRS.index('4') else 2 + (int(cr) - 1) // 4

def avg(expr):
    m = re.fullmatch(r'(\d+)d(\d+)\s*([+-]\s*\d+)?', expr.replace(' ', ''))
    n, d, k = int(m.group(1)), int(m.group(2)), int((m.group(3) or '0').replace(' ', ''))
    return n * (d + 1) // 2 + k

def idx_hp(hp):
    for i, r in enumerate(TABLE):
        if hp <= r[2]: return i
    return len(TABLE) - 1
def idx_dpr(d):
    for i, r in enumerate(TABLE):
        if d <= r[4] + 0.5: return i
    return len(TABLE) - 1
def resist_mult(i):
    cr = TABLE[i][0]; n = CRS.index(cr)
    return 2 if n <= CRS.index('4') else 1.5 if n <= CRS.index('10') else 1.25 if n <= CRS.index('16') else 1
def lr_hp(i):
    n = CRS.index(TABLE[i][0])
    return 10 if n <= CRS.index('4') else 20 if n <= CRS.index('10') else 30 if n <= CRS.index('16') else 50

def compute(m):
    hp = avg(m['hp'])
    i = idx_hp(hp)
    if m.get('bps'): i = idx_hp(hp * resist_mult(i))
    ehp = hp * (resist_mult(i) if m.get('bps') else 1) + 3 * m.get('regen', 0) + m.get('lr', 0) * lr_hp(i)
    di = idx_hp(ehp)
    di = max(0, min(len(TABLE) - 1, di + int((m['ac_eff'] if 'ac_eff' in m else m['ac']) - TABLE[di][1]) // 2))
    oi = idx_dpr(m['dpr'])
    if 'atk' in m: oi = max(0, min(len(TABLE) - 1, oi + int((m['atk'] - TABLE[oi][3]) / 2)))
    else: oi = max(0, min(len(TABLE) - 1, oi + int((m['dc'] - TABLE[oi][5]) / 2)))
    fi = (di + oi) / 2
    fi = math.floor(fi + 0.5)
    return TABLE[di][0], TABLE[oi][0], TABLE[fi][0], ehp

def mod(s): return (s - 10) // 2
def sgn(n): return '+%d' % n if n >= 0 else '%d' % n

M = []
def mon(**k): M.append(k)

# ---------------------------------------------------------------- Base stage (CR 1/4 - 4)
mon(name='Spill Rats', stage='Base', size='Medium swarm of Tiny beasts', align='unaligned', ac=12, acn='', hp='7d8',
    speed='30 ft., climb 30 ft.', ab=(9, 14, 10, 2, 12, 4), skills='Perception +3', res='bludgeoning, piercing, slashing',
    cimm='charmed, frightened, grappled, paralyzed, petrified, prone, restrained, stunned', senses='darkvision 30 ft., passive Perception 13',
    lang='—', cr='1/2', bps=True, dpr=9.5, atk=4, sample='Strike + Toxin',
    traits=[('Swarm', 'The swarm can occupy another creature\'s space and vice versa, and it can move through any opening large enough for a Tiny rat. It can\'t regain hit points or gain temporary hit points.'),
            ('Mutagenic', 'A creature that starts its turn in the swarm\'s space must succeed on a DC 11 Constitution saving throw or gain 1 Flux (a Mutant) or become poisoned until the start of its next turn (anyone else).')],
    actions=[('Bites', '*Melee Weapon Attack:* +4 to hit, reach 0 ft., one target in the swarm\'s space. *Hit:* 7 (2d6) piercing damage plus 2 (1d4) poison damage, or 3 (1d6) piercing damage plus 2 (1d4) poison damage if the swarm has half of its hit points or fewer.')],
    flavor='Hairless, glowing, wrong number of legs. They pour out of pipes in fours or more and all bite the same freelancer.')
mon(name='Scrapjack Picker', stage='Base', size='Medium humanoid (Mutant)', align='chaotic neutral', ac=14, acn='scrap armor', hp='5d8+5',
    speed='40 ft.', ab=(10, 15, 12, 10, 11, 9), skills='Perception +2, Sleight of Hand +4, Stealth +4', senses='passive Perception 12',
    lang='Common, Scrapjack cant', cr='1/2', dpr=6.5, atk=5,
    traits=[('Pack Tactics', 'The picker has advantage on an attack roll against a creature if at least one of the picker\'s allies is within 5 feet of the creature and the ally isn\'t incapacitated.'),
            ('Magnet Gloves', 'The picker has advantage on checks to disarm a creature or steal an item, and on attacks against a creature wearing metal armor.')],
    actions=[('Hook-Blade', '*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 6 (1d8 + 2) slashing damage.'),
             ('Rivet Gun', '*Ranged Weapon Attack:* +4 to hit, range 30/120 ft., one target. *Hit:* 6 (1d8 + 2) piercing damage.')],
    flavor='Scavengers in welded scrap armour. They gang up on whoever has visible chrome and scatter when two are down.')
mon(name='Ward Tough', stage='Base', size='Medium humanoid (any)', align='any alignment', ac=12, acn='leather armor', hp='6d8+12',
    speed='30 ft.', ab=(15, 12, 14, 9, 10, 10), skills='Athletics +4, Intimidation +2', senses='passive Perception 10',
    lang='Common', cr='1/2', dpr=9, atk=4,
    traits=[('Cowardly', 'While the tough has half of its hit points or fewer, it surrenders at the start of its turn on a d6 roll of 4–6 if it can see an enemy.')],
    actions=[('Multiattack', 'The tough makes two attacks with its pipe or pistol.'),
             ('Pipe', '*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 5 (1d6 + 2) bludgeoning damage.'),
             ('Pistol', '*Ranged Weapon Attack:* +3 to hit, range 30/120 ft., one target. *Hit:* 5 (1d8 + 1) piercing damage.')],
    flavor='Waders, a rebar club and a family to feed. He wants to be paid, not killed.')
mon(name='Bloomhound', stage='Base', size='Medium monstrosity', align='unaligned', ac=13, acn='natural armor', hp='5d8+10',
    speed='50 ft.', ab=(15, 14, 14, 3, 12, 6), skills='Perception +3', senses='darkvision 60 ft., passive Perception 13',
    lang='—', cr='1/2', dpr=11, atk=5, sample='Strike + Snare',
    traits=[('Pack Tactics', 'The bloomhound has advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally isn\'t incapacitated.'),
            ('Frenzy', 'The bloomhound deals an extra 2 damage with its attacks for each bloomhound that has died within 60 feet of it this combat (maximum +4).')],
    actions=[('Split-Jaw', '*Melee Weapon Attack:* +4 to hit, reach 5 ft., one target. *Hit:* 9 (2d6 + 2) piercing damage, and the target is grappled (escape DC 12). Until the grapple ends, the bloomhound can\'t bite another target.')],
    flavor='A dog that opens like a flower. One holds, the rest bite.')
mon(name='Turret Drone', stage='Base', size='Small construct', align='unaligned', ac=15, acn='plating', hp='6d6+6',
    speed='0 ft., fly 30 ft. (hover)', ab=(6, 16, 12, 3, 12, 1), imm='poison', cimm='charmed, exhaustion, frightened, poisoned',
    senses='darkvision 60 ft., passive Perception 11', lang='—', cr='1/2', dpr=9, dc=12,
    traits=[('Explosive', 'When the drone drops to 0 hit points, it explodes. Each creature within 10 feet of it must make a DC 12 Dexterity saving throw, taking 7 (2d6) fire damage on a failure or half as much on a success.')],
    actions=[('Flechette Spray', 'The drone fires into a 10-foot-radius sphere centred on a point it can see within 90 feet. Each creature in it must make a DC 12 Dexterity saving throw, taking 9 (2d8) piercing damage on a failure or half as much on a success.')],
    flavor='A coffee-can drone with a shotgun. It hovers out of reach and fires into clusters.')
mon(name='Ostrander Cleaner', stage='Base', size='Medium humanoid (human)', align='lawful neutral', ac=16, acn='chain shirt, riot shield', hp='7d8+14',
    speed='30 ft.', ab=(14, 13, 14, 10, 12, 10), saves='Con +4', skills='Perception +3', res='poison', senses='passive Perception 13',
    lang='Common', cr='1', dpr=14, atk=5,
    traits=[('Shield Wall', 'The cleaner gains +1 AC for each other cleaner within 5 feet of it (maximum +2).'),
            ('Hazmat Suit', 'The cleaner has advantage on saving throws against inhaled poisons, gases and the Mutagenic trait.')],
    actions=[('Purge Rifle', '*Ranged Weapon Attack:* +5 to hit, range 120/400 ft., one target. *Hit:* 8 (1d10 + 3) piercing damage. If the target is a Mutant, it loses one Primed Surge (its choice).'),
             ('Foam Sprayer (Recharge 5–6)', 'The cleaner sprays a 15-foot cone. Each creature in it must make a DC 12 Dexterity saving throw. On a failure, it takes 10 (3d6) cold damage and is restrained until the end of its next turn; on a success, it takes half as much damage and isn\'t restrained.')],
    flavor='Hazmat suit, antimutagen rifle, no face. They advance in pairs behind riot shields and foam anyone mid-Surge.')
mon(name='Sporecaller', stage='Base', size='Medium humanoid (Mutant)', align='chaotic neutral', ac=12, acn='', hp='11d8+22',
    speed='30 ft.', ab=(10, 14, 14, 11, 16, 14), saves='Wis +5', skills='Medicine +4, Religion +2', imm='poison', cimm='poisoned',
    senses='passive Perception 12', lang='Common', cr='1', dpr=13, dc=13, sample='Burst + Toxin',
    traits=[('Hymn of the Bloom', 'Allies of the sporecaller within 30 feet of it deal an extra 2 (1d4) damage with their weapon attacks while it isn\'t incapacitated.')],
    actions=[('Spore Hymn', 'Each creature of the sporecaller\'s choice in a 20-foot-radius sphere centred on a point within 60 feet must make a DC 13 Constitution saving throw. On a failure, it takes 7 (2d6) poison damage and is poisoned until the end of its next turn; on a success, it takes half as much damage.'),
             ('Knit Wounds', 'One creature the sporecaller can see within 30 feet regains 11 (2d8 + 2) hit points.')],
    flavor='A Bloom priest with a mouth full of flowers. It stays behind its flock, sings and knits their wounds shut.')
mon(name='Drain Beast', stage='Base', size='Huge monstrosity', align='unaligned', ac=13, acn='natural armor', hp='10d12+30',
    speed='30 ft., swim 40 ft.', ab=(19, 10, 16, 2, 10, 5), skills='Stealth +2', senses='darkvision 60 ft., passive Perception 10',
    lang='—', cr='3', dpr=18, atk=6, regen=5,
    traits=[('Hold Breath', 'The beast can hold its breath for 30 minutes.'), ('Regeneration', 'The beast regains 5 hit points at the start of its turn unless it took acid or fire damage since its last turn.')],
    actions=[('Bite', '*Melee Weapon Attack:* +6 to hit, reach 10 ft., one target. *Hit:* 15 (2d10 + 4) piercing damage, and the target is grappled (escape DC 14). Until the grapple ends, the target is restrained and the beast can\'t bite another target.'),
             ('Tail Thrash (Recharge 5–6)', 'Each creature within 20 feet of the beast, friend or foe, must make a DC 14 Dexterity saving throw, taking 17 (3d8 + 4) bludgeoning damage on a failure or half as much on a success.')],
    flavor='A drowned bull crocodile the size of a bus. It thrashes when surrounded and drags one victim under when not.')
mon(name='Boiler Hulk', stage='Base', size='Large construct', align='unaligned', ac=15, acn='riveted plate', hp='9d10+36',
    speed='30 ft.', ab=(20, 8, 18, 5, 8, 5), imm='fire, poison', cimm='charmed, exhaustion, frightened, poisoned', senses='passive Perception 9',
    lang='understands Common but can\'t speak', cr='4', dpr=28, atk=7,
    traits=[('Heated Body', 'A creature that touches the hulk or hits it with a melee attack while within 5 feet of it takes 3 (1d6) fire damage.')],
    actions=[('Multiattack', 'The hulk makes two Furnace Fist attacks.'),
             ('Furnace Fist', '*Melee Weapon Attack:* +7 to hit, reach 5 ft., one target. *Hit:* 14 (2d8 + 5) bludgeoning damage plus 3 (1d6) fire damage.'),
             ('Steam Vent (Recharge 5–6)', 'Each creature within 20 feet of the hulk, friend or foe, must make a DC 14 Constitution saving throw, taking 21 (6d6) fire damage on a failure or half as much on a success. The hulk can\'t use Furnace Fist on its next turn.')],
    flavor='A walking furnace bolted onto a press-ganged diver. It wades into the middle of the party and vents.')

# ---------------------------------------------------------------- Evolution I stage (CR 3 - 9)
mon(name='Cleaner Hound', stage='Evolution I', size='Medium construct', align='unaligned', ac=15, acn='plating', hp='8d8+16',
    speed='50 ft.', ab=(16, 15, 14, 3, 13, 1), skills='Perception +3', imm='poison', cimm='charmed, frightened, poisoned',
    senses='darkvision 60 ft., passive Perception 13', lang='—', cr='2', dpr=17, atk=5,
    traits=[('Pack Tactics', 'The hound has advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally isn\'t incapacitated.'),
            ('Mutagen Scent', 'The hound has advantage on Wisdom (Perception) checks to find Mutants and always knows which creature within 60 feet last Unleashed a Surge.')],
    actions=[('Injector Bite', '*Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 10 (2d6 + 3) piercing damage plus 7 (2d6) poison damage. If the target is a Mutant, it loses one Primed Surge (its choice).')],
    flavor='Ostrander\'s chrome dogs. They run in threes and chase whoever just Surged.')
mon(name='Damper Drone', stage='Evolution I', size='Medium construct', align='unaligned', ac=15, acn='plating', hp='13d8+26',
    speed='0 ft., fly 30 ft. (hover)', ab=(8, 14, 14, 6, 14, 3), imm='poison', cimm='charmed, frightened, poisoned',
    senses='darkvision 60 ft., passive Perception 12', lang='—', cr='2', dpr=18, dc=14,
    traits=[('Damper Field', 'Each Unleash by a Mutant within 60 feet of the drone raises their Flux by 1 more. A spellcaster within 60 feet must succeed on a DC 14 Constitution save to cast a spell of 1st level or higher; on a failure the action is lost but the slot isn\'t.')],
    actions=[('Null Pulse', 'The drone pulses a 10-foot-radius sphere centred on a point within 60 feet. Each creature in it must make a DC 14 Wisdom saving throw, taking 18 (4d8) force damage and being unable to take reactions until the start of its next turn on a failure, or half damage on a success.')],
    flavor='A floating antimutagen censer. It hangs back over the Ostrander line.')
mon(name='Bloom Knight', stage='Evolution I', size='Medium plant', align='lawful neutral', ac=17, acn='bark plate', hp='12d8+48',
    speed='30 ft.', ab=(18, 10, 18, 9, 14, 12), saves='Str +7, Con +7', res='poison', senses='tremorsense 30 ft., passive Perception 12',
    lang='Common', cr='5', dpr=31, atk=7, regen=5, sample='Strike + Toxin',
    traits=[('Regrowth', 'The knight regains 5 hit points at the start of its turn unless it took fire damage since its last turn.'), ('Rooted Stance', 'The knight can\'t be moved or knocked prone against its will while it is on soil or plants.')],
    actions=[('Multiattack', 'The knight makes two Thorn Glaive attacks.'),
             ('Thorn Glaive', '*Melee Weapon Attack:* +7 to hit, reach 10 ft., one target. *Hit:* 10 (1d12 + 4) slashing damage plus 4 (1d8) poison damage, and the target must succeed on a DC 15 Constitution saving throw or be poisoned until the end of its next turn.')],
    flavor='A holy warrior grown from a single rosebush. It stands in front of Sporecallers and never retreats.')
mon(name='Glasshide', stage='Evolution I', size='Huge monstrosity', align='unaligned', ac=17, acn='natural armor', hp='14d12+56',
    speed='30 ft.', ab=(21, 9, 19, 3, 11, 6), saves='Con +7', vuln='lightning, thunder', res='bludgeoning, piercing and slashing from nonmagical attacks',
    senses='darkvision 60 ft., passive Perception 10', lang='—', cr='8', bps=True, dpr=40, atk=8, sample='Pulse + Quake',
    traits=[('Territorial', 'If another glasshide is within 120 feet, at the start of its turn roll a d6: on a 1–4, it attacks that glasshide instead of anything else.'), ('Crystal Body', 'A creature that hits the glasshide with a melee attack while within 5 feet takes 3 (1d6) slashing damage.')],
    actions=[('Multiattack', 'The glasshide makes two Crystal Maul attacks.'),
             ('Crystal Maul', '*Melee Weapon Attack:* +8 to hit, reach 10 ft., one target. *Hit:* 16 (2d10 + 5) bludgeoning damage. A Large or smaller target must succeed on a DC 16 Strength saving throw or be knocked prone.'),
             ('Shatter Roar (Recharge 5–6)', 'Each creature within 20 feet of the glasshide, friend or foe, must make a DC 15 Constitution saving throw, taking 36 (8d8) thunder damage on a failure or half as much on a success.')],
    flavor='A bear grown into a cathedral of quartz. It charges the loudest thing in the room.')
mon(name='Hunter-Killer Unit', stage='Evolution I', size='Medium construct', align='lawful evil', ac=18, acn='plating', hp='22d8+66',
    speed='40 ft.', ab=(16, 20, 16, 14, 14, 6), saves='Dex +8, Con +6', skills='Perception +5, Stealth +8', res='lightning', imm='poison', cimm='charmed, frightened, poisoned',
    senses='darkvision 120 ft., passive Perception 15', lang='Common', cr='8', dpr=48, atk=8,
    traits=[('Hunter Protocol', 'The unit has advantage on attack rolls against a creature that has half its hit points or fewer.'), ('Evasion', 'If the unit is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, it instead takes no damage if it succeeds and half if it fails.')],
    actions=[('Multiattack', 'The unit makes three attacks with its mono-wire or arc pistol, in any combination.'),
             ('Mono-Wire', '*Melee Weapon Attack:* +8 to hit, reach 10 ft., one target. *Hit:* 16 (2d10 + 5) slashing damage.'),
             ('Arc Pistol', '*Ranged Weapon Attack:* +8 to hit, range 60/120 ft., one target. *Hit:* 16 (2d10 + 5) lightning damage, and the target can\'t take reactions until the start of its next turn.')],
    reactions=[('Countermeasure', 'When a creature within 60 feet Unleashes a Surge or casts a spell, the unit makes one Arc Pistol attack against it.')],
    flavor='Ostrander\'s chrome assassin. It kills the medic first.')

# ---------------------------------------------------------------- Evolution II stage (CR 10+)
mon(name='Feral Evolved', stage='Evolution II', size='Large aberration (Mutant)', align='chaotic neutral', ac=17, acn='natural armor', hp='18d10+108',
    speed='40 ft., climb 40 ft.', ab=(22, 16, 22, 8, 14, 10), saves='Str +10, Con +10', skills='Athletics +10, Perception +6', res='acid, fire, poison',
    senses='darkvision 120 ft., passive Perception 16', lang='understands Common', cr='12', dpr=70, atk=10, regen=10, sample='Strike + Kinetic',
    traits=[('Regeneration', 'The evolved regains 10 hit points at the start of its turn if it has at least 1 hit point.'),
            ('Shift (1/Day)', 'The first time the evolved drops to half its hit points or fewer, it stops at exactly half, ends every condition on itself, and each creature within 30 feet must succeed on a DC 17 Wisdom saving throw or be frightened of it for 1 minute (save ends at end of each turn). Its claws deal an extra 9 (2d8) damage for the rest of the fight.')],
    actions=[('Multiattack', 'The evolved makes three Wrong Claws attacks.'),
             ('Wrong Claws', '*Melee Weapon Attack:* +10 to hit, reach 10 ft., one target. *Hit:* 19 (2d12 + 6) slashing damage.')],
    flavor='A freelancer whose second Evolution went wrong. It remembers your names.')
mon(name='The Drowned Choir', stage='Evolution II', size='Huge swarm of Medium undead', align='neutral evil', ac=16, acn='', hp='20d12+100',
    speed='20 ft., swim 40 ft.', ab=(16, 12, 20, 10, 16, 20), saves='Wis +7, Cha +9', res='bludgeoning, piercing, slashing', imm='poison, psychic',
    cimm='charmed, frightened, grappled, paralyzed, poisoned, prone, restrained', senses='blindsight 60 ft., passive Perception 13', lang='Common (all at once)',
    cr='11', bps=True, dpr=55, dc=17,
    traits=[('Swarm', 'The Choir can occupy another creature\'s space and vice versa. It can\'t regain hit points.'), ('Conductor', 'Allies within 60 feet of the Choir deal an extra 4 (1d8) psychic damage with their attacks.')],
    actions=[('Undertow Song', 'Each creature of the Choir\'s choice within 30 feet that can hear it must make a DC 17 Wisdom saving throw. On a failure, it takes 33 (6d10) psychic damage and must use its next move to walk toward the nearest deep water or the Choir; on a success, it takes half as much damage.'),
             ('Drowning Grasp', '*Melee Weapon Attack:* +9 to hit, reach 0 ft., one creature in the Choir\'s space. *Hit:* 22 (4d8 + 4) cold damage, and the target is grappled (escape DC 17) and can\'t breathe.')],
    flavor='Fifty drowned voices fused into one. It sings the living toward the water.')
mon(name='Reactor Wraith', stage='Evolution II', size='Large undead', align='neutral evil', ac=17, acn='', hp='20d10+100',
    speed='0 ft., fly 40 ft. (hover)', ab=(10, 18, 20, 12, 14, 16), saves='Con +9, Wis +6', res='acid, cold, lightning; bludgeoning, piercing and slashing from nonmagical attacks',
    imm='fire, necrotic, poison, radiant', cimm='charmed, exhaustion, grappled, paralyzed, poisoned, prone, restrained', senses='darkvision 120 ft., passive Perception 12',
    lang='—', cr='12', bps=True, dpr=75, dc=18, atk=10,
    traits=[('Incorporeal Movement', 'The wraith can move through creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object.'),
            ('Radiation', 'A creature that starts its turn within 10 feet of the wraith takes 7 (2d6) radiant damage.')],
    actions=[('Multiattack', 'The wraith uses Irradiate twice.'),
             ('Irradiate', '*Ranged Spell Attack:* +10 to hit, range 30 ft., one target. *Hit:* 27 (5d10) radiant damage, and the target\'s hit point maximum is reduced by 5 until it finishes a long rest.'),
             ('Meltdown (Recharge 5–6)', 'Each creature within 30 feet of the wraith, friend or foe, must make a DC 18 Constitution saving throw, taking 63 (18d6) fire damage on a failure or half as much on a success. The wraith can\'t use Meltdown again until it has used Irradiate on a turn.')],
    flavor='The ghost of a cooling tower. It hovers into the middle of the fight and goes critical.')

# ---------------------------------------------------------------- Bosses
mon(name='The Brood Matriarch', stage='Boss', size='Huge monstrosity', align='unaligned', ac=14, acn='natural armor', hp='13d12+52',
    speed='0 ft. (rooted); 30 ft. after Shift', ab=(18, 8, 18, 4, 12, 10), saves='Con +7, Wis +4', imm='poison', cimm='poisoned, prone',
    senses='tremorsense 60 ft., passive Perception 11', lang='—', cr='5', dpr=30, atk=6, lr=1, sample='Wave + Snare',
    traits=[('Legendary Resistance (1/Day)', 'If the Matriarch fails a saving throw, she can choose to succeed instead.'),
            ('Shift', 'When the Matriarch first drops to half her hit points or fewer, she tears free of the pipes: she ends every condition on herself, her speed becomes 30 feet, and she can make one Brood-Lash attack against each of two targets with one action.')],
    actions=[('Multiattack', 'The Matriarch makes two Brood-Lash attacks.'),
             ('Brood-Lash', '*Melee Weapon Attack:* +6 to hit, reach 15 ft., one target. *Hit:* 13 (2d8 + 4) bludgeoning damage, and the target is grappled (escape DC 14).'),
             ('Screech (Recharge 5–6)', 'Each creature within 30 feet must make a DC 14 Wisdom saving throw, taking 14 (4d6) psychic damage and becoming frightened until the end of its next turn on a failure, or half damage on a success.')],
    legendary=('The Matriarch can take 2 legendary actions, choosing from the options below. Only one option can be used at a time and only at the end of another creature\'s turn. She regains spent legendary actions at the start of her turn.',
               [('Lash', 'The Matriarch makes one Brood-Lash attack.'), ('Birth (Costs 2 Actions)', 'Two **Spill Rats** swarms burst from her body into unoccupied spaces within 15 feet (no more than four at once). They act on her initiative.')]),
    flavor='A womb the size of a truck, rooted into the pipes. She holds the strongest freelancer and Births when the swarms thin out.')
mon(name='Warden Krell', stage='Boss', size='Medium humanoid (human)', align='lawful evil', ac=19, acn='riot plate, shield', hp='22d8+88',
    speed='30 ft.', ab=(18, 14, 18, 14, 16, 18), saves='Str +8, Con +8, Wis +7', skills='Athletics +8, Intimidation +8, Perception +7', res='poison',
    senses='passive Perception 17', lang='Common', cr='10', dpr=52, atk=8, lr=2,
    traits=[('Legendary Resistance (2/Day)', 'If Krell fails a saving throw, he can choose to succeed instead.'),
            ('Leader', 'Allies within 60 feet of Krell that can hear him deal an extra 3 (1d6) damage with their weapon attacks.'),
            ('Shift', 'When Krell first drops to half his hit points or fewer, he ends every condition on himself, gains +1 AC, and his Riot Slam recharges and becomes a 20-foot burst around him.')],
    actions=[('Multiattack', 'Krell makes three Purge Carbine or Shock Baton attacks.'),
             ('Shock Baton', '*Melee Weapon Attack:* +8 to hit, reach 5 ft., one target. *Hit:* 11 (2d6 + 4) bludgeoning damage plus 4 (1d8) lightning damage.'),
             ('Purge Carbine', '*Ranged Weapon Attack:* +8 to hit, range 120/400 ft., one target. *Hit:* 13 (2d8 + 4) piercing damage. A Mutant hit loses one Primed Surge and gains 1 Flux.'),
             ('Riot Slam (Recharge 5–6)', 'Krell slams his shield forward in a 15-foot cone. Each creature in it must make a DC 16 Strength saving throw, taking 27 (6d8) thunder damage and falling prone on a failure, or half damage on a success.')],
    legendary=('Krell can take 3 legendary actions, choosing from the options below. Only one option can be used at a time and only at the end of another creature\'s turn. He regains spent legendary actions at the start of his turn.',
               [('Fire', 'Krell makes one Purge Carbine attack.'), ('Advance', 'Krell moves up to half his speed without provoking opportunity attacks.'),
                ('Call the Line (Costs 2 Actions)', 'Two **Ostrander Cleaners** arrive from the nearest door or cover (no more than four at once). They act on his initiative.')]),
    flavor='The Ostrander officer who ran the Lockdown camps. He opens from cover, Purges whoever has the most Primed Surges and calls the Line the moment the party bunches up.')
mon(name='Patient Zero', stage='Boss', size='Huge aberration (Mutant)', align='neutral', ac=19, acn='natural armor', hp='24d12+192',
    speed='40 ft.; fly 40 ft. after Shift', ab=(24, 14, 26, 20, 22, 24), saves='Con +15, Wis +13, Cha +14', skills='Insight +13, Perception +13',
    res='acid, cold, fire, lightning, necrotic; bludgeoning, piercing and slashing from nonmagical attacks', imm='poison, psychic', cimm='charmed, frightened, poisoned',
    senses='truesight 120 ft., passive Perception 23', lang='all, telepathy 1 mile', cr='23', bps=True, dpr=135, atk=14, lr=3, regen=20,
    traits=[('Legendary Resistance (3/Day)', 'If Patient Zero fails a saving throw, it can choose to succeed instead.'),
            ('Regeneration', 'Patient Zero regains 20 hit points at the start of its turn unless it took radiant damage since its last turn.'),
            ('Source', 'Mutants within 60 feet of Patient Zero can\'t lower their Flux by any means, and their Overloads always roll twice and use the worse result.'),
            ('Shift', 'When Patient Zero first drops to half its hit points or fewer, it ends every condition on itself, gains a flying speed of 40 feet, and its Unmaking Touch can target three creatures with one attack roll each instead of one.')],
    actions=[('Multiattack', 'Patient Zero makes three Unmaking Touch attacks.'),
             ('Unmaking Touch', '*Melee Weapon Attack:* +14 to hit, reach 15 ft., one target. *Hit:* 29 (4d10 + 7) necrotic damage. A Mutant hit gains 2 Flux; any other creature must succeed on a DC 21 Constitution saving throw or its hit point maximum is reduced by the damage taken until it finishes a long rest.'),
             ('The First Song (Recharge 5–6)', 'Each creature within 60 feet that can hear Patient Zero must make a DC 22 Wisdom saving throw, taking 55 (10d10) psychic damage and becoming frightened for 1 minute on a failure (repeat the save at the end of each of its turns), or half damage on a success.')],
    legendary=('Patient Zero can take 3 legendary actions, choosing from the options below. Only one option can be used at a time and only at the end of another creature\'s turn. It regains spent legendary actions at the start of its turn.',
               [('Touch', 'Patient Zero makes one Unmaking Touch attack.'), ('Speak', 'One creature that can hear it must succeed on a DC 22 Wisdom saving throw or use its reaction to move up to its speed toward Patient Zero.'),
                ('Bloom (Costs 2 Actions)', 'Two **Bloom Knights** grow from the floor within 30 feet (no more than four at once). They act on its initiative.')]),
    flavor='The first person ever to take the Mutagen, still alive in the reactor core. It talks before it fights. Save its Shift for after the party has spent their Final Forms.')

def block(m):
    s, d, c, i, w, h = m['ab']
    ab = ' | '.join('%d (%s)' % (v, sgn(mod(v))) for v in m['ab'])
    cr = m['cr']; hp = m['hp']
    L = ['<div class="mon">', '', '#### %s' % m['name'], '*%s, %s*' % (m['size'], m['align']), '',
         '- **Armor Class** %d%s' % (m['ac'], ' (%s)' % m['acn'] if m['acn'] else ''),
         '- **Hit Points** %d (%s)' % (avg(hp), hp.replace('+', ' + ')), '- **Speed** %s' % m['speed'], '',
         '| STR | DEX | CON | INT | WIS | CHA |', '|:-:|:-:|:-:|:-:|:-:|:-:|', '| %s |' % ab, '']
    for key, lab in [('saves', 'Saving Throws'), ('skills', 'Skills'), ('vuln', 'Damage Vulnerabilities'), ('res', 'Damage Resistances'),
                     ('imm', 'Damage Immunities'), ('cimm', 'Condition Immunities'), ('senses', 'Senses'), ('lang', 'Languages')]:
        if m.get(key): L.append('- **%s** %s' % (lab, m[key]))
    L.append('- **Challenge** %s (%s XP) · **Proficiency Bonus** +%d' % (cr, format(XP[cr], ','), PB(cr)))
    L.append('')
    for n, t in m.get('traits', []): L += ['***%s.*** %s' % (n, t), '']
    L += ['##### Actions', '']
    for n, t in m['actions']: L += ['***%s.*** %s' % (n, t), '']
    if m.get('reactions'):
        L += ['##### Reactions', '']
        for n, t in m['reactions']: L += ['***%s.*** %s' % (n, t), '']
    if m.get('legendary'):
        intro, opts = m['legendary']
        L += ['##### Legendary Actions', '', intro, '']
        for n, t in opts: L += ['***%s.*** %s' % (n, t), '']
    if m.get('sample'): L += ['*Sample:* harvesting it (DC 13 Medicine or tinker\'s tools, 10 minutes) yields a **%s** Surge (see Gear).' % m['sample'], '']
    L += ['*%s*' % m['flavor'], '', '</div>', '']
    return '\n'.join(L)

def main():
    check = '--check' in sys.argv
    bad = []
    print('%-22s %5s %5s %5s %6s %6s  %s' % ('creature', 'def', 'off', 'calc', 'listed', 'eHP', ''))
    for m in M:
        dcr, ocr, fcr, ehp = compute(m)
        off = abs(CRS.index(fcr) - CRS.index(m['cr']))
        flag = 'OK' if off == 0 else 'MISMATCH'
        if off: bad.append(m['name'])
        print('%-22s %5s %5s %5s %6s %6d  %s' % (m['name'], dcr, ocr, fcr, m['cr'], ehp, flag))
    if check: sys.exit(1 if bad else 0)
    out = ['# Bestiary', '',
           'Selected threats from *Mutagen*\'s roster, rebuilt as 5e stat blocks. Challenge ratings were computed with the DMG\'s *Creating a Monster* method (effective hit points and AC for defense; damage per round over three rounds and attack bonus or save DC for offense) by `5e/tools/bestiary.py`, which re-checks them on every build. Creatures marked *Sample* leave a harvestable Surge (Options chapter).', '',
           '![The Drain Beast](../../art/threat_drainbeast.jpg)', '',
           '| Creature | CR | Stage | Role |', '|:--|:-:|:--|:--|']
    role = {'Spill Rats': 'Swarm', 'Scrapjack Picker': 'Skirmisher', 'Ward Tough': 'Soldier', 'Bloomhound': 'Pack hunter', 'Turret Drone': 'Artillery',
            'Ostrander Cleaner': 'Soldier', 'Sporecaller': 'Healer, leader', 'Drain Beast': 'Brute', 'Boiler Hulk': 'Brute', 'Cleaner Hound': 'Pack hunter',
            'Damper Drone': 'Controller', 'Bloom Knight': 'Soldier', 'Glasshide': 'Brute', 'Hunter-Killer Unit': 'Assassin', 'Feral Evolved': 'Elite',
            'The Drowned Choir': 'Controller', 'Reactor Wraith': 'Artillery, brute', 'The Brood Matriarch': 'Boss', 'Warden Krell': 'Boss', 'Patient Zero': 'Boss (final)'}
    for m in sorted(M, key=lambda m: (CRS.index(m['cr']), m['name'])):
        out.append('| %s | %s | %s | %s |' % (m['name'], m['cr'], m['stage'], role[m['name']]))
    out.append('')
    for st, title in [('Base', 'Base Stage (levels 1–5)'), ('Evolution I', 'Evolution I Stage (levels 5–12)'), ('Evolution II', 'Evolution II Stage (levels 11–20)'), ('Boss', 'Bosses')]:
        out += ['## ' + title, '']
        for m in [m for m in M if m['stage'] == st]: out.append(block(m))
    open(os.path.join(ROOT, 'src', '07_bestiary.md'), 'w').write('\n'.join(out))
    print('wrote src/07_bestiary.md (%d creatures)%s' % (len(M), '; MISMATCH: ' + ', '.join(bad) if bad else ''))

if __name__ == '__main__': main()
