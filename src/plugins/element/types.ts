import type { UnionToIntersection } from 'utility-types';

import type { ComponentBase, ComponentState } from '~/types/state';

import * as elementModules from './modules';

export type ElementProperty = string & {
	__elementId: true;
};

// https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function
class ElementMethodsWrapper<
	C extends ComponentBase,
	S extends ComponentState<C>
> {
	// eslint-disable-next-line class-methods-use-this
	wrapped() {
		return elementModules['' as keyof typeof elementModules]<C, S>();
	}
}

export type ElementMethods<
	C extends ComponentBase,
	S extends ComponentState<C>
> = UnionToIntersection<ReturnType<ElementMethodsWrapper<C, S>['wrapped']>>;

export type ElementExtras<
	C extends ComponentBase,
	S extends ComponentState<C>
> = ElementMethods<C, S> & {
	elements: Map<string, Element>;
};
