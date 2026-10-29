"""Threat table, threat builder and the ch 10 roster as data (the sim and the docs both read this).
Keep in sync with chapters/10_Threats.md (tools/encounter_sim.py doc regenerates the stat blocks)."""
# v0.3 table (calibrated 2026-10-28 by tools/calibrate_table.py, smoothed): 4 T-N Soldiers = a fair fight for
# 4 fully rested level-N freelancers. Beyond T10: +1 Guard, +1 TN, +8 HP, +4 Damage per T.
GUARD = [None, 12, 13, 14, 14, 15, 16, 17, 18, 19, 20, 21, 22]
TN    = [None, 13, 13, 14, 16, 17, 18, 20, 21, 22, 23, 24, 25]
HP    = [None, 28, 30, 38, 62, 74, 78, 150, 158, 162, 168, 176, 184]
DMG   = [None, 10, 11, 16, 25, 29, 30, 46, 47, 48, 50, 54, 58]
BONUS = [None] + [round(x / 5) for x in DMG[1:]]   # trait bonus column: ~1/5 of Damage
OLD = dict(GUARD=[None, 12, 13, 14, 14, 15, 16, 17, 18, 19, 20], TN=[None, 12, 12, 13, 13, 14, 15, 16, 17, 18, 18],
           HP=[None, 18, 22, 30, 40, 48, 56, 72, 84, 92, 100], DMG=[None, 7, 8, 10, 12, 14, 16, 18, 21, 24, 27])
ROLE = {  # guard mod, hp mult, dmg mult, actions
    'mook': (-1, 0.25, 0.5, 1), 'soldier': (0, 1, 1, 1), 'skirmisher': (1, 0.75, 1, 1), 'artillery': (0, 0.75, 0.75, 1),
    'controller': (0, 1, 0.5, 1), 'brute': (-1, 2, 1.5, 1), 'elite': (0, 2, 1, 2), 'boss': (1, 4, 1, 1)}
def threat(T, role, name=None, d='dodge', area=None, rider=None, traits=None, **kw):
    g, h, m, a = ROLE[role]
    b = dict(name=name or 'T%d %s' % (T, role), T=T, role=role, guard=GUARD[T] + g, tn=TN[T], hp=max(1, int(HP[T] * h)),
             actions=a, interrupts=1 if role == 'boss' else 0, traits=dict(traits or {}),
             attacks=[dict(n='Attack', d=d, dmg=int(DMG[T] * m), area=area, rider=rider)])
    b.update(kw)
    return b
import json as _json, os as _os
_TF = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'sim_data', 'roster_tuning.json')
TUNE = _json.load(open(_TF)) if _os.path.exists(_TF) else {}   # name -> [hp factor, damage factor] from tune_roster.py
if _os.environ.get('MUTAGEN_OLD'):   # 'before' runs: the v0.2 table, untuned (tools/sim_results/02_before_v02.md)
    GUARD, TN, HP, DMG = (OLD[k] + [OLD[k][-1]] * 2 for k in ('GUARD', 'TN', 'HP', 'DMG'))
    BONUS = [None] + [round(x / 5) for x in DMG[1:]]; TUNE = {}
ROSTER = []
BY_NAME = {}
GENERIC = {}
for _T in range(1, 13):
    for _r in ROLE:
        _x = threat(_T, _r, d='mix'); GENERIC[_x['name']] = _x; BY_NAME[_x['name']] = _x

