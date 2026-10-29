"""Tunes each roster creature's HP and Damage (one shared scale, plus a damage->HP shift when a fight is swingy)
until its PRIMARY rating (BR for Bosses, Elites, Brutes, heavies, the Choir and Mother of Rust; MR for everything
else) lands on its design target, and the fight at that level stays in the fairness band.
Writes tools/sim_data/roster_tuning.json. Run: python3 tools/tune_roster.py [names|all] [--n 600]"""
import sys, os, json, importlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import encounter_sim as S, encounter_roster as RO
HERE = os.path.dirname(os.path.abspath(__file__)); TF = os.path.join(HERE, 'sim_data', 'roster_tuning.json')
TARGET = {  # name: (primary mode, target rating)
 'Spill Rats': ('minion', 1), 'Scrapjack Picker': ('minion', 2), 'Ward Tough': ('minion', 1), 'Bloomhound': ('minion', 2),
 'Turret Drone': ('minion', 2), 'Drain Beast': ('boss', 2), 'Boiler Hulk': ('boss', 3), 'Ostrander Cleaner': ('minion', 3),
 'Sporecaller': ('minion', 3), 'The Brood Matriarch': ('boss', 1),
 'Mirrormaw': ('boss', 4), 'Cleaner Hound': ('minion', 5), 'Gas Bloat': ('boss', 4), 'Bloom Knight': ('minion', 5),
 'Glasshide': ('boss', 5), 'Stitchwork Brood': ('minion', 6), 'Damper Drone': ('minion', 5), 'Lancer Troopers': ('minion', 4),
 'Hunter-Killer Unit': ('boss', 6), 'Warden Krell': ('boss', 5),
 'Feral Evolved': ('boss', 7), 'Razorwing Flock': ('minion', 7), 'Bloom Husks': ('minion', 7), 'Gutter Leviathan': ('boss', 8),
 'Seraph Gunship': ('boss', 8), 'The Drowned Choir': ('boss', 8), 'Ostrander Paladin': ('minion', 8), 'Choir Thralls': ('minion', 8),
 'Mother of Rust': ('boss', 9), 'Reactor Wraith': ('boss', 10), 'Hollow Saint': ('minion', 9.5), 'The Many': ('minion', 9.5),
 'Patient Zero': ('boss', 10)}
def spec_with(name, fh, fd):
    tune = json.load(open(TF)) if os.path.exists(TF) else {}
    tune[name] = [fh, fd]; json.dump(tune, open(TF, 'w'), indent=1, sort_keys=True)
    importlib.reload(RO); return RO.BY_NAME[name]
def measure(sp, mode, R, n):
    lv = [L for L in range(max(1, int(R) - 2), min(10, int(R) + 3) + 1)]
    cv = S.curve(sp, mode, 4, n, levels=lv)
    r = S.rating(cv); L = min(10, max(1, int(round(r))))
    m = cv[L] if L in cv else S.sim(L, [(sp, 1 if mode == 'boss' else 4)], 4, n)
    return r, m
def tune(name, n=600):
    mode, R = TARGET[name]
    cur = (json.load(open(TF)) if os.path.exists(TF) else {}).get(name, [1.0, 1.0])
    fh, fd = cur
    lo, hi = 0.15, 6.0; s = 1.0
    for it in range(10):
        eh, ed = (0.5, 1.5) if RO.BY_NAME[name]['role'] == 'boss' else (1, 1)   # Bosses keep their HP, lose damage
        sp = spec_with(name, fh * s ** eh, fd * s ** ed)
        r, m = measure(sp, mode, R, n)
        if abs(r - R) < 0.2: break
        if r > R: hi = s
        else: lo = s
        s = (lo * hi) ** 0.5
    eh, ed = (0.5, 1.5) if RO.BY_NAME[name]['role'] == 'boss' else (1, 1)
    fh, fd = fh * s ** eh, fd * s ** ed
    # swingy? move damage into HP while keeping the rating
    for it in range(6):
        if m['death'] <= 0.05 and m['win'] >= 0.90: break
        if m['rounds'] > 6: fh *= 0.75; fd *= 1.2      # long fights bleed Down freelancers out: shorten them
        else: fd *= 0.85; fh *= 1.25                    # short and spiky: soften the hits
        sp = spec_with(name, fh, fd); r, m = measure(sp, mode, R, n)
        if abs(r - R) >= 0.3:   # re-centre the rating after the shift
            k = 1.0
            for _ in range(6):
                k *= (R / max(0.3, r)) ** 0.8 if r > 0 else 1.5
                sp = spec_with(name, fh * k, fd * k); r, m = measure(sp, mode, R, n)
                if abs(r - R) < 0.25: break
            fh, fd = fh * k, fd * k
    spec_with(name, round(fh, 3), round(fd, 3))
    print('%-20s %s target %.1f -> %.2f  (HP x%.2f, Dmg x%.2f) @L: down %.0f%% lost %.0f%% r %.1f win %.0f%% death %.1f%%' % (
        name, mode, R, r, fh, fd, 100 * m['down'], 100 * m['lost'], m['rounds'], 100 * m['win'], 100 * m['death']), flush=True)
if __name__ == '__main__':
    names = list(TARGET) if len(sys.argv) < 2 or sys.argv[1] == 'all' else sys.argv[1].split('|')
    n = int(sys.argv[sys.argv.index('--n') + 1]) if '--n' in sys.argv else 600
    for nm in names: tune(nm, n)
