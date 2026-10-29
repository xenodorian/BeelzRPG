"""Mutagen v0.2 balance sim (Monte Carlo). Run: python3 tools/balance_sim.py [levels] ["enc|enc"]
Party: Juggernaut, Skitter, Oracle, Siren (dump +0 in Gumption / Nerve / Gumption / Grit), stats by stage
(Base +3/+2/+1/0/-1, Evo I +5/+3/+2/+1/0, Evo II +8/+4/+3/+2/+1). Each PC attacks with its primary stat
+ Rank. It Unleashes a Bolt-like Surge ((Rank+1)d8 + stat) while it has Primed Surges (Prime 2/3/4) or a
Signature Surge (L4+, always ready) and Flux to spare (Flux Limit 4+Rank+Nerve, starting each fight at 35%
of it to model mid-mission fights); otherwise a d8 weapon (Rank d8 + stat). Node damage bonuses are
modelled as +0.5/+1/+1.5 dice per hit by stage. The Juggernaut has Plating/Thick (and Siege Hide at L4+).
Enemies use the v0.2 Threat table (chapters/10_Threats.md) and attack a random PC's Dodge 60% / Endure 25% /
Resist 15%. Ignores riders, healing, Wild Surges, tactics, Taunts: treat results as a floor for players.
Keep the tables below in sync with chapter 10 and the builder data."""
import random, statistics as st, sys
# ---------- v0.2 character math ----------
STATS=['grit','moxie','nerve','gumption','chutzpah']
FORMS={ # primary, secondary, tertiary
 'juggernaut':('grit','nerve','chutzpah'),'skitter':('moxie','gumption','grit'),
 'oracle':('nerve','chutzpah','moxie'),'alembic':('gumption','grit','nerve'),
 'siren':('chutzpah','moxie','gumption')}
STAGEV=[(3,2,1,0,-1),(5,3,2,1,0),(8,4,3,2,1)]
def stage(L): return 0 if L<4 else 1 if L<7 else 2
def rank(L): return (L+1)//2
def pc_stats(form,dump0,L):
    p,s,t=FORMS[form]; v=STAGEV[stage(L)]
    rest=[x for x in STATS if x not in (p,s,t)]; d0=dump0; d1=[x for x in rest if x!=d0][0]
    return {p:v[0],s:v[1],t:v[2],d0:v[3],d1:v[4]}
PARTY=[('juggernaut','gumption'),('skitter','nerve'),('oracle','gumption'),('siren','grit')]
def d(n,s): return sum(random.randint(1,s) for _ in range(n))
# ---------- threat table (T1..T10), tuned below ----------
GUARD=[None,12,13,14,14,15,16,17,18,19,20]
TNT  =[None,12,12,13,13,14,15,16,17,18,18]
EHP  =[None,18,22,30,40,48,56,72,84,92,100]
EDMG =[None,7,8,10,12,14,16,18,21,24,27]
DEFMIX=[('moxie',.6),('grit',.25),('nerve',.15)]
def pc(form,dump0,L,ff=False):
    S=pc_stats(form,dump0,L); R=rank(L); g=stage(L)
    p=FORMS[form][0]
    if ff: S[p]+=2
    hp=12+2*S['grit']+5*(L-1); armor=1
    if form=='juggernaut': hp+=2*L; armor+=(1 if R<3 else 2)+(1 if L>=4 else 0)
    return dict(S=S,R=R,P=S[p],hp=hp,max=hp,armor=min(armor,6 if L>=4 and form=='juggernaut' else 4),
        prime=[2,3,4][g]+(2 if ff else 0),sig=[0,1,2][g],lim=max(4,4+R+S['nerve']),
        bonus=[0.5,1,1.5][g],ff=ff)
