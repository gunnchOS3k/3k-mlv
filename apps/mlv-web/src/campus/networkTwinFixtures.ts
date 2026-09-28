import gary from '../../../../data/network_twin/fixtures/closed_loop_v2/gary.optimization.json';
import ghana from '../../../../data/network_twin/fixtures/closed_loop_v2/ghana.optimization.json';
import guyana from '../../../../data/network_twin/fixtures/closed_loop_v2/guyana.optimization.json';
import geelong from '../../../../data/network_twin/fixtures/closed_loop_v2/geelong.optimization.json';
import germany from '../../../../data/network_twin/fixtures/closed_loop_v2/germany.optimization.json';
import gaza from '../../../../data/network_twin/fixtures/closed_loop_v2/gaza.optimization.json';
import graham_land from '../../../../data/network_twin/fixtures/closed_loop_v2/graham_land.optimization.json';

export const OPTIMIZATION_FIXTURES: Record<string, typeof gary> = {
  gary,
  ghana,
  guyana,
  geelong,
  germany,
  gaza,
  'graham-land': graham_land,
  graham_land,
};
