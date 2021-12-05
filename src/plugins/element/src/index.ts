import { retrieveModuleProperties } from 'lion-architecture';
import type { ComponentMap, Lionecs, LionecsExtras } from 'lionecs';
import rfdc from 'rfdc';

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

const clone = rfdc();
export function elementPlugin<M extends ComponentMap, X extends LionecsExtras>(
	this: Lionecs<M, X>,
	options?: ElementPluginOptions
): Lionecs<M, X & ElementPluginExtras<M>> {
	options = { ...elementPluginOptionsDefaults, ...options };

	const internalState: InternalElementPluginState = {
		_options: options,
		elements: new Map(),
	};

	this.elements = Object.assign(clone(elementPluginProperties), internalState);

	return this as Lionecs<M, X & ElementPluginExtras<M>>;
}