def mk(name, T, role, kind, faction, attacks, traits=None, hpm=1.0, dmm=1.0, guard=0, tn=0, armor=0, speed='30',
       look='', tactics='', special='', melee=True, **kw):
    """attacks: list of dicts with n (name), d (dodge/endure/resist/mix), m (damage multiple of the role damage), and
    optional area ('s' 10-ft burst/15-ft cone, 'm' 20-ft, 'l' 30-ft+), shape (text), rng (text), rider, extra (per
    extra PC caught, as a multiple of Bonus), recharge (5 = 5-6), ff (hits allies), stagger, psy, special."""
    g, h, dmf, a = ROLE[role]
    if name in TUNE: hpm, dmm = hpm * TUNE[name][0], dmm * TUNE[name][1]
    hp = int(round(HP[T] * h * hpm))
    base = DMG[T] * dmf * dmm
    ats = []
    for x in attacks:
        y = dict(x); y['dmg'] = int(round(base * x.get('m', 1)))
        if 'extra' in x: y['extra'] = max(1, int(round(BONUS[T] * x['extra'] * dmm)))
        y.setdefault('area', None); y.setdefault('rider', None); y['melee'] = x.get('melee', melee)
        ats.append(y)
    tr = {}
    for k, v in (traits or {}).items():
        if k in ('pack',): tr[k] = (1, BONUS[T] * v, 3)          # +1 TN, +v*Bonus dmg per earlier pack attack, max 3
        elif k == 'enrage': tr[k] = (BONUS[T] * v, 3)             # +v*Bonus dmg per ally death, max 3 stacks
        elif k == 'leader': tr[k] = BONUS[T] * v
        elif k == 'crowd': tr[k] = (BONUS[T] * v, 3 * BONUS[T] * v)
        elif k == 'heal': tr[k] = int(round(HP[T] * v))
        elif k == 'regen': tr[k] = int(round(HP[T] * v))
        elif k == 'explode': tr[k] = int(round(DMG[T] * v))
        else: tr[k] = v
    b = dict(name=name, T=T, role=role, kind=kind, faction=faction, guard=GUARD[T] + g + guard, tn=TN[T] + tn, hp=hp,
             armor=armor, actions=a, interrupts=1 if role == 'boss' else 0, traits=tr, attacks=ats, speed=speed,
             look=look, tactics=tactics, special=special, melee=melee, hpm=hpm, dmm=dmm)
    b.update(kw)
    return add(b)
def add(b):
    ROSTER.append(b); BY_NAME[b['name']] = b; return b

# ============================== BASE STAGE (levels 1-3) ==============================
mk('Spill Rats', 1, 'mook', 'pack', 'Spill fauna',
   [dict(n='Bite', d='dodge', rng='melee', m=1)], traits={'pack': 1, 'overwhelm': 3, 'mutagenic': 1}, speed='30 (climb)',
   look='Hairless, glowing, wrong number of legs.', tactics='Pour out of pipes in fours or more; all bite the same freelancer.')
mk('Scrapjack Picker', 1, 'skirmisher', 'pack', 'Scrapjacks',
   [dict(n='Hook-blade or Rivet Gun', d='dodge', rng='melee or 60 ft', m=1)], traits={'pack': 1, 'flank': True}, speed='40',
   look='Scavengers in welded scrap armour, magnets on their gloves.', tactics='Gang up on whoever has visible chrome; scatter when two are down.')
mk('Ward Tough', 1, 'soldier', 'general', 'Drowned Wards',
   [dict(n='Pipe or Pistol', d='mix', rng='melee or 60 ft', m=1)], traits={'surrender': True},
   look='Waders, a rebar club, a family to feed.', tactics='Wants to be paid, not killed. Surrenders at half HP.')
mk('Bloomhound', 2, 'skirmisher', 'pack', 'Spill fauna',
   [dict(n='Split-Jaw', d='dodge', rng='melee', m=1, rider='held')], traits={'flank': True, 'enrage': 1}, speed='50',
   look='A dog that opens like a flower.', tactics='Hunts in packs; one holds, the rest bite. Goes wild when a packmate dies.')
mk('Turret Drone', 2, 'artillery', 'general', 'Ostrander Remnant',
   [dict(n='Flechette Spray', d='dodge', area='s', shape='10-ft burst', rng='90 ft', m=1)], traits={'mover': 'fly', 'explode': 0.5}, armor=1,
   speed='30 (fly)', melee=False, look='A coffee-can drone with a shotgun.', tactics='Hovers out of reach; fires into clusters.')
mk('Drain Beast', 2, 'brute', 'aoe', 'Spill fauna',
   [dict(n='Tail Thrash', d='endure', area='m', shape='20 ft around it', rng='', m=0.8, extra=2, ff=True, recharge=4, special=True),
    dict(n='Crush', d='endure', rng='reach 10 ft', m=0.4, rider='held')],
   traits={'apex': True, 'huge': True, 'bulky': 0.5, 'regen': 0.1}, speed='30 (swim)',
   look='A drowned bull crocodile the size of a bus.', tactics='Thrashes when it is surrounded; drags one victim under when it is not.')
