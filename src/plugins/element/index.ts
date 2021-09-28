import type { UnionToIntersection } from 'utility-types';

import type { Lionecs } from '~/types/lionecs';
import type { ComponentBase, ComponentState } from '~/types/state';

import * as elementModules from './modules';
import type { ElementProperty } from './types';

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

declare module '~/types/lionecs' {
	export interface Lionecs<C extends ComponentBase, S extends ComponentState<C>>
		extends ElementMethods<C, S> {
		elements: Map<ElementProperty, Element>;
	}
}

export function elementPlugin<
	C extends ComponentBase,
	S extends ComponentState<C>
>(ecs: Lionecs<C, S>) {
	const elementModulesObj = { ...elementModules };
	for (const module of Object.values(elementModulesObj)) {
		for (const [fn, value] of Object.entries(module<C, S>())) {
			ecs[fn as keyof ElementMethods<C, S>] = value;
		}
	}

	ecs.elements = new Map<ElementProperty, Element>();
}
