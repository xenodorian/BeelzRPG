"""Encounter-building experiments on top of encounter_sim (writes tools/sim_results/*).
  python3 tools/encounter_math.py final      -> 04_ratings_final.md/.csv  (party 2-6)
  python3 tools/encounter_math.py steps      -> 05_rating_step_value.md   (how many MR-R creatures make a fair fight at level L)
  python3 tools/encounter_math.py budget     -> 06_difficulty_sweep.md    (danger vs budget multiple)
  python3 tools/encounter_math.py mixed      -> 07_mixed_validation.md    (rule-built encounters at party 3/4/5)"""
import sys, os, json, random, statistics as st
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import encounter_sim as S, encounter_roster as RO
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sim_results')
SIZES = (2, 3, 4, 5, 6)
def final(n=1000):
    rows = []; lines = ['| Creature | Kind | T | ' + ' | '.join('BR p%d' % P for P in SIZES) + ' | ' + ' | '.join('MR p%d' % P for P in SIZES) + ' |',
                        '|---|---|---|' + '---|' * (2 * len(SIZES))]
    R = {}
    for b in RO.ROSTER:
        res = S.rate_one(b, SIZES, n); rows.append((b['name'], res)); R[b['name']] = {('%s%d' % (m[0], P)): round(v[0], 2) for (m, P), v in res.items()}
        lines.append('| %s | %s | %d | %s | %s |' % (b['name'], b['kind'], b['T'], ' | '.join('%.1f' % res[('boss', P)][0] for P in SIZES),
                     ' | '.join('%.1f' % res[('minion', P)][0] for P in SIZES)))
        print(lines[-1], flush=True)
    open(os.path.join(OUT, '04_ratings_final.md'), 'w').write('# Final ratings by party size (1,000 fights per level per cell; fair = per-PC Down risk of a 4-PC 50%% fight, death <= 5%%, win >= 90%%)\n\n' + '\n'.join(lines) + '\n')
    S.write_csv(rows, os.path.join(OUT, '04_ratings_final.csv'))
    json.dump(R, open(os.path.join(OUT, '04_ratings_final.json'), 'w'), indent=1)
def fair_count(L, spec, P=4, n=800, lo=1, hi=16):
    """smallest count (fractional, interpolated) of spec that reaches the fair danger for party P at level L"""
    tgt = S.target_for(P); prev = None
    for k in range(lo, hi + 1):
        m = S.sim(L, [(spec, k)], P, n, seed=k + 7 * L)
        fair = m['down'] >= tgt or m['death'] > 0.05 or m['win'] < 0.90
        if fair:
            if prev is None: return float(k)
            d0 = prev['down']; d1 = m['down']
            return k - 1 + max(0, min(1, (tgt - d0) / max(1e-6, d1 - d0)))
        prev = m
    return float('inf')
def steps():
    lines = ['| Party level | Soldier T (MR≈T) | rating gap (T − L) | creatures for a fair fight |', '|---|---|---|---|']
    data = []
    for L in (2, 3, 5, 6, 8, 9):
        for dT in (-3, -2, -1, 0, 1):
            T = L + dT
            if T < 1 or T > 12: continue
            k = fair_count(L, RO.threat(T, 'soldier', d='mix'))
            data.append((L, dT, k)); lines.append('| %d | %d | %+d | %.1f |' % (L, T, dT, k)); print(lines[-1], flush=True)
    # fit: count = 4 * K^(-gap)
    import math
    pts = [(dT, math.log(k / 4)) for L, dT, k in data if k != float('inf') and k > 0]
    num = sum(-x * y for x, y in pts); den = sum(x * x for x, y in pts)
    K = math.exp(num / den) if den else 1
    lines.append(''); lines.append('Least-squares fit: creatures needed = 4 × %.2f^(L − rating), i.e. each rating step is worth ×%.2f.' % (K, K))
    open(os.path.join(OUT, '05_rating_step_value.md'), 'w').write('# Value of a rating step\n\n' + '\n'.join(lines) + '\n'); print(lines[-1])
