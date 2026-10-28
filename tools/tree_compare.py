"""Mutagen per-tree comparison (expected values, no dice). Run: python3 tools/tree_compare.py
Each build = one tree taken as deep as the level allows (L1: Root + 1 node, L5: Root + all 4 nodes,
L10: Root + 4 nodes + Apex), on an otherwise identical freelancer: primary attack stat +3/+4/+5,
defense stat +2/+3/+4, Grit +2 (HP 16/36/61), Light armor, d8 weapon, vs a same-level Soldier (Guard = TN, Armor 0)
attacking in melee. 4-round fight, 3 Surges used (Prime + Churn,
with the "no Churn on an Unleash turn" rule). DPR = expected damage per round to enemies.
HP lost = % of your HP lost in a 4-round fight taking 1.25 Soldier attacks/round (lower is better)."""
def rank(L): return (L+1)//2
def TN(T): return 11+(T+1)//2
def edmg(T): return 6+(3*T)//2
def clamp(x): return max(0.05,min(0.95,x))
def p_hit(b,t): return clamp((21-(t-b))/20)
LV={1:dict(P=3,D=2,nodes=1),5:dict(P=4,D=3,nodes=4),10:dict(P=5,D=4,nodes=5)}
def evalb(L,tree):
    R=rank(L); P=LV[L]['P']; D=LV[L]['D']; n=LV[L]['nodes']; t=TN(L)
    hp=12+4+5*(L-1); armor=1; dmg=edmg(L)
    die=4.5; atk=P+R; ph=p_hit(atk,t); adv=lambda p:1-(1-p)**2
    wdice=R; sdice=R+2   # weapon dice; Strike/Bolt+Kinetic surge dice (d8-equivalent)
    flux=4.0; regen=0; extra=0.0; dpr_bonus=0.0; qmod=0; hp_bonus=0; armor_b=0; heal=0; notes=[]
    fight_rounds=4; surges=3
    has=lambda k:k<=n   # node k (1..4 normal, 5=Apex) owned
    if tree=='Hide':
        armor_b=1 if R<3 else 2
        if has(1): hp_bonus+=2*L
        if has(2): dpr_bonus+=(1-p_hit(D+R,dmg and t))*2*R   # Barbs
        if has(5): qmod='unbreakable'
    if tree=='Limbs':
        if has(1): extra+=1   # Extra Arm (fixed): +1 die once/turn on melee hit
        if has(5): dpr_bonus+=ph*((wdice+1)//2*die+P)   # Flurry
    if tree=='Senses':
        if has(1): extra+=0.75   # Target Lock ~75% uptime
        if has(5): dpr_bonus+=0.05*wdice*die*2 ; ph=ph+(1-ph)*ph*0.5   # Deadeye crits + reroll ~half the rounds
    if tree=='Glands':
        if has(1): regen=R+1   # Regenerate: only while at half HP or less
        if has(2): hp_bonus+=2*(R*3.5+1)/2   # Stim: 2 per Breather, ~2 fights per Breather -> 1 per fight
        if has(3): hp_bonus+=2*R+2   # Adrenal Dump temp HP
    if tree=='Wiring':
        if has(2): extra+=1   # Capacitor
        if has(1): dpr_bonus+=p_hit(D+R,t)*ph*(((wdice+1)//2)*die+P); flux+=p_hit(D+R,t)*1.25*fight_rounds*0  # see below
        if has(4): dpr_bonus+=(ph*(wdice*die+P))/(2*fight_rounds)   # Overclock: 1 extra action / Breather (~2 fights)
        if has(5): qmod='blur'
    if tree=='Mind':
        # Mind Spike = same d8 ranged; Puppet: 1/fight swaps an attack for enemy Damage on an enemy
        if has(2): dpr_bonus+=(p_hit(P+R,t)*dmg - ph*(wdice*die+P))/fight_rounds
        if has(4): qmod='precog'
    # Flux per fight beyond Surges(3)+Churn(1)=4: Push-per-round nodes
    if tree=='Wiring' and has(1): flux+=min(1,1.25*p_hit(D+R,t))*fight_rounds
    if tree=='Mind' and has(4): flux+=0.5*fight_rounds
    if tree=='Hide' and has(5): flux+=min(1,1.25*(1-p_hit(D+R,t)))*fight_rounds
    if tree=='Senses' and has(5): flux+=(1-ph)*fight_rounds*0.5
    # damage
    wpn=ph*((wdice+extra)*die+P)+0.05*(wdice+extra)*die
    srg=ph*((sdice+extra)*die+P)+0.05*(sdice+extra)*die
    dpr=(surges*srg+(fight_rounds-surges)*wpn)/fight_rounds+dpr_bonus
    # survival
    q=p_hit(D+R,t)
    if qmod=='precog': q=0.5*q+0.5*adv(q)   # declared before rolling, 1 Flux: used ~half the rounds
    fail=1-q
    nfail=1.25*fail                          # 1.25 Soldier attacks on you per round
    if qmod=='blur': nfail=(1-adv(q))+0.25*fail          # first Dodge each round with advantage
    if qmod=='unbreakable': nfail=fail*0.5+0.25*fail      # Push halves the round's first failed hit
    per=nfail*max(1,dmg-armor-armor_b)
    H=hp+hp_bonus; lost=0.0
    for r in range(fight_rounds):
        lost+=per
        if lost>=H/2: lost=max(0,lost-regen)   # Regenerate only while at half HP or less
    surv=100*lost/H   # % of your HP lost in a 4-round Standard fight (lower is better)
    return dpr,surv,flux
base={}
print("Tree | L1 DPR | L1 HP lost% | L5 DPR | L5 HP lost% | L5 Flux/fight | L10 DPR | L10 HP lost% | L10 Flux/fight")
for tree in ['(no tree)','Hide','Limbs','Senses','Glands','Wiring','Mind']:
    row=[]
    for L in (1,5,10):
        d,s,f=evalb(L,tree)
        row+= [f"{d:.1f}", f"{s:.0f}%"] + ([f"{f:.1f}"] if L>1 else [])
    print(tree,'|',' | '.join(row))
