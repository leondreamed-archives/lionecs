import type { RemovePrivateProperties } from 'liontypes';
import type { UnionToIntersection } from 'utility-types';

import * as elementModules from './modules';
import type { ComponentMap } from '~/types';

class ElementMethodsWrapper<M extends ComponentMap> {
	wrapped() {
		return elementModules['' as keyof typeof elementModules]<M>();
	}
}

export type InternalElementPluginProperties<M extends ComponentMap> =
	UnionToIntersection<ReturnType<ElementMethodsWrapper<M>['wrapped']>>;

export type InternalElementPluginState = {
	elements: Map<string, Element>;
	_options: ElementPluginOptions;
};

export type InternalElementPluginExtras<M extends ComponentMap> = {
	element: InternalElementPluginProperties<M> & InternalElementPluginState;
};

export type ElementPlugin<M extends ComponentMap> = RemovePrivateProperties<
	InternalElementPluginProperties<M> & InternalElementPluginState
>;

export type ElementPluginExtras<M extends ComponentMap> = {
	element: ElementPlugin<M>;
};

export type ElementPluginOptions = {
	setIdAttribute: boolean;
};

export type CreateElementPropertyProps = {
	tag: string;
	namespace?: string;
	creationOptions?: ElementCreationOptions;
};

export type ElementProperty = { elementId: string }; // TODO