def budget():
    """danger vs. encounter size, for plain Soldiers and three roster mixes; budget multiple = count / fair count"""
    lines = ['| Party L | Encounter | budget × | Down ≥1 | HP lost | win | death | rounds |', '|---|---|---|---|---|---|---|---|']
    for L in (2, 5, 8):
        sp = RO.threat(L, 'soldier', d='mix')
        for k in (1, 2, 3, 4, 5, 6, 7, 8):
            m = S.sim(L, [(sp, k)], 4, 1500, seed=k)
            lines.append('| %d | %d T%d Soldiers | %.2f | %.0f%% | %.0f%% | %.0f%% | %.1f%% | %.1f |' % (L, k, L, k / 4, 100 * m['down'], 100 * m['lost'], 100 * m['win'], 100 * m['death'], m['rounds']))
            print(lines[-1], flush=True)
    open(os.path.join(OUT, '06_difficulty_sweep.md'), 'w').write('# Difficulty sweep (4 PCs, fully rested)\n\n' + '\n'.join(lines) + '\n')

def party():
    lines = ['| Party L | PCs | T-L Soldiers for a fair fight | per PC |', '|---|---|---|---|']
    for L in (2, 5, 8):
        sp = RO.threat(L, 'soldier', d='mix')
        for P in SIZES:
            k = fair_count(L, sp, P=P)
            lines.append('| %d | %d | %.2f | %.2f |' % (L, P, k, k / P)); print(lines[-1], flush=True)
    open(os.path.join(OUT, '08_party_size_budget.md'), 'w').write('# Fair encounter size by party size (Soldiers, MR = L)\n\n' + '\n'.join(lines) + '\n')

def units(R, L, solo):
    return (4.0 if solo else 1.0) * 2 ** ((R - L) / 2.0)

def mixed(n=1000, trials=60):
    R = json.load(open(os.path.join(OUT, '04_ratings_final.json')))
    by = {b['name']: b for b in RO.ROSTER}
    rng = random.Random(5); lines = ['| L | PCs | Encounter | units (rule) | Down ≥1 | target | death | win | rounds |', '|---|---|---|---|---|---|---|---|---|']
    errs = {}
    for t in range(trials):
        L = rng.randint(1, 10); P = rng.choice((3, 4, 5)); mult = rng.choice((0.75, 1.0, 1.0, 1.25))
        budget = 4.0 * P / 4 * mult
        pool = [nm for nm in by if 1 <= R[nm]['m4'] and abs(R[nm]['m4'] - L) <= 3 and by[nm]['role'] != 'boss']
        enc = {}; tot = 0
        big = [nm for nm in by if by[nm]['role'] in ('boss', 'elite', 'brute') and abs(R[nm]['b4'] - L) <= 1.5]
        if big and rng.random() < 0.5:      # a centrepiece valued by its BR (E8: BR-N creature = 4 units at level N)
            nm = rng.choice(big); u = units(R[nm]['b4'], L, True)
            if u <= budget * 1.1: enc[nm] = 1; tot += u
            if nm in pool: pool.remove(nm)
        while pool:
            nm = rng.choice(pool); u = units(R[nm]['m4'], L, False)
            if tot + u > budget * 1.1: 
                pool.remove(nm); continue
            enc[nm] = enc.get(nm, 0) + 1; tot += u
            if tot >= budget * 0.9: break
        if not enc or (sum(enc.values()) < 2 and not any(by[x]['role'] in ('boss', 'elite', 'brute') for x in enc)): continue
        m = S.sim(L, [(by[nm], k) for nm, k in enc.items()], P, n, seed=t)
        tgt = 1 - (1 - {0.75: 0.20, 1.0: 0.5, 1.25: 0.75}[mult]) ** (P / 4)
        errs.setdefault((P, mult), []).append(m['down'] - tgt)
        lines.append('| %d | %d | %s | %.2f (×%.2f) | %.0f%% | %.0f%% | %.1f%% | %.0f%% | %.1f |' % (L, P, ', '.join('%d %s' % (k, nm) for nm, k in enc.items()), tot, mult, 100 * m['down'], 100 * tgt, 100 * m['death'], 100 * m['win'], m['rounds']))
        print(lines[-1], flush=True)
    lines += ['', '| PCs | budget × | fights | mean (Down − target) |', '|---|---|---|---|']
    for (P, mult), e in sorted(errs.items()):
        lines.append('| %d | %.2f | %d | %+.0f pts |' % (P, mult, len(e), 100 * st.mean(e)))
    open(os.path.join(OUT, '07_mixed_validation.md'), 'w').write('# Mixed-encounter validation (budget rule: fair = P units, MR-R creature = 2^((R-L)/2) units, using MR for party of 4)\n\n' + '\n'.join(lines) + '\n')

