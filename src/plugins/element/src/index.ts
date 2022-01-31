import { retrieveModuleProperties, createInstance } from 'lion-architecture';

import * as elementModules from './modules';
import type {
	ElementPlugin,
	ElementPluginExtras,
	ElementPluginOptions,
	InternalElementPluginProperties,
	InternalElementPluginState,
} from './types';
import type {
	ComponentMap,
	InternalLionecs,
	Lionecs,
	LionecsExtras,
} from '~/types';

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
	const lionecs = this as InternalLionecs<M, X> & ElementPluginExtras<M>;

	options = { ...elementPluginOptionsDefaults, ...options };

	const internalState: InternalElementPluginState = {
		_options: options,
		elements: new Map(),
	};

	lionecs.element = createInstance(
		elementPluginProperties,
		internalState
	) as ElementPlugin<M>;

	return lionecs as Lionecs<M, X & ElementPluginExtras<M>>;
}
