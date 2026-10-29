"""Prints the ch 10 roster (stat blocks + roster table) from encounter_roster.py and the final ratings.
Run: python3 tools/threat_blocks.py blocks | table   (reads tools/sim_results/04_ratings_final.json)"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import encounter_roster as RO
R = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sim_results', '04_ratings_final.json')))
ROLE = {'mook': 'Mook', 'soldier': 'Soldier', 'skirmisher': 'Skirmisher', 'artillery': 'Artillery', 'controller': 'Controller',
        'brute': 'Brute', 'elite': 'Elite', 'boss': 'Boss'}
KIND = {'pack': 'Pack', 'aoe': 'Heavy', 'general': 'Generalist', 'control': 'Control', 'boss': 'Boss'}
DEF = {'dodge': 'Dodge', 'endure': 'Endure', 'resist': 'Resist', 'mix': 'Dodge/Endure/Resist (GM picks)'}
RIDER = {'held': 'Held', 'poisoned': 'Poisoned', 'exposed': 'Exposed', 'dazed': 'Dazed', 'prone': 'Prone', 'shaken': 'Shaken',
         'burning': 'Burning', 'blinded': 'Blinded', 'purge': 'loses one Primed Surge', 'flux2': '+2 Flux'}
AREA = {'s': '10 ft', 'm': '20 ft', 'l': '30 ft'}
def fr(x):
    if x < 0.5: return '<1'
    if x > 10.5: return '10+'
    return str(int(round(x)))
def ratings(nm): r = R[nm]; return fr(r['b4']), fr(r['m4'])
def d6(p): return {0.5: '1–3', 0.67: '1–4', 0.9: '1–5'}.get(p, '%d%%' % round(100 * p))
def trait_text(b):
    T = b['T']; out = []
    for k, v in b['traits'].items():
        if k == 'pack': out.append('**Pack** (+1 TN and +%d damage for each earlier Pack attack on the same target this round, max +3/+%d)' % (v[1], 3 * v[1]))
        elif k == 'flank': out.append('**Flanker** (advantage while another Flanker is fighting)')
        elif k == 'overwhelm': out.append('**Overwhelm** (the 3rd attack from its group on one freelancer in a round leaves them Prone and Held)')
        elif k == 'mutagenic': out.append('**Mutagenic %d**' % v)
        elif k == 'crowd': out.append('**Crowd** (+%d damage per other enemy fighting, max +%d)' % v)
        elif k == 'link': out.append('**Linked** (damage to one is split evenly among all Linked creatures)')
        elif k == 'shieldwall': out.append('**Shield Wall** (+%d Guard per other Shield Wall ally fighting, max +%d)' % v)
        elif k == 'leader': out.append('**Leader** (other enemies deal +%d damage)' % v)
        elif k == 'heal': out.append('**Mender** (instead of attacking, heals the most-hurt non-Mook ally below 60%% HP for %d)' % v)
        elif k == 'regen': out.append('**Regenerating %d**' % v)
        elif k == 'enrage': out.append('**Frenzy** (+%d damage per ally killed this fight, max +%d)' % (v[0], 3 * v[0]))
        elif k == 'explode': out.append('**Explosive %d**' % v)
        elif k == 'apex': out.append('**Apex** (while it is the only enemy standing: +2 TN, ×1½ Damage)')
        elif k == 'huge': out.append('**Huge**')
        elif k == 'bulky': out.append('**Bulky** (before an Area attack, roll d6 per non-Mook ally; any 1–3 = it uses its single attack)')
        elif k == 'interference': out.append('**Interference** (only one Interference creature can use an Area attack per Enemy Phase)')
        elif k == 'territorial': out.append('**Territorial** (while a rival of its kind lives, d6 %s: it attacks the rival instead)' % d6(v))
        elif k == 'surrender': out.append('**Cowardly** (at half HP or less, surrenders on d6 4–6 each Enemy Phase)')
        elif k == 'mimic': out.append('**Mimic**')
        elif k == 'smart': out.append('**Hunter** (half its attacks go to the lowest-HP freelancer)')
        elif k == 'shielded': out.append('**Shielded**')
        elif k == 'swarm': out.append('**Swarm**')
        elif k == 'purger': out.append('**Purger**')
        elif k == 'jammer': out.append('**Damper Field** (while it lives, every Unleash costs +1 Flux)')
        elif k == 'vuln': out.append('**Vulnerable (%s)**' % v.capitalize())
        elif k == 'gate': out.append('**Damage Gate** (the first time it would drop below half HP it stops at half and Shifts)')
        elif k == 'mover': out.append('**Mover (%s)**' % v)
        else: out.append('**%s**' % k)
    if b.get('armor'): out.insert(0, '**Armored %d**' % b['armor'])
    return ' · '.join(out)
def atk_text(a, b):
    if 'summon' in a:
        t, c, mx = a['summon']; s = '*%s:* %d %s join the fight (max %d)' % (a['n'], c, t, mx)
        if a.get('recharge'): s += ', Recharge %d–6' % a['recharge']
        tm = b.get('summoned', {}).get(t)
        if tm: s += ' — each: Guard %d · TN %d · HP %d · %s (%s) %d%s' % (tm['guard'], tm['tn'], tm['hp'], tm['attacks'][0]['n'], DEF[tm['attacks'][0]['d']].split(' ')[0], tm['attacks'][0]['dmg'], (', ' + RIDER[tm['attacks'][0]['rider']]) if tm['attacks'][0].get('rider') else '')
        return s
    sh = a.get('shape') or (('Area ' + AREA[a['area']]) if a.get('area') else 'Single')
    kind = 'Area, %s' % sh if a.get('area') else 'Single'
    rng = (', ' + a['rng']) if a.get('rng') else ''
    s = '*%s* (%s, %s%s) — **%d**' % (a['n'], DEF[a['d']], kind, rng, a['dmg'])
    if a.get('multi'): s += ' to each of %d targets' % a['multi']
    if a.get('rider'): s += ', ' + RIDER[a['rider']]
    if a.get('psy'): s += ' (psychic: ignores Armor)'
    if a.get('extra'): s += '. **Engulf +%d:** +%d damage to everyone caught for each freelancer caught beyond the first (max +2 freelancers)' % (a['extra'], a['extra'])
    if a.get('ff'): s += '. **Friendly fire:** also hits its allies in the area'
    if a.get('recharge'): s += '. Recharge %d–6' % a['recharge']
    if a.get('stagger'): s += '. Afterwards it skips its next Enemy Phase'
    return s
def block(b):
    br, mr = ratings(b['name'])
    head = '**%s** — T%d %s · **BR %s · MR %s** · %s · Guard %d · TN %d · HP %d · Speed %s' % (
        b['name'], b['T'], ROLE[b['role']], br, mr, KIND[b['kind']], b['guard'], b['tn'], b['hp'], b['speed'])
    acts = ['Two actions' if b['actions'] == 2 else None, 'one action + one Interrupt' if b['role'] == 'boss' else None]
    lines = [head + '  ']
    ats = [atk_text(a, b) for a in b['attacks']]
    lead = '**Attack%s:** ' % (' ×2' if b['actions'] == 2 else '') if b['role'] != 'boss' else '**Actions** (one per Enemy Phase + one Interrupt): '
    lines.append(lead + ' · '.join(ats) + '.  ')
    tt = trait_text(b)
    if tt: lines.append('**Traits:** ' + tt + '.  ')
    sh = b.get('shift')
    if sh:
        bits = []
        if sh.get('guard'): bits.append('+%d Guard' % sh['guard'])
        if sh.get('armor'): bits.append('+%d Armor' % sh['armor'])
        if sh.get('dmg'): bits.append('+%d Damage' % sh['dmg'])
        if sh.get('interrupts'): bits.append('+%d Interrupt' % sh['interrupts'])
        if sh.get('shake'): bits.append('everyone within 30 ft is Shaken (Resist vs TN)')
        if sh.get('cleanse'): bits.append('ends every condition on itself')
        if sh.get('attacks'):
            old = {a['n']: a for a in b['attacks']}
            for a in sh['attacks']:
                o = old.get(a['n'])
                if o and (o.get('area') != a.get('area') or o.get('multi') != a.get('multi')): bits.append(atk_text(a, b))
        lines.append('**Shift (half HP):** ' + '; '.join(bits) + '.  ')
    lines.append('*%s* **Tactics:** %s' % (b['look'], b['tactics']))
    return '\n'.join(lines)
STANDOUT = {
 'Spill Rats': 'Pack + Overwhelm: four on one freelancer pin them', 'Scrapjack Picker': 'Pack + Flanker', 'Ward Tough': 'Cowardly: surrenders',
 'Bloomhound': 'Flanker + Frenzy; Held', 'Turret Drone': 'Flying 10-ft Area; Explosive', 'Drain Beast': 'Engulf Tail Thrash; Bulky; Regenerating',
 'Boiler Hulk': 'Engulf Steam Vent, then skips a phase', 'Ostrander Cleaner': 'Shield Wall; Purge Rifle', 'Sporecaller': 'Leader + Mender; Poisoned area',
 'Mirrormaw': 'Mimic; two attacks', 'Cleaner Hound': 'Pack + Flanker; Purge bite', 'Gas Bloat': '30-ft Engulf; Explosive',
 'Bloom Knight': 'Armored 2; Poisoned', 'Glasshide': 'Engulf; Territorial; Vulnerable (Shock)', 'Stitchwork Brood': 'Linked + Crowd',
 'Damper Drone': 'Damper Field: Unleash +1 Flux', 'Lancer Troopers': 'Shield Wall + Purger', 'Hunter-Killer Unit': 'Hunter; two Dazing attacks',
 'Feral Evolved': 'Damage Gate + Shift', 'Razorwing Flock': 'Pack + Flanker + Frenzy', 'Gutter Leviathan': '30-ft Engulf; Bulky; Territorial',
 'Bloom Husks': 'Overwhelm + Crowd', 'Ostrander Paladin': 'Shielded; Armored 3', 'Seraph Gunship': '20-ft Engulf at 120 ft; Interference',
 'The Drowned Choir': 'Swarm; Leader; psychic 30-ft area', 'Choir Thralls': 'Overwhelm + Pack', 'Mother of Rust': 'Leader + Mender; Exposed area',
 'Hollow Saint': 'Mimic + Hunter', 'Reactor Wraith': '30-ft Engulf; Interference; Bulky', 'The Many': 'Linked + Frenzy',
 'The Brood Matriarch': 'Births Brood Spawn; Screech', 'Warden Krell': 'Calls the Line; Purge; Leader', 'Patient Zero': 'Blooms Husks; 60-ft Song; triple Shift'}
def anchor(nm): return nm.lower().replace(' ', '-').replace("'", '')
def table():
    print('| Creature | T | Role | Kind | BR | MR | Faction | Standout |')
    print('|---|---|---|---|---|---|---|---|')
    for b in sorted(RO.ROSTER, key=lambda b: (b['T'], b['role'] == 'boss', b['name'])):
        br, mr = ratings(b['name'])
        print('| [%s](#%s) | %d | %s | %s | %s | %s | %s | %s |' % (b['name'], anchor(b['name']), b['T'], ROLE[b['role']], KIND[b['kind']], br, mr, b['faction'], STANDOUT.get(b['name'], '')))
STAGES = [('Base stage (T1–3)', 1, 3), ('Evolution I stage (T4–6)', 4, 6), ('Evolution II stage (T7–10)', 7, 10)]
def blocks():
    for title, lo, hi in STAGES:
        print('### %s\n' % title)
        for b in sorted([b for b in RO.ROSTER if lo <= b['T'] <= hi and b['role'] != 'boss'], key=lambda b: (b['T'], b['name'])):
            print('#### %s\n%s\n' % (b['name'], block(b)))
    print('### Bosses\n')
    for b in [b for b in RO.ROSTER if b['role'] == 'boss']:
        print('#### %s\n%s\n' % (b['name'], block(b)))
if __name__ == '__main__':
    {'blocks': blocks, 'table': table}[sys.argv[1]]()
