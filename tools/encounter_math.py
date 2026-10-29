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
if __name__ == '__main__':
    {'final': final, 'steps': steps, 'budget': budget, 'party': party, 'mixed': mixed}[sys.argv[1]]()

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
        pool = [nm for nm in by if 1 <= R[nm]['m4'] and abs(R[nm]['m4'] - L) <= 3 and not by[nm].get('boss')]
        enc = {}; tot = 0
        while pool:
            nm = rng.choice(pool); u = units(R[nm]['m4'], L, False)
            if tot + u > budget * 1.1: 
                pool.remove(nm); continue
            enc[nm] = enc.get(nm, 0) + 1; tot += u
            if tot >= budget * 0.9: break
        if not enc or sum(enc.values()) < 2: continue
        m = S.sim(L, [(by[nm], k) for nm, k in enc.items()], P, n, seed=t)
        tgt = 1 - (1 - {0.75: 0.20, 1.0: 0.5, 1.25: 0.75}[mult]) ** (P / 4)
        errs.setdefault((P, mult), []).append(m['down'] - tgt)
        lines.append('| %d | %d | %s | %.2f (×%.2f) | %.0f%% | %.0f%% | %.1f%% | %.0f%% | %.1f |' % (L, P, ', '.join('%d %s' % (k, nm) for nm, k in enc.items()), tot, mult, 100 * m['down'], 100 * tgt, 100 * m['death'], 100 * m['win'], m['rounds']))
        print(lines[-1], flush=True)
    lines += ['', '| PCs | budget × | fights | mean (Down − target) |', '|---|---|---|---|']
    for (P, mult), e in sorted(errs.items()):
        lines.append('| %d | %.2f | %d | %+.0f pts |' % (P, mult, len(e), 100 * st.mean(e)))
    open(os.path.join(OUT, '07_mixed_validation.md'), 'w').write('# Mixed-encounter validation (budget rule: fair = P units, MR-R creature = 2^((R-L)/2) units, using MR for party of 4)\n\n' + '\n'.join(lines) + '\n')
