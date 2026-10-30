"""Mutagen 5e: class benchmark calculator (SRD 5.1 classes + the Mutant).

Expected damage per round (DPR) against a single target, healing per long rest, and resources, levels 1-20.
Run:  python3 5e/tools/bench.py            -> prints Markdown tables
      python3 5e/tools/bench.py --json     -> machine-readable

ASSUMPTIONS (the usual community "white-room" method; every number is an expectation, no dice are rolled)
- Target AC by level: 13 (1-3), 14 (4), 15 (5-7), 16 (8-9), 17 (10-12), 18 (13-16), 19 (17-20).
  Target save bonus = AC - 11 for a strong save... we use one middling save: AC - 12 (so +1 at L1, +7 at L17).
- Main ability modifier: +3 (L1-3), +4 (L4-7), +5 (L8+): 15+2 at creation, ASIs at 4 and 8. Barbarian 20: +7.
- Adventuring day: 6 encounters x 3 rounds = 18 rounds; 2 short rests (6 rounds between rests).
- "At-will" = no limited resources. "Day" = at-will plus every damage resource per long rest spread over the
  18 rounds (resources that need your action replace an at-will round instead of adding to it).
- "Nova" = the best single round with resources (round 1, everything spent).
- Only SRD 5.1 content: SRD subclasses (Berserker, Lore, Life, Land, Champion, Open Hand, Devotion, Hunter,
  Thief, Draconic, Fiend, Evocation) and SRD spells (no Hex, no feats except Grappler).
- Crits: weapon/spell-attack dice double on a natural 20 (19-20 / 18-20 for the Champion).
"""
import json, math, sys

LV = range(1, 21)
def ac(L): return 13 if L <= 3 else 14 if L == 4 else 15 if L <= 7 else 16 if L <= 9 else 17 if L <= 12 else 18 if L <= 16 else 19
def save_bonus(L): return ac(L) - 12
def pb(L): return 2 + (L - 1) // 4
def mod(L): return 3 if L <= 3 else 4 if L <= 7 else 5
def tier(L): return 1 + (L >= 5) + (L >= 11) + (L >= 17)        # cantrip dice

def p_hit(L, bonus, adv=False, crit=1):
    need = ac(L) - bonus
    p = min(0.95, max(0.05, (21 - need) / 20))
    pc = crit / 20
    if adv: p, pc = 1 - (1 - p) ** 2, 1 - (1 - pc) ** 2
    return p, pc

def atk(L, bonus, dice, flat, adv=False, crit=1, ondice=0.0):
    """Expected damage of one attack: dice avg + flat on hit, dice (and ondice) doubled on a crit."""
    p, pc = p_hit(L, bonus, adv, crit)
    return p * (dice + flat + ondice) + pc * (dice + ondice)

def any_hit(L, bonus, n, adv=False):
    p, _ = p_hit(L, bonus, adv)
    return 1 - (1 - p) ** n

def p_fail(L, dc):
    return min(0.95, max(0.05, (dc - 1 - save_bonus(L)) / 20))

def save_dmg(L, dc, dmg, half=True):
    f = p_fail(L, dc)
    return f * dmg + (1 - f) * (dmg / 2 if half else 0)

D = lambda n, s: n * (s + 1) / 2
GWF2d6 = 2 * (sum(max(r, 0) for r in []) or 0)
def gwf(n, s):   # Great Weapon Fighting: reroll 1s and 2s once
    one = sum((((s + 1) / 2) if r <= 2 else r) for r in range(1, s + 1)) / s
    return n * one

# ---------------------------------------------------------------- spell slots
FULL = {1: [2], 2: [3], 3: [4, 2], 4: [4, 3], 5: [4, 3, 2], 6: [4, 3, 3], 7: [4, 3, 3, 1], 8: [4, 3, 3, 2], 9: [4, 3, 3, 3, 1],
        10: [4, 3, 3, 3, 2], 11: [4, 3, 3, 3, 2, 1], 12: [4, 3, 3, 3, 2, 1], 13: [4, 3, 3, 3, 2, 1, 1], 14: [4, 3, 3, 3, 2, 1, 1],
        15: [4, 3, 3, 3, 2, 1, 1, 1], 16: [4, 3, 3, 3, 2, 1, 1, 1], 17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
        19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1]}
def half_slots(L):
    if L < 2: return []
    return FULL[math.ceil(L / 2)][:5]
