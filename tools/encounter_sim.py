"""Mutagen v0.2 encounter simulator: real builder characters vs the ch 10 roster.

Run:  python3 tools/encounter_sim.py rate  [names|all] [--n 1000]   -> BR/MR table (party of 3, 4, 5)
      python3 tools/encounter_sim.py fight "Name" L [--mode boss|minion|mixed] [--p 4] [--n 1000]
      python3 tools/encounter_sim.py scaling | budget | mixed            -> encounter-math experiments
Needs tools/sim_data/pcs.json (node tools/export_pcs.js) and tools/encounter_roster.py.

MODEL (see Current_Work.md, Enemy Calibration, for the assumptions and what they leave out)
- Party: P characters of distinct random Forms (6th = repeat), each a random legal builder character of
  the party level (sim_data/pcs.json: ch 11/13 examples + the better half of random builds).
  Fully rested: full HP, Flux 0, Medkits full, Prime rolled. Last Gasp, Emergence, Final Form OFF.
- PCs: Unleash the best Primed Surge or Signature by expected value (hit chance x damage x targets
  caught), else the best weapon attack (+ Churn as the Quick action). Never go over the Flux Limit by
  choice. Heal: Mend / Panacea / Patch a Down ally first; Stim when low. Riders on enemies are
  modelled (Dazed, Shaken, Poisoned, Blinded, Exposed, Prone/Held, Burning). Form exclusives modelled:
  Fortress, Lightning Step, Foresight, Thousand Eyes (via builder crit), Transmute, Panacea, Siren Song,
  Crown of Will, Siege Hide (via builder Armor).
- Positioning (abstract): an enemy Area attack catches its target plus each other PC with probability
  q = Q[size] x (1 + CROWD x (P - 4)), and each Down PC the same way (Down + damage = Death mark).
  Friendly fire catches each other melee enemy with probability Q[size]. PC Areas catch each extra
  enemy with probability QE[shape].
- Enemies: Guard/TN/HP/Damage from the roster; targets: Taunt > pack focus > random standing PC.
"""
import json, os, random, statistics as st, sys, math
from multiprocessing import Pool
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import encounter_roster as RO

PCS = json.load(open(os.path.join(HERE, 'sim_data', 'pcs.json')))
LIB = {}
for p in PCS: LIB.setdefault((p['form'], p['level']), []).append(p)
FORMS = ['juggernaut', 'skitter', 'oracle', 'alembic', 'siren']
Q = {'s': 0.30, 'm': 0.45, 'l': 0.65}          # chance another PC is caught (party of 4)
CROWD = 0.08                                    # +8% catch chance per PC above 4 (same rooms, more bodies)
QE = {'burst': 0.45, 'wave': 0.35, 'pulse': 0.40}  # chance another enemy is caught by a PC Area
FRICTION_PC = 0.15   # share of PC turns spent moving, closing, finding a line of sight (no attack)
FRICTION_E = 0.10    # same for enemy actions

def d20(adv=0):
    a = random.randint(1, 20)
    if adv == 0: return a
    b = random.randint(1, 20)
    return max(a, b) if adv > 0 else min(a, b)
def dice(n, s): return sum(random.randint(1, s) for _ in range(max(0, n)))
def parse(dm):
    import re
    m = re.match(r'(\d+)d(\d+)(?:\s*\+\s*(\d+))?', dm or '')
    return (int(m.group(1)), int(m.group(2)), int(m.group(3) or 0)) if m else (0, 0, 0)
def critof(line, default=20):
    import re
    m = re.search(r'Crit (\d+)', line or '')
    return int(m.group(1)) if m else default
def phit(atk, guard, adv=0, crit=20):
    need = guard - atk
    p = min(19, max(0, 21 - need)) / 20.0
    p = max(p, (21 - crit) / 20.0)
    if adv > 0: p = 1 - (1 - p) ** 2
    if adv < 0: p = p * p
    return p

# ------------------------------------------------------------------ PCs
class PC:
    def __init__(s, src):
        s.src = src; s.form = src['form']; s.L = src['level']; s.R = src['rank']
        s.max = src['hp']; s.hp = s.max; s.tmp = 0; s.armor = src['armor']; s.df = dict(src['def'])
        s.limit = src['limit']; s.flux = 0; s.nodes = set(src['nodes'])
        s.gum = src['stats']['gumption']; s.grit = src['stats']['grit']; s.chz = src['stats']['chutzpah']
        s.down = False; s.dead = False; s.marks = 0; s.everdown = 0
        s.kit = 3 * src['medkit']; s.stims = src['stim']
        s.cond = {}  # name -> True (until end of own next turn)
        s.prone = False
        s.surges = [mk_surge(x, s) for x in src['surges']]
        s.sigs = [mk_surge(x, s) for x in src['sigs']]
        s.attacks = []
        for a in src['attacks']:
            n, sz, k = parse(a['dmg'])
            if n: s.attacks.append(dict(atk=a['atk'], n=n, s=sz, k=k, crit=critof('Crit ' + str(a.get('crit', '20')).split('–')[0]), psy=a['psychic'], melee=a['melee']))
        s.wild = mk_wild(s)
        s.primed = []   # list of [surge, amped]
        s.die = src['die']; s.prime = src['prime']; s.maxp = src['maxPrimed']; s.known = len(s.surges)
        s.panacea = 'panacea' in s.nodes; s.crown = 'crownofwill' in s.nodes
        s.omen = None; s.sigused = set(); s.tauntall = 'sirensong' in s.nodes
    def standing(s): return not s.down and not s.dead
    def roll_slot(s):
        r = random.randint(1, s.die)
        if r <= s.known: return s.surges[r - 1]
        return s.wild
    def add_primed(s, sg):
        for e in s.primed:
            if e[0] is sg:
                e[1] = True; return
        if len(s.primed) < s.maxp: s.primed.append([sg, False])
    def do_prime(s):
        for _ in range(s.prime): s.add_primed(s.roll_slot())
    def gainflux(s, x):
        s.flux += x
        if s.flux > s.limit:            # Overload: Rank d6 (ignores Armor, can't drop below 1), Flux to 0
            if s.standing(): s.hp = max(1, s.hp - dice(s.R, 6))
            s.flux = 0
