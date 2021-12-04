// eslint-disable-next-line max-classes-per-file
import type { UnionToIntersection } from 'utility-types';

import * as lionecsModules from '../modules';
import type { ComponentMap } from './component';

class MW<M extends ComponentMap> {
	// eslint-disable-next-line class-methods-use-this
	t() {
		return lionecsModules['' as keyof typeof lionecsModules]<M>();
	}
}

export type InternalLionecsProperties<M extends ComponentMap> =
	UnionToIntersection<ReturnType<MW<M>['t']>>;
