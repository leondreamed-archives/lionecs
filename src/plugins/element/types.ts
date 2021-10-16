import type { UnionToIntersection } from 'utility-types';

import type { ComponentBase, ComponentState } from '~/types/state';

import * as elementModules from './modules';

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
		return elementModules['' as keyof typeof elementModules]<C, S>();
	}
}

export type InternalElementProperties<
	C extends ComponentBase,
	S extends ComponentState<C>
> = UnionToIntersection<ReturnType<ElementMethodsWrapper<C, S>['wrapped']>>;

export type InternalElementState = {
	elements: Map<string, Element>;
	_options: ElementPluginOptions;
};

export type InternalElementExtrasInner<
	C extends ComponentBase,
	S extends ComponentState<C>
> = InternalElementProperties<C, S> & InternalElementState;

export type ElementExtrasInner<
	C extends ComponentBase,
	S extends ComponentState<C>
> = {
	[K in keyof InternalElementExtrasInner<C, S> as K extends `_${infer _}`
		? never
		: K]: InternalElementExtrasInner<C, S>;
};

export type InternalElementExtras<
	C extends ComponentBase,
	S extends ComponentState<C>
> = { element: InternalElementExtrasInner<C, S> };

export type ElementExtras<
	C extends ComponentBase,
	S extends ComponentState<C>
> = { element: ElementExtrasInner<C, S> };

export type ElementPluginOptions = {
	setIdAttribute: boolean;
};