def pact(L):   # (slots per short rest, slot level); Mystic Arcanum ignored for damage
    n = 1 if L == 1 else 2 if L <= 10 else 3 if L <= 16 else 4
    return n, min(5, (L + 1) // 2)
def slots_list(sl):
    out = []
    for i, n in enumerate(sl): out += [i + 1] * n
    return out

# best single-target expected damage of a leveled spell by slot level, per spell list (SRD spells)
def spell_dmg(L, cls, s, dc, sa):
    if cls in ('wizard', 'sorcerer', 'warlock'):
        if s == 1: return 3 * (2.5 + 1) + (1 if cls == 'sorcerer' and L >= 6 else 0) * 0   # Magic Missile
        if s == 2: return 3 * atk(L, sa, 7, 0)                                            # Scorching Ray
        if s == 3: return save_dmg(L, dc, D(8, 6))                                         # Fireball
        if s == 4: return save_dmg(L, dc, D(8, 8))                                         # Blight
        if s == 5: return save_dmg(L, dc, D(8, 8) + D(1, 8))                               # Cone of Cold / upcast Blight
        if s == 6: return p_fail(L, dc) * (D(10, 6) + 40)                                  # Disintegrate
        if s >= 7: return save_dmg(L, dc, D(7, 8) + 30)                                    # Finger of Death
    if cls == 'cleric':
        if s == 1: return atk(L, sa, D(4, 6), 0)                                           # Guiding Bolt
        if s == 2: return atk(L, sa, D(5, 6), 0)
        if s == 3: return save_dmg(L, dc, D(3, 8)) * 3                                     # Spirit Guardians, 3 rounds
        if s == 4: return save_dmg(L, dc, D(4, 8)) * 3
        if s == 5: return save_dmg(L, dc, D(5, 8)) * 3
        if s == 6: return save_dmg(L, dc, D(14, 6))                                        # Harm
        if s >= 7: return save_dmg(L, dc, D(7, 10))                                        # Fire Storm
    if cls == 'druid':
        if s == 1: return save_dmg(L, dc, D(2, 8))                                         # Thunderwave
        if s == 2: return save_dmg(L, dc, D(2, 10)) * 3                                    # Moonbeam, 3 rounds
        if s == 3: return save_dmg(L, dc, D(3, 10)) * 3                                    # Call Lightning, 3 rounds (uses actions)
        if s == 4: return save_dmg(L, dc, D(8, 8))                                         # Blight
        if s == 5: return save_dmg(L, dc, D(4, 10)) * 3                                    # upcast Call Lightning
        if s >= 6: return save_dmg(L, dc, D(6, 8)) * 2                                     # Sunbeam
    if cls == 'bard':
        if s == 1: return save_dmg(L, dc, D(2, 8))                                         # Thunderwave
        if s == 2: return save_dmg(L, dc, D(3, 8))                                         # Shatter
        if s == 3: return save_dmg(L, dc, D(4, 8))
        if s >= 4: return save_dmg(L, dc, D(3 + s, 8))
    return 0

MULTI = {('cleric', 3): (3, 1), ('cleric', 4): (3, 1), ('cleric', 5): (3, 1),          # Spirit Guardians: 3 rounds, 1 action
         ('druid', 2): (3, 1), ('druid', 3): (3, 3), ('druid', 5): (3, 3), ('druid', 6): (2, 1)}   # Moonbeam / Call Lightning / Sunbeam
def caster(L, cls, cantrip, sl):
    """At-will cantrip; each slot is cast once for its best single-target spell. A spell that needs your action
    replaces a cantrip round; multi-round concentration spells keep dealing damage while you cantrip."""
    dc = 8 + pb(L) + mod(L); sa = pb(L) + mod(L)
    extra = 0.0; used = 0; best = cantrip
    for s in sorted(sl, reverse=True):
        dmg = spell_dmg(L, cls, s, dc, sa)
        rounds, acts = MULTI.get((cls, min(s, 6)), (1, 1))
        if used + acts > 18: break
        gain = dmg - acts * cantrip
        if gain > 0: extra += gain; used += acts
        per_round = dmg / rounds + (cantrip if acts < rounds else 0)
        best = max(best, per_round)
    return cantrip, cantrip + extra / 18, best

# ---------------------------------------------------------------- classes
def fighter(L):
    m = mod(L) + (2 if L >= 6 else 0) * 0
    m = 3 if L < 4 else 4 if L < 6 else 5      # Fighter gets an extra ASI at 6
    n = 1 + (L >= 5) + (L >= 11) + (L >= 20)
    crit = 1 if L < 3 else 2 if L < 15 else 3
    e = atk(L, pb(L) + m, gwf(2, 6), m, crit=crit)
    surges = 0 if L < 2 else 3 * (2 if L >= 17 else 1)
    return n * e, n * e + surges * n * e / 18, 2 * n * e

def barbarian(L):
    m = 3 if L < 4 else 4 if L < 8 else 5 if L < 20 else 7
    n = 1 + (L >= 5)
    rd = 2 if L < 9 else 3 if L < 16 else 4
    rages = 2 if L < 3 else 3 if L < 6 else 4 if L < 12 else 5 if L < 17 else 6 if L < 20 else 99
    brutal = 0 if L < 9 else 1 if L < 13 else 2 if L < 17 else 3
    adv = L >= 2
    def e(raging): return atk(L, pb(L) + m, 7, m + (rd if raging else 0), adv=adv, ondice=0) + p_hit(L, pb(L) + m, adv)[1] * brutal * 3.5
    frac = min(1, rages / 6)
    frenzy = (L >= 3) * 1 / 6     # one frenzied rage per day (exhaustion)
    at = n * e(False)
    day = frac * n * e(True) + (1 - frac) * at + frenzy * e(True)
    return at, day, n * e(True) + (L >= 3) * e(True)

def paladin(L):
    m = mod(L); n = 1 + (L >= 5)
    ids = 4.5 if L >= 11 else 0
    base = atk(L, pb(L) + m, gwf(2, 6), m, ondice=ids)
    sw = (L >= 3) * min(1, 3 / 6)                          # Sacred Weapon: +Cha to hit, 1 fight per short rest
    base_sw = atk(L, pb(L) + 2 * m, gwf(2, 6), m, ondice=ids)
    at = n * base
    sustained = n * ((1 - sw) * base + sw * base_sw)
    sl = slots_list(half_slots(L))
    smite = lambda s: D(min(5, 1 + s), 8)
    p, pc = p_hit(L, pb(L) + m)
    total = sum(smite(s) * (1 + pc / max(p, 1e-9)) for s in sl)   # smite on a hit (crits double)
    day = sustained + total / 18 * min(1, 1)                       # only one... two smites/round possible
    nova_sl = sorted(sl, reverse=True)[:n]
    nova = n * base + sum(p * smite(s) + pc * smite(s) for s in nova_sl)
    return at, day, nova

def ranger(L):
    m = mod(L); n = 1 + (L >= 5)
    hm = 3.5 if L >= 2 else 0
    cs = 4.5 if L >= 3 else 0
    e = atk(L, pb(L) + m + 2, 4.5, m, ondice=hm)
    at = n * atk(L, pb(L) + m + 2, 4.5, m) + any_hit(L, pb(L) + m + 2, n) * cs * 0.85
    day = n * e + any_hit(L, pb(L) + m + 2, n) * cs * 0.85 - (hm and 1 / 3 * e * 0)   # HM recast costs bonus actions only
    return at, day, day

def rogue(L):
    m = mod(L); sa = D(math.ceil(L / 2), 6)
    main = atk(L, pb(L) + m, 4.5, m); off = atk(L, pb(L) + m, 3.5, 0)
    p, pc = p_hit(L, pb(L) + m)
    phit = 1 - (1 - p) ** 2
    s = phit * sa + (1 - (1 - pc) ** 2) * sa
    return main + off + s, main + off + s, main + off + s

def monk(L):
    m = mod(L); die = 2.5 if L < 5 else 3.5 if L < 11 else 4.5 if L < 17 else 5.5
    n = 1 + (L >= 5)
    a = atk(L, pb(L) + m, max(die, 3.5), m)
    ba = atk(L, pb(L) + m, die, m)
    ki = L if L >= 2 else 0
    flurry = min(1, ki / 6)
    at = n * a + ba
    return at, at + flurry * ba, n * a + (2 * ba if L >= 2 else ba)

def warlock(L):
    m = mod(L); beams = tier(L)
    agon = m if L >= 2 else 0
    eb = beams * atk(L, pb(L) + m, 5.5, agon)
    n, s = pact(L)
    dc = 8 + pb(L) + m
    sl = [s] * (n * 3)     # slots per day (3 short-rest windows)
    return caster(L, 'warlock', eb, sl)

def cleric(L):
    m = mod(L); dc = 8 + pb(L) + m
    sf = save_dmg(L, dc, D(tier(L), 8), half=False)
    sl = slots_list(FULL[L])
    at, day, nova = caster(L, 'cleric', sf, sl)
    # Spiritual Weapon (bonus action) from L3 for every fight while 2nd-level slots last
    if L >= 3:
        sw = atk(L, pb(L) + m, D(1 + max(0, (3 - 2) // 2), 8), m)
        fights = min(6, sum(1 for s in sl if s == 2))
        day += sw * fights * 3 / 18
        nova += sw
    return at, day, nova

def druid(L):
    m = mod(L); sa = pb(L) + m
    pf = atk(L, sa, D(tier(L), 8), 0)
    sl = slots_list(FULL[L])
    if L >= 2: sl += [max(1, min(5, math.ceil(L / 2) // 2))]   # Natural Recovery (approx one slot)
    return caster(L, 'druid', pf, sl)

def bard(L):
    m = mod(L); dc = 8 + pb(L) + m
    vm = save_dmg(L, dc, D(tier(L), 4), half=False)
    return caster(L, 'bard', vm, slots_list(FULL[L]))

def sorcerer(L):
    m = mod(L); sa = pb(L) + m
    ea = m if L >= 6 else 0
    fb = atk(L, sa, D(tier(L), 10), ea)
    at, day, nova = caster(L, 'sorcerer', fb, slots_list(FULL[L]))
    if L >= 3:   # Quickened fire bolt with sorcery points (2 each), as many rounds as points allow
        rounds = min(18, L // 2)
        day += fb * rounds / 18
        nova += fb
    return at, day, nova

def wizard(L):
    m = mod(L); sa = pb(L) + m
    fb = atk(L, sa, D(tier(L), 10), m if L >= 10 else 0)
    sl = slots_list(FULL[L]) + ([min(5, math.ceil(L / 2))] if L >= 2 else [])   # Arcane Recovery (approx)
    return caster(L, 'wizard', fb, sl)


# ---------------------------------------------------------------- the Mutant (Mutagen 5e)
# Parameters mirror the class table in 5e/src/01_class_core.md; MUT_V1 holds the step-4 draft for the before/after log.
MUT = dict(die=6, sd=lambda L: 1 + (L >= 5) + (L >= 11) + (L >= 17),
           flux=lambda L: (L + 1) // 2, prime=lambda L: 1 if L < 3 else 2 if L < 6 else 3 if L < 14 else 4, oc=1, wave_bonus=1,
           sat=3.5, tl=lambda L: 3.5, ls_uses=lambda L: 0, spike=lambda L: pb(L) / 3, skitter_die=lambda L: 5.5)
MUT_V1 = dict(die=8, sd=lambda L: 1 + (L >= 5) + (L >= 11) + (L >= 17),
              flux=lambda L: pb(L) + L // 2, prime=lambda L: 2 if L < 6 else 3 if L < 14 else 4, oc=2, wave_bonus=1,
              sat=4.5, tl=lambda L: 3.5 if L < 10 else 4.5, ls_uses=lambda L: 6, spike=lambda L: max(1, mod(L) - 1), skitter_die=lambda L: 4.5)

def mutant(L, P=MUT, form='core'):
    """Strike build. core: greatsword (2d6, no fighting style). Oracle: longbow + Target Lock (1 Flux per fight).
    Juggernaut: longsword + shield + Challenge. Skitter: natural weapon d8 + Reflex Spike + Lightning Step.
    Per short-rest window (2 fights x 3 rounds): Strike is Unleashed only on a turn with a hit (once per turn);
    Primed Surges are free (min(3, Prime) per fight), then Flux pays; spare Flux buys Overcharge on hit turns.
    Overload is never used in Day (it costs hit points); Nova = an Amped Strike with Overcharge."""
    m = mod(L); bonus = pb(L) + m; n = 1 + (L >= 5)
    dieavg = (P['die'] + 1) / 2; sd = P['sd'](L) * dieavg
    weapon = {'core': 7, 'oracle': 4.5, 'juggernaut': 4.5, 'skitter': P['skitter_die'](L)}[form]
    p, pc = p_hit(L, bonus); pany = 1 - (1 - p) ** n; pcany = 1 - (1 - pc) ** n
    on_hit = lambda d: pany * d + pcany * d                    # once-per-turn rider, doubled on a crit
    base = n * atk(L, bonus, weapon, m)
    base += on_hit(P['sat']) if L >= 11 else 0                  # Saturated Strikes
    flux = P['flux'](L) - (1 if form == 'oracle' else 0) * 2   # Oracle: Target Lock costs 1 Flux per fight
    flux = max(0, flux)
    extra = 0
    if form == 'oracle':
        extra += on_hit(P['tl'](L))                            # Target Lock
        if L >= 10: extra += n * p_hit(L, bonus)[1] * (weapon + 3.5)   # Weak Spot: crit on 19 too (approx +1 crit face)
    if form == 'juggernaut':
        uses = max(1, m - 1); extra += min(6, uses) / 6 * on_hit(dieavg)   # Challenge: +1 Surge die, (Con mod) per rest
    if form == 'skitter':
        extra += min(6, P['spike'](L)) / 6 * atk(L, bonus, weapon, m)    # Reflex Spike reactions
    free = 2 * min(3, P['prime'](L))
    hits = 6 * pany
    paid = min(flux, max(0, hits - free)); spare = flux - paid
    used = min(hits, free + paid)
    oc_dice = P['oc']
    if form == 'skitter' and L >= 14:                          # Lightning Step: spare Flux buys a bonus-action attack
        ls = min(spare, P['ls_uses'](L)); spare -= ls; extra += ls / 6 * atk(L, bonus, weapon, m)
    oc_uses = min(spare, used)
    # used counts Unleashes, each made on a hit: expected damage per Unleash = sd (+crit share)
    strike_day = (used / 6) * sd * (1 + pcany / max(pany, 1e-9)) + (oc_uses / 6) * oc_dice * dieavg * (1 + pcany / max(pany, 1e-9))
    at = base + extra
    day = base + extra + strike_day
    amp = 1 if P['prime'](L) >= 2 else 0                       # Amped needs a double on the Prime roll
    nova = base + extra + on_hit(sd + dieavg * (amp + oc_dice))
    if L >= 20:   # Final Form: one fight (3 rounds) per day with free Overcharged Strikes plus a second Surge (Bolt) per turn
        bolt = atk(L, bonus, sd, m)
        day += 3 / 18 * (on_hit(oc_dice * dieavg) + bolt)
        nova += bolt
    return at, day, nova

def mutant_healing(L, P=MUT, alembic=False, bio=False, version=2):
    """Regeneration per long rest (every use spent). v1 = step-4 draft (Alembic: +Int uses, d8s; Panacea 6d8 on everyone).
    v2 = tuned (Alembic: d10s, no extra uses; Panacea 5d8 on up to six, four counted). Mend is Hit-Dice-based in v2 and
    adds only the Surge modifier per use on top of healing the party already owns, so it isn't counted."""
    m = mod(L)
    k = 1 if L < 5 else 2 if L < 9 else 3 if L < 13 else 4 if L < 17 else 5
    if version == 2: uses = pb(L) + (2 if L >= 3 else 0) + (1 if L >= 9 else 0)   # 3rd: +1 per short rest; 9th: +1 use
    else: uses = pb(L) + (2 if L >= 9 else 0)
    die = 10 if (alembic and version == 2) else 8
    per = D(k, die) + m + (pb(L) if bio else 0)
    if alembic:
        uses += m if version == 1 else 0
        per += (m if L >= 3 else 0) + (pb(L) if (L >= 6 and version == 1) else 0)   # Stim Gland temp HP (v1: Transmute on Regeneration)
    tot = uses * per
    if alembic and L >= 14: tot += 4 * (D(5 if version == 2 else 6, 8) + m)   # Panacea on four allies
    if version == 1 and not alembic: pass
    return tot

def mutant_mend_v1(L):
    """Step-4 draft Mend (Surge dice + mod per Flux, d8 dice, Flux PB + L/2, Primes free): the healing a Mutant could
    pour out per long rest by spending every Surge on Mend. Kept to show why Mend was changed."""
    P = MUT_V1; per = P['sd'](L) * 4.5 + mod(L)
    surges = 3 * (P['flux'](L) + 2 * min(3, P['prime'](L)))
    return surges * per

MARTIAL = ['Barbarian', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue']
CLASSES = {'Barbarian': barbarian, 'Bard': bard, 'Cleric': cleric, 'Druid': druid, 'Fighter': fighter, 'Monk': monk,
           'Paladin': paladin, 'Ranger': ranger, 'Rogue': rogue, 'Sorcerer': sorcerer, 'Warlock': warlock, 'Wizard': wizard}

# ---------------------------------------------------------------- healing per long rest (everything spent on healing)
def healing(L):
    m = mod(L); out = {}
    def cw(s, bonus=0): return D(s, 8) + m + bonus
    def hw(s, bonus=0): return D(s, 4) + m + bonus
    life = lambda s: 2 + s
    full = slots_list(FULL[L]); half = slots_list(half_slots(L))
    out['Cleric (Life), Cure Wounds'] = sum(cw(s, life(s)) for s in full)
    out['Cleric (Life), Healing Word'] = sum(hw(s, life(s)) for s in full)
    out['Druid, Cure Wounds'] = sum(cw(s) for s in full) + (sum(cw(s) for s in [max(1, min(5, math.ceil(L / 2) // 2))]) if L >= 2 else 0)
    out['Bard, Healing Word'] = sum(hw(s) for s in full)
    out['Paladin, Lay on Hands only'] = 5 * L
    out['Paladin, Lay on Hands + Cure Wounds'] = 5 * L + sum(cw(s) for s in half)
    out['Ranger, Cure Wounds'] = sum(cw(s) for s in half)
    out['Fighter, Second Wind (self)'] = 3 * (5.5 + L)
    return out

if __name__ == '__main__':
    rows = {c: {L: f(L) for L in LV} for c, f in CLASSES.items()}
    if '--json' in sys.argv:
        print(json.dumps({'dpr': {c: {L: [round(x, 1) for x in v] for L, v in d.items()} for c, d in rows.items()},
                          'heal': {L: {k: round(v, 1) for k, v in healing(L).items()} for L in LV}}, indent=1)); sys.exit()
    show = [1, 2, 3, 5, 8, 11, 14, 17, 20]
    for idx, name in ((0, 'At-will DPR'), (1, 'Day DPR (resources spread over 18 rounds)'), (2, 'Nova DPR (best round)')):
        print('\n### %s\n' % name)
        print('| Class | ' + ' | '.join('L%d' % L for L in show) + ' |')
        print('|---|' + '---|' * len(show))
        for c in rows: print('| %s | ' % c + ' | '.join('%.1f' % rows[c][L][idx] for L in show) + ' |')
        avg = ['%.1f' % (sum(rows[c][L][idx] for c in rows) / len(rows)) for L in show]
        print('| **Average** | ' + ' | '.join(avg) + ' |')
        mart = ['%.1f' % (sum(rows[c][L][idx] for c in MARTIAL) / len(MARTIAL)) for L in show]
        print('| **Martial average** | ' + ' | '.join(mart) + ' |')
        for f in ('core', 'juggernaut', 'skitter', 'oracle'):
            print('| *Mutant (%s)* | ' % f + ' | '.join('%.1f' % mutant(L, MUT, f)[idx] for L in show) + ' |')
        print('| *Mutant step-4 draft (core)* | ' + ' | '.join('%.1f' % mutant(L, MUT_V1, 'core')[idx] for L in show) + ' |')
    print('\n### Healing per long rest (all healing resources spent on healing)\n')
    hs = [1, 3, 5, 11, 17, 20]
    keys = list(healing(1).keys())
    print('| Source | ' + ' | '.join('L%d' % L for L in hs) + ' |'); print('|---|' + '---|' * len(hs))
    for k in keys: print('| %s | ' % k + ' | '.join('%.0f' % healing(L)[k] for L in hs) + ' |')
    for lab, kw in (('Mutant, Regeneration', {}), ('Mutant (Bio), Regeneration', {'bio': True}), ('Alembic, Regeneration + Panacea', {'alembic': True}),
                    ('Alembic (Bio), Regeneration + Panacea', {'alembic': True, 'bio': True})):
        print('| *%s* | ' % lab + ' | '.join('%.0f' % mutant_healing(L, **kw) for L in hs) + ' |')
    print('| *Step-4 draft: Alembic (Bio)* | ' + ' | '.join('%.0f' % mutant_healing(L, alembic=True, bio=True, version=1) for L in hs) + ' |')
    print('| *Step-4 draft: all Flux into Mend* | ' + ' | '.join('%.0f' % mutant_mend_v1(L) for L in hs) + ' |')