mk('Boiler Hulk', 3, 'brute', 'aoe', 'Scrapjacks',
   [dict(n='Steam Vent', d='endure', area='m', shape='20 ft around it', rng='', m=0.9, extra=2, ff=True, stagger=True, special=True),
    dict(n='Furnace Fist', d='dodge', rng='melee', m=0.4, rider='burning')],
   traits={'apex': True, 'huge': True, 'bulky': 0.5}, armor=1,
   look='A walking furnace bolted onto a press-ganged Ward diver.', tactics='Wades into the middle of the party and vents. Vents again whether or not its crew is close.')
mk('Ostrander Cleaner', 3, 'soldier', 'general', 'Ostrander Remnant',
   [dict(n='Purge Rifle', d='dodge', rng='120 ft', m=1, rider='purge'), dict(n='Foam Sprayer', d='endure', area='s', shape='15-ft cone', rng='', m=0.8)],
   traits={'shieldwall': (1, 2)}, armor=1,
   look='Hazmat suit, antimutagen rifle, no face.', tactics='Advances in pairs behind riot shields; foams anyone mid-Surge.')
mk('Sporecaller', 3, 'controller', 'control', 'Children of the Bloom',
   [dict(n='Spore Hymn', d='endure', area='m', shape='20-ft burst', rng='60 ft', m=1, rider='poisoned')],
   traits={'leader': 1, 'heal': 0.25, 'mutagenic': 1}, melee=False,
   look='A Bloom priest with a mouth full of flowers.', tactics='Stays behind its flock, sings, and knits their wounds shut.')

# ============================== EVOLUTION I STAGE (levels 4-6) ==============================
mk('Mirrormaw', 4, 'elite', 'general', 'Spill fauna',
   [dict(n='Glass Teeth', d='dodge', rng='melee', m=1, rider='exposed')], traits={'mimic': True}, speed='30 (climb)',
   look='Looks like a vending machine, a door, or your friend.', tactics='Waits. Bites the one who touches it.')
mk('Cleaner Hound', 4, 'skirmisher', 'pack', 'Ostrander Remnant',
   [dict(n='Injector Bite', d='dodge', rng='melee', m=1, rider='purge')], traits={'pack': 1, 'flank': True}, speed='50',
   look="Ostrander's chrome dogs.", tactics='Run in threes or fours, chase whoever just Surged, and drain their Primed Surges.')
mk('Gas Bloat', 4, 'brute', 'aoe', 'Children of the Bloom',
   [dict(n='Spore Gout', d='endure', area='l', shape='30 ft around it', rng='', m=0.7, extra=2, ff=True, recharge=5, rider='poisoned', special=True),
    dict(n='Slam', d='dodge', rng='melee', m=0.4)],
   traits={'apex': True, 'explode': 0.6, 'bulky': 0.5}, speed='20',
   look='A Bloom convert swollen into a weather balloon of spores.', tactics='Drifts into the biggest crowd it can find and bursts.')
mk('Bloom Knight', 5, 'soldier', 'general', 'Children of the Bloom',
   [dict(n='Thorn Glaive', d='dodge', rng='reach 10 ft', m=1, rider='poisoned')], traits={'mutagenic': 1}, armor=2,
   look='Holy warrior grown from a single rosebush.', tactics='Stands in front of Sporecallers and never retreats.')
mk('Glasshide', 5, 'brute', 'aoe', 'Spill fauna',
   [dict(n='Shatter Roar', d='endure', area='m', shape='20 ft around it', rng='', m=0.8, extra=2, ff=True, recharge=4, special=True),
    dict(n='Crystal Maul', d='endure', rng='reach 10 ft', m=0.4, rider='prone')],
   traits={'apex': True, 'huge': True, 'territorial': 0.67, 'bulky': 0.5, 'vuln': 'shock'}, armor=2,
   look='A bear grown into a cathedral of quartz.', tactics='Charges the loudest thing. Fights any other Glasshide on sight.')