# ------------------------------------------------------------------ threat-builder adjustments (09_builder_traits.md)
def variant(T, role, traits=None, area=None, extra=0, ff=False, recharge=None, armor=0, rider=None, d='mix', label=''):
    """a threat-builder creature: table row x Role, plus Traits scaled exactly like encounter_roster.mk"""
    b = RO.threat(T, role, name=label or 'T%d %s' % (T, role), d=d, rider=rider)
    b['armor'] = armor; B = RO.BONUS[T]
    a = b['attacks'][0]
    if area:
        heavy = dict(a, n='Area', area=area, extra=max(1, round(B * extra)) if extra else 0, ff=ff, recharge=recharge, special=True)
        single = dict(a, n='Single', dmg=int(round(a['dmg'] * 0.4)))
        b['attacks'] = [heavy, single] if recharge or ff else [heavy]
        if not (recharge or ff): b['attacks'] = [dict(a, area=area)]
    tr = {}
    for k, v in (traits or {}).items():
        if k == 'pack': tr[k] = (1, B * v, 3)
        elif k == 'enrage': tr[k] = (B * v, 3)
        elif k == 'leader': tr[k] = B * v
        elif k == 'crowd': tr[k] = (B * v, 3 * B * v)
        elif k in ('heal', 'regen'): tr[k] = int(round(RO.HP[T] * v))
        elif k == 'explode': tr[k] = int(round(RO.DMG[T] * v))
        else: tr[k] = v
    b['traits'] = tr
    return b
