import type { ComponentMap } from 'lionecs';
import type { RemovePrivateProperties } from 'liontypes';
import type { UnionToIntersection } from 'utility-types';

import * as vueModules from './modules';

export type ElementProperty = {
	elementId: string;
};

// https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function
class ElementMethodsWrapper<M extends ComponentMap> {
	// eslint-disable-next-line class-methods-use-this
	wrapped() {
		return vueModules['' as keyof typeof vueModules]<M>();
	}
}

export type InternalVuePluginProperties<M extends ComponentMap> =
	UnionToIntersection<ReturnType<ElementMethodsWrapper<M>['wrapped']>>;

export type VuePluginProperties<M extends ComponentMap> =
	RemovePrivateProperties<InternalVuePluginProperties<M>>;