mk('Stitchwork Brood', 5, 'soldier', 'pack', 'Children of the Bloom',
   [dict(n='Sutured Claws', d='mix', rng='melee', m=1)], traits={'link': True, 'crowd': 0.5},
   look='Bloom converts sewn into one nervous system with living thread.', tactics='Move as one; a wound on one bleeds on all of them.')
mk('Damper Drone', 5, 'controller', 'control', 'Ostrander Remnant',
   [dict(n='Null Pulse', d='resist', area='s', shape='10-ft burst', rng='60 ft', m=1.0, rider='dazed')], traits={'jammer': True, 'mover': 'fly'},
   armor=1, speed='30 (fly)', melee=False,
   look='A floating antimutagen censer.', tactics='Hangs back over the Ostrander line; its field makes every Surge cost more.')
mk('Lancer Troopers', 6, 'mook', 'pack', 'Ostrander Remnant',
   [dict(n='Shock Lance', d='dodge', rng='30 ft', m=1, rider='dazed')], traits={'shieldwall': (1, 3), 'purger': True},
   look='Ostrander riot line.', tactics='Locked shields in sixes. Two hold the door; the rest lance the Chrome.')
mk('Hunter-Killer Unit', 6, 'elite', 'general', 'Ostrander Remnant',
   [dict(n='Mono-wire or Arc Pistol', d='dodge', rng='reach 10 ft or 60 ft', m=1, rider='dazed')], traits={'smart': True}, armor=2, speed='40',
   look="Ostrander's chrome assassin.", tactics='Kills the medic first.')

