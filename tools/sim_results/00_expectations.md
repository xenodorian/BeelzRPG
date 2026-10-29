# Enemy calibration: expectations written BEFORE the roster sims (2026-10-28 22:18 CT)

These are the assumptions the roster and rating rules were designed on. `01_*` onward record what the sims said.
Pre-roster finding already made while building the sim (logged, not an expectation): the v0.2 threat table is
**too soft against real builder characters**. 4 fully rested L7 freelancers lose ~6% HP to 4 T7 Soldiers; even
4 T12 Soldiers cost only ~24%. The table must be recalibrated before any rating means anything.

| # | Expectation | How it's tested |
|---|---|---|
| E1 | A plain Soldier's MR ≈ its T once the table is recalibrated, and its BR is ~3 lower (one body has a quarter of the actions). | rate generic Soldiers T1–10 |
| E2 | A Boss-role creature's BR ≈ its T (that's what the role is for), and its MR is ~3 higher. | rate generic Bosses |
| E3 | **AoE heavies are deadlier vs 5 PCs than vs 3** (relative to their rating): their BR rises with party size faster than a single-target creature's. | rate each heavy at party 3/4/5 |
| E4 | **AoE heavies are weak as minions**: friendly fire, Interference and Bulky make 4 of them worth less than 4× one; BR − MR ≥ 2. | BR vs MR |
| E5 | **Pack creatures are weak solo and strong in groups**: MR − BR ≥ 3 (vs ~3 for a plain Soldier, so +1 or more from the pack perk). | BR vs MR |
| E6 | Pack creatures are relatively **stronger vs small parties** (focus fire on 3 PCs downs someone faster). | party 3 vs 5 |
| E7 | Party-size rule: treat 3 PCs as one level lower and 5 PCs as one level higher (a ±1 rating shift), for every creature type. | rating at party 3/5 vs 4 |
| E8 | Encounter maths is additive in "minion units": a BR-N creature = 4 units, an MR-N creature = 1 unit, and each rating step is worth ×1.5 (so 2 steps ≈ ×2.25). Mixed encounters with 4 units are fair. | mixed encounters |
| E9 | Difficulty steps: Easy ≈ ½ the fair budget, Standard ≈ ¾, Hard = fair (1), Deadly ≈ 1½. | budget sweep |
| E10 | Controllers/support creatures are worth more in groups than alone (Leader and healing need allies), so they are MR-heavy too, but less than packs. | BR vs MR |
| E11 | Ratings are stable within ±0.3 of a level at 1,000 runs per cell. | repeat with a second seed |
| E12 | The Evolution jumps (L3→L4, L6→L7) mean a creature fair at L3 is "Easy" at L4: a whole rating step is worth more across an Evolution. | value of a rating step across stages |

## Results
Tested and recalibrated 2026-10-28: see `Current_Work.md`, *Enemy Calibration* → *Expectations vs results*. Summary: confirmed E1, E2, E8 (step ×1.41), E11, E12; confirmed with changes E3 (big parties only), E4 (only with a horde penalty), E7 (not for Bosses → Boss HP & Damage × P/4); partly E5; wrong E6, E9 (Deadly is ×1¼, not ×1½), E10.