def bonusdice(b): return int(b)+(1 if random.random()<b-int(b) else 0)
def fight(L,enemies,ff=False,startflux=0.35):
    P=[pc(f,dz,L,ff) for f,dz in PARTY]
    for c in P: c['flux']=round(startflux*c['lim']); c['primed']=c['prime']
    E=[dict(e) for e in enemies]; rounds=0; taken=0; hits=0; atks=0; dfs=0; dfo=0
    while any(e['hp']>0 for e in E) and any(c['hp']>0 for c in P) and rounds<25:
        rounds+=1
        for c in P:
            if c['hp']<=0: continue
            alive=[e for e in E if e['hp']>0]
            if not alive: break
            t=min(alive,key=lambda e:e['hp'])
            cost=0 if c['ff'] else 1
            surge=(c['primed']>0 or c['sig']>0) and c['flux']+cost<=c['lim']
            usedprimed=surge and c['primed']>0
            if usedprimed: c['primed']-=1
            if surge: c['flux']+=cost
            r=random.randint(1,20); atks+=1
            if r!=1 and r+c['P']+c['R']>=t['guard']:
                hits+=1
                n=(c['R']+1 if surge else c['R'])+bonusdice(c['bonus'])
                dm=d(n,8)+c['P']+(d(n,8) if r==20 else 0)
                t['hp']-=max(1,dm-t.get('armor',0))
            elif usedprimed: c['primed']+=1
            for e in E:
                if e['hp']>0 and e.get('interrupt') and not e.get('used'):
                    e['used']=True; taken+=attack(e,P)
        for e in E:
            e['used']=False
            if e['hp']<=0: continue
            for a in range(e['atk']):
                tk=attack(e,P,stats=True)
                taken+=tk[0]; dfs+=tk[1]; dfo+=tk[2]
    tot=sum(c['max'] for c in P)
    return rounds,taken/tot,sum(c['hp']<=0 for c in P),hits/max(1,atks),dfs/max(1,dfo)
def attack(e,P,stats=False):
    al=[c for c in P if c['hp']>0]
    if not al: return (0,0,0) if stats else 0
    c=random.choice(al); x=random.random(); acc=0
    for s,w in DEFMIX:
        acc+=w
        if x<=acc: break
    r=random.randint(1,20); ok=r!=1 and r+c['S'][s]+c['R']>=e['tn']
    dm=0
    if not ok: dm=max(1,e['dmg']-c['armor']); c['hp']-=dm
    return (dm,int(ok),1) if stats else dm
def mk(T,role):
    b=dict(hp=EHP[T],guard=GUARD[T],tn=TNT[T],dmg=EDMG[T],atk=1)
    if role=='mook': b.update(hp=1,guard=GUARD[T]-1,dmg=EDMG[T]//2)
    if role=='brute': b.update(hp=EHP[T]*2,guard=GUARD[T]-1,dmg=int(EDMG[T]*1.5))
    if role=='elite': b.update(hp=EHP[T]*2,atk=2)
    if role=='boss': b.update(hp=EHP[T]*4,interrupt=True,guard=GUARD[T]+1)
    return b
ENC={'4 Soldiers (Std)':lambda L:[mk(L,'soldier')]*4,'Boss (Std)':lambda L:[mk(L,'boss')],
 'Brute+2 Soldiers (Std)':lambda L:[mk(L,'brute'),mk(L,'soldier'),mk(L,'soldier')],
 'Elite+Soldier+4 Mooks (Hard)':lambda L:[mk(L,'elite'),mk(L,'soldier')]+[mk(L,'mook')]*4,
 'Boss+4 Mooks (Deadly)':lambda L:[mk(L,'boss')]+[mk(L,'mook')]*4,
 '6 Soldiers (Deadly)':lambda L:[mk(L,'soldier')]*6}
def run(L,name,n=2000,ff=False):
    res=[fight(L,ENC[name](L),ff) for _ in range(n)]
    return dict(rounds=st.mean(r[0] for r in res),hp=100*st.mean(r[1] for r in res),
        downs=st.mean(r[2] for r in res),tpk=st.mean(r[2]==4 for r in res),hit=100*st.mean(r[3] for r in res),df=100*st.mean(r[4] for r in res))
if __name__=='__main__':
    if len(sys.argv)>1:
        lv=[int(x) for x in sys.argv[1].split(',')]
        encs=sys.argv[2].split('|') if len(sys.argv)>2 else list(ENC)
    else:
        lv=[1,3,4,6,7,9,10]; encs=list(ENC)
    random.seed(7)
    print('| Encounter | '+' | '.join('L%d'%L for L in lv)+' |'); print('|---|'+'---|'*len(lv))
    for name in encs:
        row=[]
        for L in lv:
            r=run(L,name); row.append('%.1f r / %.0f%%%s'%(r['rounds'],r['hp'],' / TPK %.0f%%'%(100*r['tpk']) if r['tpk']>=0.005 else ''))
        print('| %s | %s |'%(name,' | '.join(row)))
    r=run(10,'Boss+4 Mooks (Deadly)',ff=True); print('| Boss+4 Mooks at L10, **Final Form** | %.1f r / %.0f%% |'%(r['rounds'],r['hp']))
    print(); print('Hit / defense success (party average, 4 Soldiers):')
    for L in lv:
        r=run(L,'4 Soldiers (Std)',1000); print('L%d hit %.0f%%  defense %.0f%%'%(L,r['hit'],r['df']))