# ============================== EVOLUTION II STAGE (levels 7-10) ==============================
mk('Feral Evolved', 7, 'elite', 'general', 'Spill fauna',
   [dict(n='Wrong Claws', d='dodge', rng='melee', m=1)], traits={'regen': 0.05, 'mutagenic': 2, 'gate': True}, speed='40',
   shift=dict(guard=2, dmg=3 * BONUS[7] // 3, shake=True),
   look='A freelancer whose second Evolution went wrong.', tactics='It remembers your names.')
mk('Razorwing Flock', 7, 'skirmisher', 'pack', 'Spill fauna',
   [dict(n='Razor Dive', d='dodge', rng='melee', m=1)], traits={'flank': True, 'enrage': 1, 'pack': 1}, speed='60 (fly)',
   look='Pigeons the Spill turned into flying knives.', tactics='Dive one target from every side; scream and dive harder when one falls.')
mk('Gutter Leviathan', 7, 'brute', 'aoe', 'Spill fauna',
   [dict(n='Undertow', d='endure', area='l', shape='30 ft around it', rng='', m=0.8, extra=2, ff=True, recharge=4, rider='prone', special=True),
    dict(n='Swallow', d='endure', rng='reach 15 ft', m=0.4, rider='held')],
   traits={'apex': True, 'huge': True, 'bulky': 0.5, 'territorial': 0.67}, armor=3, speed='20 (swim 40)',
   look='The thing that lives in the flooded subway.', tactics='Surfaces, drowns everyone near the water, dives. Two never share a tunnel.')
mk('Seraph Gunship', 8, 'artillery', 'aoe', 'Ostrander Remnant',
   [dict(n='Rotary Cannon', d='dodge', area='m', shape='20-ft burst', rng='120 ft', m=1.0, extra=2, recharge=4, special=True),
    dict(n='Door Gun', d='dodge', rng='120 ft', m=0.4)],
   traits={'apex': True, 'mover': 'fly', 'interference': True, 'explode': 0.5}, armor=3, speed='40 (fly)', melee=False,
   look='An Ostrander drone with angel wings painted on.', tactics='Circles the rooftops and shreds anyone in the open. Gunships share one fire-control net.')
mk('The Drowned Choir', 8, 'controller', 'control', 'Drowned Wards',
   [dict(n='Undertow Song', d='resist', area='l', shape='30 ft around it', rng='', m=1.2, rider='shaken', psy=True)],
   traits={'swarm': True, 'mutagenic': 2, 'leader': 1}, speed='20 (swim)',
   look='Fifty drowned voices fused into one.', tactics='Sings the living toward the water; its thralls sing louder near it.')
mk('Ostrander Paladin', 8, 'soldier', 'general', 'Ostrander Remnant',
   [dict(n='Lance Cannon', d='mix', rng='90 ft', m=1)], traits={'shielded': True}, armor=3,
   look='A powered exo-frame with a saint painted on the chest.', tactics='Walks through gunfire to plant its lance; never breaks formation.')
mk('Choir Thralls', 9, 'mook', 'pack', 'Drowned Wards',
   [dict(n='Grasping Hands', d='endure', rng='melee', m=1, rider='held')], traits={'overwhelm': 3, 'pack': 1, 'mutagenic': 1},
   look="The Choir's converts, still singing.", tactics='Come in sixes to pin you down for something worse.')
mk('Mother of Rust', 9, 'controller', 'control', 'Scrapjacks',
   [dict(n='Corrosion Tide', d='endure', area='m', shape='20 ft around her', rng='', m=1.2, rider='exposed')],
   traits={'leader': 1, 'heal': 0.25}, speed='30 (climb)',
   look="The Scrapjacks' queen, a cathedral of rust and stolen limbs.", tactics='Melts Armor, rebuilds her crew from scrap, and lets them feast.')
mk('Reactor Wraith', 10, 'brute', 'aoe', 'Spill fauna',
   [dict(n='Meltdown', d='endure', area='l', shape='30 ft around it', rng='', m=0.8, extra=2, ff=True, stagger=True, special=True),
    dict(n='Irradiate', d='endure', rng='30 ft', m=0.4, rider='burning')],
   traits={'apex': True, 'huge': True, 'interference': True, 'bulky': 0.5}, armor=2, speed='30 (fly)',
   look='The ghost of a cooling tower.', tactics='Hovers into the middle of the fight and goes critical. Wraiths drain each other.')
mk('Hollow Saint', 10, 'skirmisher', 'general', 'Children of the Bloom',
   [dict(n='Halo Edge or Whisper', d='mix', rng='melee or 60 ft', m=1, rider='shaken')], traits={'mimic': True, 'smart': True}, speed='50 (fly)',
   look='A Bloom martyr that came back beautiful.', tactics='Appears among the wounded and offers to end the pain.')
mk('The Many', 10, 'soldier', 'pack', 'Children of the Bloom',
   [dict(n='Thousand Hands', d='mix', rng='melee', m=1)], traits={'link': True, 'enrage': 1},
   look="Patient Zero's first congregation, grown together at the roots.", tactics='Surround; when one falls the rest scream in one voice and push harder.')
mk('Bloom Husks', 8, 'mook', 'pack', 'Children of the Bloom',
   [dict(n='Root Grip', d='endure', rng='melee', m=1, rider='held')], traits={'overwhelm': 3, 'crowd': 0.5},
   look='Bodies the Bloom finished with, still walking.', tactics='Shamble in crowds; three on one freelancer drag them down.')

# summoned minions: base threat-builder stats (never tuned, not in the roster tables; printed inside the Boss's block)
SUMMONS = {}
def summon_t(name, T, attack, rider=None, traits=None):
    b = threat(T, 'mook', name=name, d=attack[1], rider=rider, traits=traits or {})
    b['attacks'][0]['n'] = attack[0]; b['kind'] = 'summon'; SUMMONS[name] = b; BY_NAME[name] = b; return b
summon_t('Brood Spawn', 1, ('Bite', 'dodge'))
summon_t('Riot Line Trooper', 6, ('Shock Lance', 'dodge'), rider='dazed')
summon_t('Husk', 8, ('Root Grip', 'endure'), rider='held')

# ============================== BOSSES ==============================
mk('The Brood Matriarch', 1, 'boss', 'boss', 'Spill fauna',
   [dict(n='Brood-Lash', d='dodge', rng='reach 15 ft', m=1, rider='held'),
    dict(n='Screech', d='resist', area='l', shape='30 ft around her', rng='', m=0.6, rider='shaken', recharge=5, special=True),
    dict(n='Birth', summon=('Brood Spawn', 2, 4), below=2, recharge=5, special=True)],
   traits={'huge': True, 'mutagenic': 1}, speed='0 (rooted); 30 after Shift',
   shift=dict(attacks=[dict(n='Brood-Lash', d='dodge', multi=2, rng='reach 15 ft', m=0.8, rider='held'),
                       dict(n='Screech', d='resist', area='l', shape='30 ft around her', rng='', m=0.6, rider='shaken', recharge=5, special=True),
                       dict(n='Birth', summon=('Brood Spawn', 2, 4), below=2, recharge=5, special=True)], cleanse=True),
   look='A womb the size of a truck, rooted into the pipes.', tactics='Holds the strongest freelancer, Births when she has fewer than 3 rats, Screeches when 2+ freelancers are near.')
mk('Warden Krell', 5, 'boss', 'boss', 'Ostrander Remnant',
   [dict(n='Purge Carbine', d='dodge', rng='120 ft', m=1, rider='purge'),
    dict(n='Riot Slam', d='endure', area='s', shape='15-ft cone', rng='', m=0.8, rider='prone', recharge=5),
    dict(n='Call the Line', summon=('Riot Line Trooper', 2, 4), below=2, recharge=6, special=True)],
   traits={'leader': 1}, armor=2,
   shift=dict(armor=1, attacks=[dict(n='Purge Carbine', d='dodge', rng='120 ft', m=1, rider='purge'),
                                dict(n='Riot Slam', d='endure', area='m', shape='20 ft around him', rng='', m=0.8, rider='prone', recharge=5),
                                dict(n='Call the Line', summon=('Riot Line Trooper', 2, 4), below=2, recharge=6, special=True)], cleanse=True),
   look='The Ostrander officer who ran the Lockdown camps.', tactics='Opens from cover, Purges whoever has the most Primed Surges, and calls the Line the moment the party bunches up.')
mk('Patient Zero', 10, 'boss', 'boss', 'Children of the Bloom',
   [dict(n='Unmaking Touch', d='endure', rng='reach 15 ft', m=1, rider='flux2'),
    dict(n='The First Song', d='resist', area='l', shape='60 ft around it', rng='', m=0.6, rider='shaken', psy=True, recharge=5, special=True),
    dict(n='Bloom', summon=('Husk', 2, 4), below=2, recharge=5, special=True)],
   traits={'huge': True, 'regen': 0.05}, speed='40 (fly after Shift)',
   shift=dict(guard=1, interrupts=1, attacks=[dict(n='Unmaking Touch', d='endure', multi=3, rng='reach 15 ft', m=0.8, rider='flux2'),
              dict(n='The First Song', d='resist', area='l', shape='60 ft around it', rng='', m=0.6, rider='shaken', psy=True, recharge=5, special=True),
              dict(n='Bloom', summon=('Husk', 2, 4), below=2, recharge=5, special=True)]),
   look='The first person ever to take the Mutagen, still alive in the reactor core.', tactics='Talks before it fights. Its Shift should land after the party has spent their Final Forms.')

def _fix_shift_damage():
    for b in ROSTER:
        sh = b.get('shift')
        if not sh or not sh.get('attacks'): continue
        g, h, dmf, a = ROLE[b['role']]
        for x in sh['attacks']:
            if 'summon' in x: continue
            x['dmg'] = int(round(DMG[b['T']] * dmf * b['dmm'] * x.get('m', 1)))
            x.setdefault('area', None); x.setdefault('rider', None); x.setdefault('melee', True)
_fix_shift_damage()
# summon templates travel with the attack (the sim's worker processes don't re-read this module's edits)
import copy as _copy
def _scaled(t, f):
    y = _copy.deepcopy(t); y['hp'] = max(1, int(round(y['hp'] * f[0])))
    for z in y['attacks']: z['dmg'] = max(1, int(round(z['dmg'] * f[1])))
    return y
for _b in ROSTER:
    _f = TUNE.get(_b['name'], [1.0, 1.0])
    for _x in _b['attacks'] + (_b.get('shift') or {}).get('attacks', []):
        if 'summon' in _x:
            _x['tmpl'] = _scaled(BY_NAME[_x['summon'][0]], _f)   # a Boss's brood scales with the Boss
            _b.setdefault('summoned', {})[_x['summon'][0]] = _x['tmpl']