def mk_surge(x, pc):
    n, sz, k = parse(x['dmg'])
    sh = x['shape']; eff = x['effect']
    return dict(name=x['name'], shape=sh, eff=eff, tw=set(x['twists']), flux=x['flux'], atk=x.get('atk'), n=n, s=sz, k=k,
                crit=critof(x.get('line', '')), area=sh in ('burst', 'wave', 'pulse'), psy=eff == 'dread',
                melee=sh in ('strike', 'pulse'))
def mk_wild(pc):
    best = None
    for sg in pc.surges + pc.sigs:
        if sg['atk'] is not None and sg['n'] and not sg['area'] and (best is None or sg['n'] * sg['s'] > best['n'] * best['s']): best = sg
    if best is None:
        a = max(pc.attacks, key=lambda a: a['n'] * a['s'])
        best = dict(name='wild', shape='bolt', eff='kinetic', tw=set(), flux=1, atk=a['atk'], n=pc.R + 1, s=8, k=a['k'], crit=20, area=False, psy=False, melee=False)
    w = dict(best); w['n'] = best['n'] + 1; w['flux'] = 1; w['tw'] = set(); w['name'] = 'Wild'
    return w

# ------------------------------------------------------------------ enemies
class Foe:
    def __init__(s, spec, P):
        s.spec = spec; s.name = spec['name']
        s.guard = spec['guard']; s.tn = spec['tn']; s.max = spec['hp'] if spec.get('hp') else 1
        s.hp = s.max; s.armor = spec.get('armor', 0); s.mook = spec.get('one_hit', False)
        s.attacks = spec['attacks']; s.actions = spec.get('actions', 1)
        s.interrupts = spec.get('interrupts', 0); s.tr = dict(spec.get('traits', {}))
        s.cond = {}; s.charge = {a['n']: True for a in s.attacks}; s.shifted = False; s.gated = False
        s.enrage = 0; s.stagger = False; s.dominated = False; s.taunt = None; s.dmgbonus = 0
        s.boss = spec.get('role') == 'boss'
    def alive(s): return s.hp > 0

def standing(P): return [c for c in P if c.standing()]

