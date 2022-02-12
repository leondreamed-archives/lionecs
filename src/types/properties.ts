import type { UnionToIntersection } from 'utility-types';

import * as lionecsModules from '../modules/index.js';
import type { ComponentMap } from './component.js';

class ModuleWrapper<M extends ComponentMap> {
	t() {
		return lionecsModules['' as keyof typeof lionecsModules]<M>();
	}
}

export type InternalLionecsProperties<M extends ComponentMap> =
	UnionToIntersection<ReturnType<ModuleWrapper<M>['t']>>;
