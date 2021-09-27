import type { UnionToIntersection } from 'utility-types';

import * as lionecsModules from '../modules';
import type { ComponentBase, ComponentState } from './state';

// https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function
class ModulesWrapper<C extends ComponentBase, S extends ComponentState<C>> {
	// eslint-disable-next-line class-methods-use-this
	wrapped() {
		return lionecsModules['' as keyof typeof lionecsModules]<C, S>();
	}
}

export type LionecsMethods<
	C extends ComponentBase,
	S extends ComponentState<C>
> = UnionToIntersection<ReturnType<ModulesWrapper<C, S>['wrapped']>>;
