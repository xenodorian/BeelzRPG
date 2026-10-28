"""Mutagen balance sim (Monte Carlo). Run: python3 tools/balance_sim.py
Models 4 PCs (2 with defense stat +2, 2 with +1; primary attack stat per level; d8 weapons;
Armor 1) vs enemies built with the Threat table in chapters/10_Threats.md.
PCs Unleash a Bolt-like Surge ((Rank+1)d8+stat) while they have Primed Surges; a missed
Surge stays Primed. Ignores conditions, riders, healing, tactics: treat results as a floor
for player effectiveness. Update the formulas here if you change the core numbers."""
import random, statistics as st
def rank(L): return (L+1)//2
def d(n,s): return sum(random.randint(1,s) for _ in range(n))
def TN(T): return 11+(T+1)//2
def ehp(T): return 7*T+11
def edmg(T): return 6+(3*T)//2
def pchp(L,G): return 12+2*G+5*(L-1)
def pstat(L): return min(5,3+(L>=3)+(L>=6)+(L>=9))
# enemy: dict hp, guard, dmg, attacks
def fight(L, enemies, armor=1):
    R=rank(L); P=pstat(L)
    hp=[pchp(L,2),pchp(L,2),pchp(L,0),pchp(L,0)]
    primed=[2 if L<5 else 3]*4
    E=[dict(e) for e in enemies]
    rounds=0; taken=0
    while any(e['hp']>0 for e in E) and any(h>0 for h in hp) and rounds<25:
        rounds+=1
        for i in range(4):
            if hp[i]<=0: continue
            alive=[e for e in E if e['hp']>0]
            if not alive: break
            # focus lowest hp non-mook
            t=min(alive,key=lambda e:e['hp'])
            surge = primed[i]>0
            if surge: primed[i]-=1
            roll=random.randint(1,20)
            if roll+P+R>=t['guard']:
                n=R+1 if surge else R
                dm=d(n,8)+P+(d(n,8) if roll==20 else 0)
                t['hp']-=dm
            elif surge:
                primed[i]+=1  # missed Surge stays Primed
            # boss interrupt
            for e in E:
                if e['hp']>0 and e.get('interrupt') and not e.get('used'):
                    e['used']=True
                    al=[k for k,h in enumerate(hp) if h>0]
                    if al:
                        k=random.choice(al)
                        if random.randint(1,20)+(2 if k<2 else 1)+R<e['tn']:
                            dm=max(1,e['dmg']-armor);hp[k]-=dm;taken+=dm
        for e in E:
            e['used']=False
            if e['hp']<=0: continue
            for a in range(e['atk']):
                al=[k for k,h in enumerate(hp) if h>0]
                if not al: break
                k=random.choice(al)
                if random.randint(1,20)+(2 if k<2 else 1)+R<e['tn']:
                    dm=max(1,e['dmg']-armor);hp[k]-=dm;taken+=dm
    tot=2*pchp(L,2)+2*pchp(L,0)
    return rounds,taken/tot,sum(h<=0 for h in hp)
def mk(T,role):
    b=dict(hp=ehp(T),guard=TN(T),tn=TN(T),dmg=edmg(T),atk=1)
    if role=='mook': b.update(hp=1,guard=TN(T)-1,dmg=edmg(T)//2)
    if role=='brute': b.update(hp=ehp(T)*2,guard=TN(T)-1,dmg=int(edmg(T)*1.5))
    if role=='elite': b.update(hp=ehp(T)*2,atk=2)
    if role=='boss': b.update(hp=ehp(T)*4,interrupt=True)
    return b
def run(L,encs,lab):
    res=[fight(L,encs) for _ in range(3000)]
    print(L,lab,'rounds %.1f'%st.mean(r[0] for r in res),'HP%% %.0f'%(100*st.mean(r[1] for r in res)),'downs %.2f'%st.mean(r[2] for r in res),'TPK %.3f'%st.mean(r[2]==4 for r in res))
for L in [1,5,10]:
    run(L,[mk(L,'soldier')]*4,'4 soldiers')
    run(L,[mk(L,'boss')],'boss')
    run(L,[mk(L,'boss')]+[mk(L,'mook')]*4,'boss+4mooks (5)')
    run(L,[mk(L,'brute'),mk(L,'soldier'),mk(L,'soldier')],'brute+2sold')
    run(L,[mk(L,'elite'),mk(L,'soldier'),mk(L,'mook')]*1+[mk(L,'mook')]*3,'elite+sold+4mook')
