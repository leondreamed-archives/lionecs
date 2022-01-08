import { retrieveModuleProperties, createInstance } from 'lion-architecture';
import type { ComponentMap, Lionecs, LionecsExtras } from '~/types';

import * as elementModules from './modules';
import type {
	ElementPluginExtras,
	ElementPluginOptions,
	InternalElementPluginProperties,
	InternalElementPluginState,
} from './types';

export const elementPluginOptionsDefaults: ElementPluginOptions = {
	setIdAttribute: true,
};

const elementPluginProperties = retrieveModuleProperties(
	elementModules
) as InternalElementPluginProperties<any>;

export function elementPlugin<M extends ComponentMap, X extends LionecsExtras>(
	this: Lionecs<M, X>,
	options?: ElementPluginOptions
): Lionecs<M, X & ElementPluginExtras<M>> {
	options = { ...elementPluginOptionsDefaults, ...options };

	const internalState: InternalElementPluginState = {
		_options: options,
		elements: new Map(),
	};

	this.elements = createInstance(elementPluginProperties, internalState);

	return this as Lionecs<M, X & ElementPluginExtras<M>>;
}
