/* eslint-disable class-methods-use-this */

import type { UnionToIntersection } from 'utility-types';

import * as lionecsModules from '../modules';
import type { ComponentBase, ComponentState } from './state';

class ModulesWrapper<C extends ComponentBase, S extends ComponentState<C>> {
	wrapped() {
		return lionecsModules['' as keyof typeof lionecsModules]<C, S>();
	}
}

export type LionecsMethods<
	C extends ComponentBase,
	S extends ComponentState<C>
> = UnionToIntersection<ReturnType<ModulesWrapper<C, S>['wrapped']>>;
