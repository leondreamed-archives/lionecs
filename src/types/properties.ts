import type { UnionToIntersection } from 'utility-types';

import * as lionecsModules from '../modules';
import type { ComponentMap } from './component';

// https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function
class ModulesWrapper<M extends ComponentMap> {
	// eslint-disable-next-line class-methods-use-this
	wrapped() {
		return lionecsModules['' as keyof typeof lionecsModules]<M>();
	}
}

export type InternalLionecsProperties<M extends ComponentMap> =
	UnionToIntersection<ReturnType<ModulesWrapper<M>['wrapped']>>;
