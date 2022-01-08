import type { UnionToIntersection } from 'utility-types';

import * as lionecsModules from '../modules';
import type { ComponentMap } from './component';

class ModuleWrapper<M extends ComponentMap> {
	t() {
		return lionecsModules['' as keyof typeof lionecsModules]<M>();
	}
}

export type InternalLionecsProperties<M extends ComponentMap> =
	UnionToIntersection<ReturnType<ModuleWrapper<M>['t']>>;
