import type { RemovePrivateProperties } from 'liontypes';
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

export type InternalElementPluginProperties<
	C extends ComponentBase,
	S extends ComponentState<C>
> = UnionToIntersection<ReturnType<ElementMethodsWrapper<C, S>['wrapped']>>;

export type InternalElementPluginState = {
	elements: Map<string, Element>;
	_options: ElementPluginOptions;
};

export type InternalElementPluginExtrasInner<
	C extends ComponentBase,
	S extends ComponentState<C>
> = InternalElementPluginProperties<C, S> & InternalElementPluginState;

export type ElementPluginExtrasInner<
	C extends ComponentBase,
	S extends ComponentState<C>
> = RemovePrivateProperties<InternalElementPluginExtrasInner<C, S>>;

export type InternalElementPluginExtras<
	C extends ComponentBase,
	S extends ComponentState<C>
> = { element: InternalElementPluginExtrasInner<C, S> };

export type ElementPluginExtras<
	C extends ComponentBase,
	S extends ComponentState<C>
> = { element: ElementPluginExtrasInner<C, S> };

export type ElementPluginOptions = {
	setIdAttribute: boolean;
};

export type CreateElementPropertyProps = {
	tag: string;
	namespace?: string;
	creationOptions?: ElementCreationOptions;
};
