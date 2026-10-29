"""Mutagen v0.2 per-Form comparison (expected values, no dice). Run: python3 tools/tree_compare.py
Each Form is built the way a combat-minded player would (nodes listed in BUILD), at levels 1/3/4/6/7/10,
and fights a same-level Soldier (v0.2 Threat table) for 4 rounds, taking 1 attack per round
(60% Dodge / 25% Endure / 15% Resist; a Taunting Juggernaut or Siren takes 1.6). DPR = expected damage per round,
counting Area Surges as hitting 2 targets and support effects as damage-equivalent (noted per Form).
HP lost% = share of own Max HP lost in that fight (lower = tougher). Flux = Flux gained per fight.
Surges: Primed Surges are used first; from L4 a Signature fills every other round. Limit = Flux Limit."""
GUARD=[None,12,13,14,14,15,16,17,18,19,20]; TN=[None,12,12,13,13,14,15,16,17,18,18]
EDMG=[None,7,8,10,12,14,16,18,21,24,27]
STAGEV=[(3,2,1,0,-1),(5,3,2,1,0),(8,4,3,2,1)]
FORMS={'Juggernaut':('grit','nerve','chutzpah','gumption','moxie'),'Skitter':('moxie','gumption','grit','nerve','chutzpah'),
 'Oracle':('nerve','chutzpah','moxie','gumption','grit'),'Alembic':('gumption','grit','nerve','moxie','chutzpah'),
 'Siren':('chutzpah','moxie','gumption','grit','nerve')}
def stage(L): return 0 if L<4 else 1 if L<7 else 2
def rank(L): return (L+1)//2
def p(b,t): return max(0.05,min(0.95,(21-(t-b))/20))
def adv(q): return 1-(1-q)**2
def stats(f,L): return dict(zip(FORMS[f],STAGEV[stage(L)]))
def evalf(f,L):
    S=stats(f,L); R=rank(L); g=stage(L); P=S[FORMS[f][0]]; G=GUARD[L]; t=TN[L]; dmg=EDMG[L]
    prime=[2,3,4][g]; sig=g>0; die=4.5; rounds=4
    hp=12+2*S['grit']+5*(L-1); armor=1; extra=0.0; mult=1.0; bonus=0.0; heal=0.0; atk_on=1.0; defb={}; flux_extra=0
    ph=p(P+R,G); crit=0.05
    if f=='Juggernaut':
        armor+= (1 if R<3 else 2); hp+=2*L; extra+=1           # Plating, Thick, Extra Arm (Limbs)
        if L>=4: armor+=1; atk_on=1.6; defb['all']=2            # Siege Hide; Menace: Taunt draws fire, +2 def vs Taunted
        if L>=7: bonus+=0                                         # Fortress protects allies (not counted here)
        armor=min(armor+(1 if L>=5 else 0), 6 if L>=4 else 4)    # Heavy armor once affordable (L5+)
        bonus+= atk_on*0.4*2*R                                    # Barbs: ~40% of attacks on you are melee and hit
    if f=='Skitter':
        extra+=1                                                  # Capacitor
        if L>=4:
            q=p(S['moxie']+R,t); bonus+=atk_on*0.6*q*ph*(R*die+P)   # Mantis Reflex: full-dice Reflex Spike (Push) vs melee
            flux_extra+=atk_on*0.6*q*rounds*0.5
        if L>=7: bonus+=ph*(((R+1)//2)*die+P)*0.75; defb['moxie']=2   # Lightning Step (half dice) on Surge turns; Blur ~ +2 Dodge
    if f=='Oracle':
        extra+=0.9                                                # Target Lock (ranged, ~90% uptime)
        if L>=4: ph=ph+(1-ph)*ph*0.6                              # Foresight Omen rescues ~60% of misses
        if L>=7: crit=0.20; ph=ph+(1-ph)*0.5                      # Deadeye + Thousand Eyes (17-20), Push reroll ~half
        if L>=7: flux_extra+=rounds*0.3
    if f=='Alembic':
        heal+= (R*3.5+S['gumption'])                              # Stim Gland once per fight (self or ally)
        if L>=4: heal+=S['gumption']; mult=1.25                   # Transmute: +healing, Poisoned+Exposed riders (~+25% team value)
        if L>=7: heal+= 4*((R+1)*4.5+S['gumption'])*0.5           # Panacea (party heal, half counted as personal value)
        bonus+= 0.5*ph*(R+1)*die                                  # Burst Surges (2nd target) about half the time
    if f=='Siren':
        bonus+=0.25*2*p(P+R,G)*(R+1)*3.5 if L>=4 else 0           # Psychic Scream once per fight (2 targets)
        # Siren Song sends Taunted enemies at an ally (the tank): no extra fire on the Siren
        if L>=7: bonus+=dmg*0.75                                  # Crown of Will: a Soldier fights for you ~3 of 4 rounds
    used_primed=min(prime,rounds); sig_rounds=(rounds-used_primed) if sig else 0
    surges=used_primed+sig_rounds; weapon=rounds-surges
    def hit(n): return ph*(n*die+P)+crit*n*die
    dpr=(surges*hit(R+1+extra)+weapon*hit(R+extra))/rounds*mult+bonus
    flux=surges+flux_extra; lim=max(4,4+R+S['nerve'])
    lost=0
    for s,w in (('moxie',.6),('grit',.25),('nerve',.15)):
        q=p(S[s]+R+defb.get('all',0)+defb.get(s,0),t)
        lost+=w*(1-q)*atk_on*max(1,dmg-armor)
    lost=lost*rounds-heal*(0.5 if f=='Alembic' else 0)
    return dpr,100*max(0,lost)/hp,flux,lim,hp
if __name__=='__main__':
    lv=[1,3,4,6,7,10]
    print('| Form | '+' | '.join(f'L{L} DPR / HP lost / Flux (Limit)' for L in lv)+' |'); print('|---|'+'---|'*len(lv))
    for f in FORMS:
        cells=[]
        for L in lv:
            d,s,fx,lim,hp=evalf(f,L); cells.append(f'{d:.0f} / {s:.0f}% / {fx:.1f} ({lim})')
        print(f'| {f} | '+' | '.join(cells)+' |')
