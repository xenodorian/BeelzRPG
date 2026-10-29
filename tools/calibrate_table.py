"""Calibrates the threat table rows (TN, HP, Damage; Guard is kept from v0.2) so that 4 T-N Soldiers (mixed
defenses) vs 4 fully rested level-N freelancers is a FAIR fight (ch 10, Ratings): P(at least one PC Down) 50%,
about 5 rounds. TN starts at (average freelancer defense + 11) so defenses succeed ~50%, and goes up 1 at a time
while Damage would exceed 0.75 x an average freelancer's HP (no one-hit Downs).
Run: python3 tools/calibrate_table.py > tools/sim_results/01_table_calibration.md"""
import sys, os, json, statistics as st
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import encounter_sim as S, encounter_roster as RO
pcs = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sim_data', 'pcs.json')))
def soldier(T, hp, dm, tn):
    return dict(name='cal', T=T, role='soldier', guard=RO.GUARD[T], tn=tn, hp=hp, actions=1, interrupts=0, traits={},
                attacks=[dict(n='Attack', d='mix', dmg=dm, area=None, rider=None)])
def solve(T, tn):
    hp, dm = 2.0 * RO.HP[T], 0.5 * st.mean(p['hp'] for p in pcs if p['level'] == T)
    for it in range(10):
        r = S.sim(T, [(soldier(T, round(hp), round(dm), tn), 4)], 4, 1500, seed=it + 1)
        hp *= min(1.4, max(0.7, (5.0 / r['rounds']) ** 1.1))
        dm *= min(1.25, max(0.8, (0.5 / max(.02, r['down'])) ** 0.6))
    return round(hp), round(dm)
print('| T | Guard | TN | HP | Damage | avg PC HP | Dmg / PC HP | Down >=1 | HP lost | rounds | win | death |')
print('|---|---|---|---|---|---|---|---|---|---|---|---|')
for T in range(1, 11):
    xs = [p for p in pcs if p['level'] == T]
    ah = st.mean(p['hp'] for p in xs); ad = st.mean(p['def'][k] for p in xs for k in ('dodge', 'endure', 'resist'))
    tn = round(ad + 11)
    while True:
        hp, dm = solve(T, tn)
        if dm <= 0.75 * ah or tn >= round(ad + 15): break
        tn += 1
    r = S.sim(T, [(soldier(T, hp, dm, tn), 4)], 4, 4000, seed=99)
    print('| %d | %d | %d | %d | %d | %.0f | %.2f | %.0f%% | %.0f%% | %.1f | %.1f%% | %.1f%% |' % (T, RO.GUARD[T], tn, hp, dm, ah, dm / ah,
          100 * r['down'], 100 * r['lost'], r['rounds'], 100 * r['win'], 100 * r['death']), flush=True)