class Fight:
    def __init__(s, party, foes):
        s.P = party; s.E = foes; s.np = len(party)
        s.log = dict(dmg=0); s.focus = {}
    # ---------- PC attacks an enemy
    def pc_attack(s, c, opt, tgt, adv=0, half=False):
        """resolve a damaging option (surge dict or weapon dict) vs tgt; returns hit bool"""
        if c.cond.get('shaken') or c.cond.get('blinded'): adv -= 1
        if tgt.cond.get('blinded') or ((tgt.cond.get('prone') or tgt.cond.get('held')) and opt.get('melee')): adv += 1
        if 'sure' in opt.get('tw', ()): adv += 1
        adv = max(-1, min(1, adv))
        g = tgt.guard - (2 if tgt.cond.get('exposed') else 0) + s.guard_bonus(tgt)
        r = d20(adv)
        if r + opt['atk'] < g and opt.get('flux', 0) >= 1:
            o = s.omen_holder(lambda v: v + opt['atk'] >= g)
            if o: r = o.omen; o.omen = None
        crit = r >= opt['crit']
        hit = r != 1 and (r + opt['atk'] >= g or crit)
        if not hit: return False
        n = opt['n']
        if half: n = (n + 1) // 2
        dm = dice(n, opt['s']) + opt['k'] + (dice(n, opt['s']) if crit else 0)
        if c.cond.get('poisoned'): dm //= 2
        if tgt.tr.get('vuln') and opt.get('eff') == tgt.tr['vuln']: dm *= 2
        s.damage_foe(tgt, dm, psy=opt.get('psy'), area=False, c=c)
        if 'leech' in opt.get('tw', ()): heal(c, dm // 2)
        s.rider(c, opt, tgt)
        return True
    def pc_area(s, c, opt, tgt):
        others = [e for e in s.E if e.alive() and e is not tgt and not e.dominated]
        q = QE[opt['shape']] + (0.15 if 'reach' in opt['tw'] else 0) + (0.1 if tgt.tr.get('clump') else 0)
        caught = [tgt] + [e for e in others if random.random() < q]
        base = dice(opt['n'], opt['s']) + opt['k']
        if c.cond.get('poisoned'): base //= 2
        adv = 1 if 'sure' in opt['tw'] else 0
        if c.cond.get('shaken') or c.cond.get('blinded'): adv -= 1
        for e in caught:
            g = e.guard - (2 if e.cond.get('exposed') else 0) + s.guard_bonus(e)
            r = d20(max(-1, min(1, adv)))
            hit = r != 1 and r + opt['atk'] >= g
            dm = base if hit else base // 2
            mult = (2 if e.tr.get('swarm') else 1) * (2 if e.tr.get('vuln') and opt.get('eff') == e.tr['vuln'] else 1)
            s.damage_foe(e, dm * mult, psy=opt['psy'], area=True, c=c)
            if hit: s.rider(c, opt, e)
            if 'linger' in opt['tw'] and e.alive() and random.random() < 0.5: s.damage_foe(e, 2 * c.R, psy=opt['psy'], area=True, c=c)
        return True
    def rider(s, c, opt, e):
        eff = opt.get('eff')
        if not eff or not e.alive(): return
        m = {'shock': 'dazed', 'toxin': 'poisoned', 'corrode': 'exposed', 'snare': 'held', 'quake': 'prone', 'glare': 'blinded', 'dread': 'shaken', 'blaze': 'burning'}
        k = m.get(eff)
        if k == 'prone' and e.tr.get('huge'): return
        if k: e.cond[k] = c.R if k == 'burning' else True
        if eff in ('blaze', 'corrode'): e.cond['noregen'] = True
        if 'transmute' in c.nodes and eff in ('toxin', 'corrode'): e.cond['poisoned'] = True; e.cond['exposed'] = True
    def omen_holder(s, pred):
        for p in s.P:
            if p.omen is not None and p.standing() and pred(p.omen): return p
        return None
    def guard_bonus(s, e):
        b = 0
        if e.tr.get('shieldwall'):
            b += min(e.tr['shieldwall'][1], e.tr['shieldwall'][0] * sum(1 for x in s.E if x is not e and x.alive() and x.tr.get('shieldwall') and not x.dominated))
        return b
    def damage_foe(s, e, dm, psy=False, area=False, c=None):
        if not e.alive(): return
        if not psy: dm = max(1, dm - e.armor)
        if e.tr.get('swarm') and not area: dm //= 2
        if e.tr.get('shielded') and not e.cond.get('shieldused'): dm //= 2; e.cond['shieldused'] = True
        if e.tr.get('resist_area') and area: dm //= 2
        if e.mook: e.hp = 0; s.on_death(e); return
        link = [x for x in s.E if x.alive() and x.tr.get('link') and x is not e and not x.dominated] if e.tr.get('link') else []
        if link:
            share = dm // (len(link) + 1)
            for x in link: x.hp -= share; s.check_gate(x); s.chk_dead(x)
            dm = dm - share * len(link)
        e.hp -= dm
        s.check_gate(e)
        s.chk_dead(e)
    def check_gate(s, e):
        if e.tr.get('gate') and not e.gated and e.hp < e.max // 2:
            e.hp = e.max // 2; e.gated = True; s.shift(e)
        elif e.boss and not e.shifted and e.hp <= e.max // 2 and e.hp > 0:
            s.shift(e)
    def shift(s, e):
        if e.shifted: return
        e.shifted = True
        sh = e.spec.get('shift', {})
        e.guard += sh.get('guard', 0); e.armor += sh.get('armor', 0); e.dmgbonus += sh.get('dmg', 0)
        e.interrupts += sh.get('interrupts', 0); e.actions += sh.get('actions', 0)
        if sh.get('attacks'): e.attacks = sh['attacks']; e.charge = {a['n']: True for a in e.attacks}
        if sh.get('cleanse'): e.cond = {}
        if sh.get('shake'):
            for c in standing(s.P):
                if d20() + c.df['resist'] < e.tn: c.cond['shaken'] = True
    def chk_dead(s, e):
        if e.hp <= 0 and not e.cond.get('_dead'):
            e.cond['_dead'] = True; s.on_death(e)
    def on_death(s, e):
        e.cond['_dead'] = True
        for x in s.E:
            if x.alive() and x.tr.get('enrage') and not x.dominated:
                x.enrage = min(x.enrage + 1, x.tr['enrage'][1])
        if e.tr.get('explode'):
            for c in standing(s.P):
                if random.random() < Q['s']: s.hit_pc(e, c, dict(n='Explode', d='endure', dmg=e.tr['explode'], area='s'), area=True)
    # ---------- PC turn
    def pc_turn(s, c, rnd):
        if not c.standing(): return
        if c.cond.get('burning'): s.raw_pc(c, 2 * c.cond.pop('burning'))
        if not c.standing(): return
        foes = [e for e in s.E if e.alive() and not e.dominated]
        if not foes: return
        dazed = c.cond.get('dazed')
        quick_used = False
        if c.stims and c.hp < 0.35 * c.max and not dazed:
            c.stims -= 1; heal(c, dice(c.R, 6)); quick_used = True
        acted = False; unleashed = False
        if random.random() < FRICTION_PC: acted = True     # spent the turn moving
        downs = [a for a in s.P if a.down and not a.dead]
        hurt = [a for a in standing(s.P) if a.hp < 0.4 * a.max]
        # heal first
        if c.panacea and (downs or len(hurt) >= 2):
            c.panacea = False; acted = True
            for a in s.P:
                if a.dead: continue
                if random.random() < 0.85 or a is c:
                    heal(a, dice(c.R + 1, 8) + c.gum); a.cond = {}; a.flux = max(0, a.flux - 2)
        if not acted and (downs or hurt):
            tgt = downs[0] if downs else min(hurt, key=lambda a: a.hp / a.max)
            opt = s.find_infuse(c, 'mend')
            if opt:
                s.spend(c, opt); acted = unleashed = True
                heal(tgt, dice(c.R + 1, 8) + c.gum + (c.gum if 'transmute' in c.nodes else 0)); tgt.cond.pop('poisoned', None); tgt.cond.pop('burning', None)
            elif downs and c.kit:
                c.kit -= 1; acted = True
                amt = dice(c.R, 6) + c.gum + (c.gum if 'transmute' in c.nodes else 0) if d20() + c.gum >= 10 else 1
                heal(tgt, amt)
        if not acted and c.crown and rnd <= 3:
            nb = [e for e in foes if not e.boss and e.hp > 0.5 * e.max]
            boss = [e for e in foes if e.boss]
            if (len(nb) >= 2 or boss) and c.flux + 1 <= c.limit:
                t = boss[0] if boss else max(nb, key=lambda e: e.hp)
                c.crown = False; acted = True; c.gainflux(1)
                if d20() + c.chz + c.R >= t.tn:
                    if t.boss: t.cond['dazed'] = True; t.cond['nointerrupt'] = True
                    else: t.dominated = True
        if not acted:
            best, bv = s.choose(c, foes)
            if best is not None:
                kind, opt, tgt = best
                if kind == 'weapon':
                    s.pc_attack(c, opt, tgt)
                elif kind == 'haste':
                    s.spend(c, opt); unleashed = True
                    ally = s.best_ally(c)
                    if ally:
                        a2 = max(ally.attacks, key=lambda a: a['n'] * a['s'] + a['atk'])
                        t2 = s.pick_target(ally, a2, [e for e in s.E if e.alive() and not e.dominated])
                        if t2: s.pc_attack(ally, a2, t2, adv=1)
                elif kind == 'shell':
                    s.spend(c, opt); unleashed = True
                    t = min(standing(s.P), key=lambda a: a.hp / a.max)
                    t.tmp = max(t.tmp, dice(c.R + 1, 6) + c.grit); t.cond['shell'] = True
                elif kind in ('veil', 'link'):
                    s.spend(c, opt); unleashed = True
                    if kind == 'veil': c.cond['veil'] = True
                    else:
                        for a in standing(s.P)[:c.R + 1]: a.cond['linked'] = True
                else:
                    s.spend(c, opt); unleashed = True
                    hit = s.pc_area(c, opt, tgt) if opt['area'] else s.pc_attack(c, opt, tgt, adv=1 if c.cond.pop('linked', None) else 0)
                    if not opt['area'] and not hit and opt is not None and kind == 'primed':
                        c.primed.append([opt, False])   # missed Strike/Bolt stays Primed
                    if hit and 'chain' in opt['tw'] and not opt['area']:
                        o2 = [e for e in s.E if e.alive() and e is not tgt and not e.dominated]
                        if o2: s.pc_attack(c, opt, random.choice(o2), half=True)
                    if 'lightningstep' in c.nodes and c.attacks and not quick_used and not dazed:
                        a = max(c.attacks, key=lambda a: a['n'] * a['s'] + a['atk'])
                        t2 = s.pick_target(c, a, [e for e in s.E if e.alive() and not e.dominated])
                        if t2: s.pc_attack(c, a, t2, half=True); quick_used = True
        # quick action
        if not quick_used and not dazed:
            live = [e for e in s.E if e.alive() and not e.dominated]
            if c.tauntall and live and (len(live) >= 2 or any(e.boss for e in live)):
                r = d20() + c.chz + c.R
                jug = [a for a in standing(s.P) if a.form == 'juggernaut']
                named = jug[0] if jug else c
                for e in live:
                    if random.random() < 0.8 and r >= e.tn: e.taunt = named
            elif not unleashed and not [p for p in c.primed] and c.flux + 2 <= c.limit:
                c.gainflux(1); c.add_primed(c.roll_slot())
    def spend(s, c, opt):
        for i, e in enumerate(c.primed):
            if e[0] is opt:
                c.primed.pop(i)
                if not e[1]: c.gainflux(opt['flux'] + s.jam())
                return
        c.sigused.add(id(opt)); c.gainflux(opt['flux'] + s.jam())
    def jam(s):
        return 1 if any(e.alive() and e.tr.get('jammer') and not e.dominated for e in s.E) else 0
    def find_infuse(s, c, eff):
        for e in c.primed:
            if e[0]['shape'] == 'infuse' and e[0]['eff'] == eff and (e[1] or c.flux + e[0]['flux'] + s.jam() <= c.limit): return e[0]
        for g in c.sigs:
            if g['shape'] == 'infuse' and g['eff'] == eff and id(g) not in c.sigused and c.flux + g['flux'] + s.jam() <= c.limit: return g
        return None
    def best_ally(s, c):
        al = [a for a in standing(s.P) if a is not c and a.attacks]
        return max(al, key=lambda a: max(x['n'] * x['s'] for x in a.attacks)) if al else None
    def pick_target(s, c, opt, foes):
        if not foes: return None
        avg = opt['n'] * (opt['s'] + 1) / 2 + opt['k']
        kill = [e for e in foes if e.hp <= avg]
        if kill: return max(kill, key=lambda e: (e.boss, e.hp))
        return min(foes, key=lambda e: (e.hp if not e.tr.get('link') else e.hp * 3))
    def ev(s, c, opt, tgt, foes):
        adv = (1 if 'sure' in opt.get('tw', ()) else 0) - (1 if c.cond.get('shaken') or c.cond.get('blinded') else 0)
        g = tgt.guard - (2 if tgt.cond.get('exposed') else 0) + s.guard_bonus(tgt)
        p = phit(opt['atk'], g, max(-1, min(1, adv)), opt['crit'])
        avg = opt['n'] * (opt['s'] + 1) / 2 + opt['k']
        if not opt.get('psy'): avg = max(1, avg - tgt.armor)
        if tgt.mook: avg = min(avg, 3)
        else: avg = min(avg, tgt.hp + 5)
        v = p * avg
        if opt.get('area'):
            q = QE[opt['shape']] + (0.15 if 'reach' in opt.get('tw', ()) else 0)
            n_others = len(foes) - 1
            per = avg * (p + (1 - p) * 0.5)
            if any(e.tr.get('swarm') for e in foes): per *= 2
            v = per + per * q * n_others
        if opt.get('eff') in ('shock', 'dread', 'toxin', 'glare') and not tgt.mook: v *= 1.15
        if 'chain' in opt.get('tw', ()) and len(foes) > 1: v *= 1.4
        return v
    def choose(s, c, foes):
        opts = []
        jam = s.jam()
        for e in c.primed:
            sg = e[0]
            cost = 0 if e[1] else sg['flux'] + jam
            if c.flux + cost > c.limit: continue
            opts.append(('primed', sg, cost))
        for g in c.sigs:
            if id(g) in c.sigused: continue
            cost = g['flux'] + jam
            if c.flux + cost > c.limit: continue
            opts.append(('sig', g, cost))
        best = None; bv = -1
        wbest = None
        for a in c.attacks:
            t = s.pick_target(c, a, foes)
            v = s.ev(c, dict(a, tw=()), t, foes)
            if v > bv: bv = v; best = ('weapon', a, t); wbest = v
        wv = bv
        for kind, sg, cost in opts:
            if sg['shape'] == 'infuse':
                eff = sg['eff']
                if eff == 'haste':
                    al = s.best_ally(c)
                    if al:
                        a2 = max(al.attacks, key=lambda a: a['n'] * a['s'] + a['atk'])
                        t2 = s.pick_target(al, a2, foes); v = s.ev(al, dict(a2, tw=('sure',)), t2, foes) * 0.95
                        if v - 0.3 * cost * c.R > bv: bv = v; best = ('haste', sg, None)
                elif eff == 'shell':
                    low = min(standing(s.P), key=lambda a: a.hp / a.max)
                    if low.hp < 0.5 * low.max:
                        v = (c.R + 1) * 3.5 * 0.6
                        if v > bv: bv = v; best = ('shell', sg, None)
                elif eff == 'link' and len(standing(s.P)) >= 3:
                    v = 0.15 * wv * min(c.R + 1, len(standing(s.P)) - 1) * 2
                    if v > bv: bv = v; best = ('link', sg, None)
                continue
            if sg['atk'] is None or not sg['n']: continue
            t = s.pick_target(c, sg, foes)
            v = s.ev(c, sg, t, foes) - 0.25 * cost * c.R    # Flux is a cost
            if v > bv: bv = v; best = (kind, sg, t)
        return best, bv
    # ---------- enemies act
    def raw_pc(s, c, dm):
        if c.tmp: x = min(c.tmp, dm); c.tmp -= x; dm -= x
        c.hp -= dm
        if c.hp <= 0 and not c.down:
            c.hp = 0; c.down = True; c.everdown += 1; c.cond = {}
    def hit_pc(s, e, c, a, area=False, adv=0, boss=False, extra=0):
        """one attack (or one area instance) against one PC; returns damage dealt"""
        if c.dead: return 0
        dfn = a['d'] if a['d'] != 'mix' else random.choice(('dodge', 'endure', 'resist'))
        stat = c.df[dfn]
        if c.cond.get('exposed'): stat -= 2
        if c.cond.get('veil'): adv -= 1
        if c.cond.get('prone') and a.get('melee', True): adv += 1
        if e.cond.get('shaken') or e.cond.get('blinded'): adv -= 1
        if a.get('adv'): adv += 1
        tn = e.tn + a.get('tnb', 0)
        alone = e.tr.get('apex') and not any(x is not e and x.alive() and not x.dominated for x in s.E)
        if alone: tn += e.tr['apex'][0] if isinstance(e.tr['apex'], tuple) else 2
        if e.taunt is not None and e.taunt is c and any(p.tauntall for p in standing(s.P)): tn -= 2
        r = d20(-max(-1, min(1, adv)))     # enemy advantage = PC disadvantage
        ok = r != 1 and r + stat >= tn          # builder defenses already include Rank
        if not ok and not c.down and (a['dmg'] + extra) >= 0.2 * c.max:
            o = s.omen_holder(lambda v: v + stat >= tn)
            if o: ok = True; o.omen = None
        dmg = a['dmg'] + extra + e.dmgbonus + e.enrage * (e.tr.get('enrage', (0, 0))[0]) + s.leader_bonus(e)
        if alone: dmg = int(dmg * (e.tr['apex'][1] if isinstance(e.tr['apex'], tuple) else 1.5))
        if e.cond.get('poisoned'): dmg //= 2
        if c.down:
            if area or not ok:
                c.marks += 2 if (boss and not ok) else 1
                if c.marks >= 3: c.dead = True
            return 0
        if ok and not area: return 0
        if ok and area: dmg //= 2
        if area and any(p.standing() and 'fortress' in p.nodes and p is not c for p in s.P) and random.random() < 0.5: dmg //= 2
        if not a.get('psy'): dmg = max(1, dmg - c.armor - (1 if c.cond.get('shell') else 0))
        # Fortress reaction: take a would-be-Down hit
        if dmg >= c.hp + c.tmp:
            for p in s.P:
                if p is not c and p.standing() and 'fortress' in p.nodes and not p.cond.get('fortused') and p.hp > dmg + 0.3 * p.max:
                    p.cond['fortused'] = True; s.raw_pc(p, max(1, dmg - p.armor)); return 0
        s.raw_pc(c, dmg); s.log['dmg'] += dmg
        if not ok:
            rd = a.get('rider')
            if rd == 'purge' and c.primed: c.primed.pop(random.randrange(len(c.primed)))
            elif rd == 'flux2': c.gainflux(2)
            elif rd: c.cond[rd] = (e.spec['T'] + 1) // 2 if rd == 'burning' else True
            if e.tr.get('mutagenic'): c.gainflux(e.tr['mutagenic'])
            if e.tr.get('purger') and c.primed: c.primed.pop(random.randrange(len(c.primed)))
        return dmg
    def leader_bonus(s, e):
        b = 0
        for x in s.E:
            if x is not e and x.alive() and x.tr.get('leader') and not x.dominated: b = max(b, x.tr['leader'])
        return b
    def enemy_target(s, e, a):
        st_ = standing(s.P)
        if not st_: return None
        if e.taunt is not None and e.taunt.standing(): return e.taunt
        if e.tr.get('pack') or e.tr.get('overwhelm') or e.tr.get('flank'):
            ft = s.focus.get('pack')
            if ft is None or not ft.standing():
                ft = min(st_, key=lambda c: c.hp + random.random() * 10) if random.random() < 0.6 else random.choice(st_)
                s.focus['pack'] = ft
            return ft
        if e.boss or e.tr.get('smart'):
            if random.random() < 0.5: return min(st_, key=lambda c: c.hp)
        return random.choice(st_)
    def enemy_action(s, e, interrupt=False):
        if not e.alive() or not standing(s.P): return
        if random.random() < FRICTION_E: return
        if e.dominated:
            o = [x for x in s.E if x.alive() and x is not e and not x.dominated]
            if o:
                a = e.attacks[0]; t = random.choice(o)
                s.damage_foe(t, a['dmg'], c=None)
            return
        if e.tr.get('heal') and not interrupt:
            hurt = [x for x in s.E if x.alive() and not x.mook and x is not e and x.hp < 0.6 * x.max and not x.dominated]
            if hurt:
                t = min(hurt, key=lambda x: x.hp / x.max); t.hp = min(t.max, t.hp + e.tr['heal']); return
        if e.tr.get('territorial') and not interrupt:
            rivals = [x for x in s.E if x is not e and x.alive() and x.tr.get('territorial') and not x.dominated]
            if rivals and random.random() < e.tr['territorial']:
                sa = [x for x in e.attacks if not x.get('area') and not x.get('summon')]
                s.damage_foe(random.choice(rivals), (sa or e.attacks)[0]['dmg']); return
        a = s.pick_attack(e)
        if a is None: return
        if a.get('summon'):
            if a.get('recharge'): e.charge[a['n']] = False
            tmpl, cnt, mx = a['summon']
            cur = sum(1 for x in s.E if x.alive() and x.name == tmpl)
            for _ in range(min(cnt, mx - cur)): s.E.append(Foe(a['tmpl'] if a.get('tmpl') else RO.BY_NAME[tmpl], s.np))
            return
        tgt = s.enemy_target(e, a)
        if tgt is None: return
        if a.get('area'):
            if a.get('recharge'): e.charge[a['n']] = False
            if e.tr.get('interference'): s.focus['interf'] = True
            q = min(0.95, Q[a['area']] * (1 + CROWD * (s.np - 4)))
            caught = [tgt] + [c for c in s.P if c is not tgt and not c.dead and random.random() < q]
            extra = a.get('extra', 0) * (sum(1 for c in caught if c.standing()) - 1)
            for c in caught: s.hit_pc(e, c, a, area=True, boss=e.boss, extra=extra)
            if a.get('ff'):
                for x in s.E:
                    if x is not e and x.alive() and not x.dominated and x.spec.get('melee', True) and random.random() < Q[a['area']]:
                        s.damage_foe(x, a['dmg'], area=True)
            if a.get('stagger'): e.stagger = True
        else:
            adv = 0
            if e.tr.get('mimic') and not getattr(e, 'mimicked', False): adv = 1; e.mimicked = True
            if e.tr.get('flank'):
                n = sum(1 for x in s.E if x is not e and x.alive() and x.tr.get('flank') and not x.dominated)
                if n >= 1: adv = 1
            extra = 0
            if e.tr.get('pack'):
                k = s.focus.setdefault(('packhits', id(tgt)), 0)
                bonus = min(k, e.tr['pack'][2])
                extra += e.tr['pack'][1] * bonus
                a = dict(a, tnb=e.tr['pack'][0] * bonus)
                s.focus[('packhits', id(tgt))] = k + 1
            if e.tr.get('crowd'):
                extra += min(e.tr['crowd'][1], e.tr['crowd'][0] * sum(1 for x in s.E if x is not e and x.alive() and not x.dominated))
            if adv == 0 and e.tr.get('flank'):
                n = sum(1 for x in s.E if x is not e and x.alive() and x.tr.get('flank') and not x.dominated)
                if n >= 1: adv = 1
            s.hit_pc(e, tgt, a, adv=adv, boss=e.boss, extra=extra)
            if a.get('multi'):      # separate Single attacks on other standing creatures in reach
                others = [c for c in standing(s.P) if c is not tgt]
                random.shuffle(others)
                for c in others[:a['multi'] - 1]: s.hit_pc(e, c, a, adv=adv, boss=e.boss)
            if e.tr.get('overwhelm'):
                k = s.focus.setdefault(('ow', id(tgt)), 0) + 1; s.focus[('ow', id(tgt))] = k
                if k >= e.tr['overwhelm'] and tgt.standing(): tgt.cond['prone'] = True; tgt.cond['held'] = True
    def pick_attack(s, e):
        ats = [a for a in e.attacks if not (a.get('recharge') and not e.charge[a['n']])]
        if e.cond.get('dazed'): ats = [a for a in ats if not a.get('special')]
        area = [a for a in ats if a.get('area')]
        single = [a for a in ats if not a.get('area') and not a.get('summon')]
        summ = [a for a in ats if a.get('summon')]
        if summ:
            tmpl, cnt, mx = summ[0]['summon']
            if sum(1 for x in s.E if x.alive() and x.name == tmpl) < summ[0].get('below', 2) and random.random() < 0.6: return summ[0]
        if area:
            a = area[0]; ok = True
            if e.tr.get('interference') and s.focus.get('interf'): ok = False
            if e.tr.get('bulky'):
                allies = sum(1 for x in s.E if x is not e and x.alive() and not x.dominated and not x.mook)
                if random.random() < 1 - (1 - e.tr['bulky']) ** allies: ok = False
            ns = len(standing(s.P))
            if a.get('careful'):
                allies = sum(1 for x in s.E if x is not e and x.alive() and x.spec.get('melee', True) and not x.dominated)
                if allies * Q[a['area']] >= 0.9: ok = False
            if ok and (ns >= 2 or not single): return a
        if single: return random.choice(single) if len(single) > 1 else single[0]
        return area[0] if area else None
    def enemy_phase(s):
        s.focus = {}
        for e in list(s.E):
            if not e.alive(): continue
            if e.boss:   # a Boss ends one condition on itself each Enemy Phase
                for k in ('dazed', 'held', 'shaken', 'blinded', 'poisoned', 'exposed', 'prone', 'burning'):
                    if e.cond.pop(k, None): break
            if e.cond.get('burning'): s.damage_foe(e, 2 * e.cond['burning'], area=True)
            if not e.alive(): continue
            if e.tr.get('regen') and not e.cond.get('noregen'): e.hp = min(e.max, e.hp + e.tr['regen'])
            if e.tr.get('surrender') and e.hp <= e.max // 2 and random.random() < 0.5:
                e.hp = 0; e.cond['_dead'] = True; continue
            if e.stagger: e.stagger = False; continue
            held = e.cond.get('held') and e.spec.get('melee', True)
            n = e.actions
            for _ in range(n):
                if held and random.random() < 0.5: continue
                s.enemy_action(e)
            for a in e.attacks:
                if a.get('recharge') and not e.charge[a['n']] and random.randint(1, 6) >= a['recharge']: e.charge[a['n']] = True
        for e in s.E:   # conditions applied in the Player Phase end now; Bosses end one more
            e.taunt = None
            e.cond = {k: v for k, v in e.cond.items() if k == '_dead'}
        # Down PCs: Endure DC 10
        for c in s.P:
            if c.down and not c.dead:
                r = d20()
                if r == 20: c.down = False; c.hp = 1
                elif r + c.df['endure'] < 10:
                    c.marks += 1
                    if c.marks >= 3: c.dead = True
    def interrupt(s):
        for e in s.E:
            if e.alive() and e.interrupts and not e.dominated and not e.cond.get('nointerrupt') and not e.cond.get('dazed') and e.cond.get('_int', 0) < e.interrupts:
                e.cond['_int'] = e.cond.get('_int', 0) + 1
                s.enemy_action(e, interrupt=True)
    def run(s, maxr=15):
        for c in s.P: c.do_prime()
        first_enemy = random.random() < 0.5
        rnd = 0
        while rnd < maxr:
            rnd += 1
            for c in s.P:
                c.sigused = set(); c.cond.pop('fortused', None); c.cond.pop('veil', None); c.cond.pop('shell', None)
                c.omen = random.randint(1, 20) if 'foresight' in c.nodes and c.standing() else None
            if not (first_enemy and rnd == 1):
                order = s.P[:]; random.shuffle(order)
                for c in order:
                    s.pc_turn(c, rnd)
                    if c.standing():
                        for k in ('shaken', 'poisoned', 'blinded', 'dazed', 'exposed', 'prone', 'held'): c.cond.pop(k, None)
                    s.interrupt()
                    if not any(e.alive() and not e.dominated for e in s.E): break
            if not any(e.alive() and not e.dominated for e in s.E): break
            s.enemy_phase()
            if not standing(s.P): break
            if first_enemy and rnd == 1:
                order = s.P[:]; random.shuffle(order)
                for c in order:
                    s.pc_turn(c, rnd)
                    if c.standing():
                        for k in ('shaken', 'poisoned', 'blinded', 'dazed', 'exposed', 'prone', 'held'): c.cond.pop(k, None)
                    s.interrupt()
                if not any(e.alive() and not e.dominated for e in s.E): break
        win = not any(e.alive() and not e.dominated for e in s.E) and bool(standing(s.P))
        tot = sum(c.max for c in s.P)
        lost = sum(c.max - (c.hp if c.standing() else 0) for c in s.P) / tot
        return dict(win=win, rounds=rnd, lost=lost, down=any(c.everdown for c in s.P), downs=sum(c.everdown for c in s.P),
                    death=any(c.dead for c in s.P), deaths=sum(c.dead for c in s.P))
def heal(c, x):
    if c.dead or x <= 0: return
    if c.down: c.down = False; c.hp = 0
    c.hp = min(c.max, c.hp + x)

def make_party(L, P):
    forms = random.sample(FORMS, min(P, 5)) + random.sample(FORMS, max(0, P - 5))
    return [PC(random.choice(LIB[(f, L)])) for f in forms]
def make_foes(enc, P):
    out = []
    for spec, cnt in enc:
        if isinstance(spec, str): spec = RO.BY_NAME[spec]
        out += [Foe(spec, P) for _ in range(cnt)]
    return out
def resolve(enc):
    return [(RO.BY_NAME[x] if isinstance(x, str) else x, n) for x, n in enc]
def one(args):
    L, enc, P, seed = args
    random.seed(seed)
    return Fight(make_party(L, P), make_foes(enc, P)).run()
POOL = None
def sim(L, enc, P=4, n=1000, seed=1):
    global POOL
    if POOL is None: POOL = Pool(os.cpu_count())
    enc = resolve(enc)
    res = POOL.map(one, [(L, enc, P, seed * 100003 + i) for i in range(n)], chunksize=50)
    return dict(win=st.mean(r['win'] for r in res), rounds=st.mean(r['rounds'] for r in res), lost=st.mean(r['lost'] for r in res),
                down=st.mean(r['down'] for r in res), downs=st.mean(r['downs'] for r in res), death=st.mean(r['death'] for r in res))

# ------------------------------------------------------------------ ratings
BAND = dict(down=(0.40, 0.60), win=0.90, death=0.05, rounds=(3, 7))
def curve(spec, mode, P=4, n=1000, levels=range(1, 11), seed=1, count=None):
    k = count or (1 if mode == 'boss' else 4)
    return {L: sim(L, [(spec, k)], P, n, seed=seed + L) for L in levels}
def target_for(P):
    """same per-freelancer danger at every party size: P(>=1 Down) = 50% for 4 PCs"""
    return 1 - 0.5 ** (P / 4.0)
def crossing(cv, key, target, invert=False):
    """fractional party level where metric (danger, falling with level) crosses target"""
    Ls = sorted(cv)
    xs = [(1 - cv[L][key]) if invert else cv[L][key] for L in Ls]
    if xs[0] < target:
        sl = max(0.05 * (target if target < 0.2 else 1), xs[0] - xs[1]) if len(xs) > 1 else 0.1
        return max(-2.0, Ls[0] - (target - xs[0]) / sl)
    for i in range(len(Ls) - 1):
        if xs[i] >= target >= xs[i + 1]:
            return Ls[i] + (xs[i] - target) / max(1e-9, xs[i] - xs[i + 1])
    sl = max(0.01, xs[-2] - xs[-1]) if len(xs) > 1 else 0.1
    return min(13.0, Ls[-1] + (xs[-1] - target) / sl)
def rating(cv, key='down', target=0.5, parts=False):
    """BR/MR: the lowest party level at which the fight is inside EVERY fairness ceiling:
    P(>=1 Down) <= target (50% for 4 PCs), P(any death) <= 5%, party win rate >= 90%."""
    rd = crossing(cv, 'down', target); rx = crossing(cv, 'death', BAND['death']); rw = crossing(cv, 'win', 1 - BAND['win'], invert=True)
    r = max(rd, rx, rw)
    return (r, dict(down=rd, death=rx, win=rw)) if parts else r
def fmt_r(x):
    if x < 0.5: return '<1'
    if x < 0.75: return '½'
    if x > 10.5: return '10+'
    return str(int(round(x)))

def rate_one(spec, sizes=(3, 4, 5), n=1000, seed=1):
    out = {}
    for mode in ('boss', 'minion'):
        for P in sizes:
            cv = curve(spec, mode, P, n, seed=seed)
            out[(mode, P)] = (rating(cv, target=target_for(P)), cv)
    return out
def band_at(cv, r):
    """fight metrics at the integer level nearest the rating (clipped to 1-10)"""
    L = min(10, max(1, int(round(r))))
    return L, cv[L]
def write_csv(rows, path):
    import csv
    with open(path, 'w', newline='') as f:
        w = csv.writer(f); w.writerow(['creature', 'mode', 'party', 'level', 'win', 'rounds', 'hp_lost', 'down_any', 'downs', 'death_any'])
        for name, res in rows:
            for (mode, P), (r, cv) in res.items():
                for L, m in sorted(cv.items()):
                    w.writerow([name, mode, P, L, '%.3f' % m['win'], '%.2f' % m['rounds'], '%.3f' % m['lost'], '%.3f' % m['down'], '%.2f' % m['downs'], '%.3f' % m['death']])
if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd'); ap.add_argument('names', nargs='?', default='all')
    ap.add_argument('--n', type=int, default=1000); ap.add_argument('--seed', type=int, default=1)
    ap.add_argument('--out', default=''); ap.add_argument('--sizes', default='3,4,5')
    A = ap.parse_args()
    if A.cmd == 'rate':
        names = [b['name'] for b in RO.ROSTER] if A.names == 'all' else A.names.split('|')
        sizes = tuple(int(x) for x in A.sizes.split(','))
        rows = []
        print('| Creature | T | Kind | BR (3/4/5) | MR (3/4/5) | BR fight @L: down / lost / rounds / win / death | MR fight @L |')
        print('|---|---|---|---|---|---|---|')
        for nm in names:
            sp = RO.BY_NAME[nm]; res = rate_one(sp, sizes, A.n, A.seed); rows.append((nm, res))
            def cell(mode):
                r, cv = res[(mode, 4)] if (mode, 4) in res else res[(mode, sizes[0])]
                L, m = band_at(cv, r)
                return 'L%d: %.0f%% / %.0f%% / %.1f / %.0f%% / %.1f%%' % (L, 100 * m['down'], 100 * m['lost'], m['rounds'], 100 * m['win'], 100 * m['death'])
            print('| %s | %d | %s | %s | %s | %s | %s |' % (nm, sp['T'], sp.get('kind', ''),
                  ' / '.join('%.1f' % res[('boss', P)][0] for P in sizes), ' / '.join('%.1f' % res[('minion', P)][0] for P in sizes),
                  cell('boss'), cell('minion')), flush=True)
        if A.out: write_csv(rows, A.out)
