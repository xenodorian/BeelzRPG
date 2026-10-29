"""Starter-mission (ch 11) encounter check at level 1 for 3/4/5 freelancers. Writes sim_results/11_starter_mission.md"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import encounter_sim as S
ENC = [('Toll: 3 Ward Toughs', [('Ward Tough', 3)]), ('Toll (old v0.2 numbers in new table): same', None),
       ('Pump Hall v0.2: 2 Pickers + 4 Spill Rats', [('Scrapjack Picker', 2), ('Spill Rats', 4)]),
       ('Pump Hall v0.3: 1 Picker + 2 Spill Rats', [('Scrapjack Picker', 1), ('Spill Rats', 2)]),
       ('Pump Hall v0.3 (5 PCs): 2 Pickers + 2 Spill Rats', [('Scrapjack Picker', 2), ('Spill Rats', 2)]),
       ('Pump Hall v0.3 (3 PCs): 1 Picker + 1 Spill Rats', [('Scrapjack Picker', 1), ('Spill Rats', 1)]),
       ('Intake v0.2: Matriarch + 2 Spill Rats', [('The Brood Matriarch', 1), ('Spill Rats', 2)]),
       ('Intake v0.3: Matriarch alone', [('The Brood Matriarch', 1)]),
       ('Out: 2 Ostrander Cleaners', [('Ostrander Cleaner', 2)])]
lines = ['| Encounter (level 1) | PCs | Down ≥1 | HP lost | win | death | rounds |', '|---|---|---|---|---|---|---|']
for nm, enc in ENC:
    if enc is None: continue
    for P in (3, 4, 5):
        m = S.sim(1, enc, P, 2000, seed=3)
        lines.append('| %s | %d | %.0f%% | %.0f%% | %.0f%% | %.1f%% | %.1f |' % (nm, P, 100 * m['down'], 100 * m['lost'], 100 * m['win'], 100 * m['death'], m['rounds'])); print(lines[-1], flush=True)
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sim_results', '11_starter_mission.md'), 'w').write('# Starter mission check (level 1, 2,000 fights per cell)\n\n' + '\n'.join(lines) + '\n')