VARIANTS = [
    ('(base)', {}), ('Armored', dict(armor=2)), ('Pack', dict(traits={'pack': 1})), ('Flanker', dict(traits={'flank': True})),
    ('Overwhelm', dict(traits={'overwhelm': 3})), ('Crowd', dict(traits={'crowd': 0.5})), ('Linked', dict(traits={'link': True})),
    ('Shieldwall', dict(traits={'shieldwall': (1, 2)})), ('Leader', dict(traits={'leader': 1})), ('Frenzy', dict(traits={'enrage': 1})),
    ('Mender', dict(traits={'heal': 0.25})), ('Regenerating', dict(traits={'regen': 0.1})), ('Mutagenic 1', dict(traits={'mutagenic': 1})),
    ('Purger', dict(traits={'purger': True})), ('Jammer', dict(traits={'jammer': True})), ('Explosive', dict(traits={'explode': 0.5})),
    ('Mimic', dict(traits={'mimic': True})), ('Hunter (smart)', dict(traits={'smart': True})), ('Shielded', dict(traits={'shielded': True})),
    ('Swarm', dict(traits={'swarm': True})), ('Cowardly (surrender)', dict(traits={'surrender': True})), ('Shocking (Dazed rider)', dict(rider='dazed')),
    ('Area 10 ft (artillery)', dict(area='s')), ('Area 20 ft', dict(area='m')),
    ('Heavy: Area 20 ft + Engulf 2 + Friendly fire + Recharge 4', dict(area='m', extra=2, ff=True, recharge=4)),
    ('Heavy + Apex', dict(area='m', extra=2, ff=True, recharge=4, traits={'apex': True})),
    ('Heavy + Apex + Bulky', dict(area='m', extra=2, ff=True, recharge=4, traits={'apex': True, 'bulky': 0.5})),
    ('Heavy + Apex + Bulky + Interference', dict(area='m', extra=2, ff=True, recharge=4, traits={'apex': True, 'bulky': 0.5, 'interference': True})),
]
def builder(n=1000, T=5):
    lines = ['# Threat-builder calibration (T%d; ratings for 4 PCs, %d fights per level per mode)' % (T, n), '',
             '## Roles (no Traits), at T2 / T5 / T8', '', '| Role | BR T2 | MR T2 | BR T5 | MR T5 | BR T8 | MR T8 | mean BR − T | mean MR − T |', '|---|---|---|---|---|---|---|---|---|']
    out = {}
    for role in RO.ROLE:
        rs = []
        for t in (2, 5, 8):
            sp = variant(t, role, area='s' if role == 'artillery' else None)
            rs.append((S.rating(S.curve(sp, 'boss', 4, n, seed=t)), S.rating(S.curve(sp, 'minion', 4, n, seed=t))))
        mb = st.mean(r[0] - t for r, t in zip(rs, (2, 5, 8))); mm = st.mean(r[1] - t for r, t in zip(rs, (2, 5, 8)))
        out[role] = (mb, mm)
        lines.append('| %s | %s | %+.1f | %+.1f |' % (role, ' | '.join('%.1f | %.1f' % r for r in rs), mb, mm)); print(lines[-1], flush=True)
    lines += ['', '## Traits on a T%d Soldier (Heavy rows on a T%d Brute)' % (T, T), '', '| Trait | BR | MR | ΔBR | ΔMR | Δ(MR − BR) |', '|---|---|---|---|---|---|']
    base = {}
    for nm, kw in VARIANTS:
        role = 'brute' if nm.startswith('Heavy') else 'soldier'
        sp = variant(T, role, label=nm, **kw)
        br = S.rating(S.curve(sp, 'boss', 4, n, seed=11)); mr = S.rating(S.curve(sp, 'minion', 4, n, seed=11))
        if nm == '(base)': base['soldier'] = (br, mr)
        if role == 'brute' and 'brute' not in base:
            sb = variant(T, 'brute'); base['brute'] = (S.rating(S.curve(sb, 'boss', 4, n, seed=11)), S.rating(S.curve(sb, 'minion', 4, n, seed=11)))
            lines.append('| (base Brute) | %.1f | %.1f | | | |' % base['brute'])
        b0 = base[role]
        lines.append('| %s | %.1f | %.1f | %+.1f | %+.1f | %+.1f |' % (nm, br, mr, br - b0[0], mr - b0[1], (mr - br) - (b0[1] - b0[0]))); print(lines[-1], flush=True)
    open(os.path.join(OUT, '09_builder_traits.md'), 'w').write('\n'.join(lines) + '\n')


