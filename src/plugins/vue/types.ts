import type { UnionToIntersection } from 'utility-types';

import type { ComponentBase, ComponentState } from '~/types/state';

import * as vueModules from './modules';

export type ElementProperty = {
	elementId: string;
};

// https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function
class ElementMethodsWrapper<
	C extends ComponentBase,
	S extends ComponentState<C>
> {
	// eslint-disable-next-line class-methods-use-this
	wrapped() {
		return vueModules['' as keyof typeof vueModules]<C, S>();
	}
}

export type InternalVuePluginProperties<
	C extends ComponentBase,
	S extends ComponentState<C>
> = UnionToIntersection<ReturnType<ElementMethodsWrapper<C, S>['wrapped']>>;