def stage(L): return 0 if L <= 3 else (1 if L <= 6 else 2)
def mixed2(n=1000, trials=180):
    """v2 (the published rule): same-stage creatures only, MR within ±2 of L, big creatures by BR within ±1;
    budget = P units x difficulty; a creature of rating R at party level L = 2^((R-L)/2) units (x4 when valued by BR)."""
    R = json.load(open(os.path.join(OUT, '04_ratings_final.json')))
    by = {b['name']: b for b in RO.ROSTER}
    rng = random.Random(9); lines = ['| L | PCs | Encounter | units | Down ≥1 | target | HP lost | death | win | rounds |', '|---|---|---|---|---|---|---|---|---|---|']
    errs = {}; TG = {0.5: 0.05, 0.75: 0.20, 1.0: 0.5, 1.25: 0.75}
    for t in range(trials):
        L = rng.randint(1, 10); P = rng.choice((3, 4, 5)); mult = rng.choice((0.5, 0.75, 1.0, 1.25))
        budget = P * mult
        pool = [nm for nm in by if by[nm]['role'] != 'boss' and abs(R[nm]['m4'] - L) <= 2 and stage(min(10, max(1, round(R[nm]['m4'])))) == stage(L)]
        big = [nm for nm in by if by[nm]['role'] in ('boss', 'elite', 'brute') and abs(R[nm]['b4'] - L) <= 1 and stage(min(10, max(1, round(R[nm]['b4'])))) == stage(L)]
        enc = {}; tot = 0
        if big and rng.random() < 0.5:
            nm = rng.choice(big); u = units(R[nm]['b4'], L, True)
            if u <= budget * 1.1: enc[nm] = 1; tot += u
        pool = [x for x in pool if x not in enc]
        while pool and tot < budget * 0.9:
            nm = rng.choice(pool); u = units(R[nm]['m4'], L, False)
            if tot + u > budget * 1.1: pool.remove(nm); continue
            enc[nm] = enc.get(nm, 0) + 1; tot += u
        if not enc or tot < budget * 0.8: continue
        m = S.sim(L, [(by[nm], k) for nm, k in enc.items()], P, n, seed=t)
        tgt = 1 - (1 - TG[mult]) ** (P / 4)
        errs.setdefault((P, mult), []).append((m['down'] - tgt, m['lost'], m['death'], m['win']))
        lines.append('| %d | %d | %s | %.2f (×%.2f) | %.0f%% | %.0f%% | %.0f%% | %.1f%% | %.0f%% | %.1f |' % (L, P, ', '.join('%d %s' % (k, nm) for nm, k in enc.items()), tot, mult, 100 * m['down'], 100 * tgt, 100 * m['lost'], 100 * m['death'], 100 * m['win'], m['rounds']))
        print(lines[-1], flush=True)
    lines += ['', '| PCs | difficulty × | fights | mean (Down − target) | mean HP lost | mean death | mean win |', '|---|---|---|---|---|---|---|']
    for (P, mult), e in sorted(errs.items()):
        lines.append('| %d | %.2f | %d | %+.0f pts | %.0f%% | %.1f%% | %.0f%% |' % (P, mult, len(e), 100 * st.mean(x[0] for x in e), 100 * st.mean(x[1] for x in e), 100 * st.mean(x[2] for x in e), 100 * st.mean(x[3] for x in e)))
    lines += ['', '| difficulty × | fights | mean (Down − target) | within ±15 pts |', '|---|---|---|---|']
    for mult in (0.5, 0.75, 1.0, 1.25):
        e = [x[0] for (P, m_), v in errs.items() if m_ == mult for x in v]
        if e: lines.append('| %.2f | %d | %+.0f pts | %d%% |' % (mult, len(e), 100 * st.mean(e), 100 * sum(abs(x) <= 0.15 for x in e) / len(e)))
    open(os.path.join(OUT, '07b_mixed_validation_rule.md'), 'w').write('# Mixed-encounter validation of the published rule (same stage only; party 3/4/5; 1,000 fights each)\n\n' + '\n'.join(lines) + '\n')
def traitunits(n=800):
    """trait value in rating steps, measured as fair-count ratios (robust to the Evolution walls): steps = 2*log2(k_base/k_trait)"""
    import math
    lines = ['| Trait | L2: fair count (base → trait) | L5 | L8 | mean steps |', '|---|---|---|---|---|']
    tests = [('Pack', 'soldier', dict(traits={'pack': 1})), ('Flanker', 'soldier', dict(traits={'flank': True})), ('Overwhelm', 'soldier', dict(traits={'overwhelm': 3})),
             ('Crowd', 'soldier', dict(traits={'crowd': 0.5})), ('Linked', 'soldier', dict(traits={'link': True})), ('Leader', 'soldier', dict(traits={'leader': 1})),
             ('Frenzy', 'soldier', dict(traits={'enrage': 1})), ('Shield Wall', 'soldier', dict(traits={'shieldwall': (1, 2)})), ('Armored 2', 'soldier', dict(armor=2)),
             ('Explosive', 'soldier', dict(traits={'explode': 0.5})), ('Mender', 'soldier', dict(traits={'heal': 0.25})), ('Regenerating', 'soldier', dict(traits={'regen': 0.1})),
             ('Area 20 ft', 'soldier', dict(area='m')), ('Heavy (vs Brute)', 'brute', dict(area='m', extra=2, ff=True, recharge=4)),
             ('Heavy + Bulky (vs Brute)', 'brute', dict(area='m', extra=2, ff=True, recharge=4, traits={'bulky': 0.5}))]
    base = {}
    for role in ('soldier', 'brute'):
        for L in (2, 5, 8): base[(role, L)] = fair_count(L, variant(L, role), n=n)
    lines.insert(0, '')
    lines.insert(0, 'Base fair counts: ' + ', '.join('%s L%d %.2f' % (r, L, k) for (r, L), k in base.items()))
    for nm, role, kw in tests:
        cells = []; steps = []
        for L in (2, 5, 8):
            k = fair_count(L, variant(L, role, label=nm, **kw), n=n)
            b = base[(role, L)]; cells.append('%.2f → %.2f' % (b, k))
            if k not in (0, float('inf')): steps.append(2 * math.log2(b / k))
        lines.append('| %s | %s | %+.1f |' % (nm, ' | '.join(cells), st.mean(steps) if steps else float('nan'))); print(lines[-1], flush=True)
    open(os.path.join(OUT, '09b_trait_steps.md'), 'w').write('# Trait value in rating steps (minion use; fair-count ratios at L2/L5/L8, 4 PCs)\n\n' + '\n'.join(lines) + '\n')

def repatch(names):
    """re-rate some creatures (party 2-6) and patch 04_ratings_final.json/.md after a late retune"""
    R = json.load(open(os.path.join(OUT, '04_ratings_final.json')))
    md = open(os.path.join(OUT, '04_ratings_final.md')).read().split('\n')
    for nm in names:
        b = RO.BY_NAME[nm]; res = S.rate_one(b, SIZES, 1000)
        R[nm] = {('%s%d' % (m[0], P)): round(v[0], 2) for (m, P), v in res.items()}
        row = '| %s | %s | %d | %s | %s |' % (nm, b['kind'], b['T'], ' | '.join('%.1f' % res[('boss', P)][0] for P in SIZES), ' | '.join('%.1f' % res[('minion', P)][0] for P in SIZES))
        md = [row if l.startswith('| %s |' % nm) else l for l in md]; print(row, flush=True)
    json.dump(R, open(os.path.join(OUT, '04_ratings_final.json'), 'w'), indent=1)
    open(os.path.join(OUT, '04_ratings_final.md'), 'w').write('\n'.join(md))
def bossscale(n=2000):
    """Boss party-size rule: HP and Damage x P/4 (published in ch 10). Writes 12_boss_party_scaling.md"""
    import copy
    lines = ['| Boss (at its BR) | PCs | scaling | Down ≥1 (target) | HP lost | death | win | rounds |', '|---|---|---|---|---|---|---|---|']
    for nm in [b['name'] for b in RO.ROSTER if b['role'] == 'boss']:
        b = RO.BY_NAME[nm]; L = min(10, max(1, int(round(json.load(open(os.path.join(OUT, '04_ratings_final.json')))[nm]['b4']))))
        for P in SIZES:
            for f, lab in ((1.0, 'none'), (P / 4, 'HP & Damage ×%g' % (P / 4))):
                if P == 4 and f == 1.0 and lab != 'none': continue
                if P == 4 and lab != 'none': continue
                sp = copy.deepcopy(b); sp['hp'] = int(sp['hp'] * f)
                for a in sp['attacks'] + ((sp.get('shift') or {}).get('attacks') or []):
                    if 'dmg' in a: a['dmg'] = int(round(a['dmg'] * f))
                    if 'tmpl' in a:
                        for z in a['tmpl']['attacks']: z['dmg'] = max(1, int(round(z['dmg'] * f)))
                m = S.sim(L, [(sp, 1)], P, n, seed=5)
                lines.append('| %s (L%d) | %d | %s | %.0f%% (%.0f%%) | %.0f%% | %.1f%% | %.0f%% | %.1f |' % (nm, L, P, lab, 100 * m['down'], 100 * S.target_for(P), 100 * m['lost'], 100 * m['death'], 100 * m['win'], m['rounds'])); print(lines[-1], flush=True)
    open(os.path.join(OUT, '12_boss_party_scaling.md'), 'w').write('# Boss party-size scaling (each Boss at its party-of-4 BR level; 2,000 fights per cell)\n\n' + '\n'.join(lines) + '\n')

if __name__ == '__main__':
    {'final': final, 'steps': steps, 'budget': budget, 'party': party, 'mixed': mixed, 'builder': builder, 'mixed2': mixed2, 'traitunits': traitunits, 'bossscale': bossscale}.get(sys.argv[1], lambda: repatch(sys.argv[2].split('|')))()
