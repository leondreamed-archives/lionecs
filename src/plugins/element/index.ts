import rfdc from 'rfdc';

import type { InternalLionecs, Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentState,
	LionecsExtras,
} from '~/types/state';

import * as elementModules from './modules';
import type {
	ElementPluginExtras,
	ElementPluginOptions,
	InternalElementPluginExtras,
	InternalElementPluginProperties,
	InternalElementPluginState,
} from './types';

export const elementPluginOptionsDefaults: ElementPluginOptions = {
	setIdAttribute: true,
};

const clone = rfdc();
const elementPluginModulesObj = { ...elementModules };
const elementPluginProperties = {} as InternalElementPluginProperties<any, any>;
for (const module of Object.values(elementPluginModulesObj)) {
	for (const [fn, value] of Object.entries(module<any, any>())) {
		elementPluginProperties[
			fn as keyof InternalElementPluginProperties<any, any>
		] = value;
	}
}

export function elementPlugin<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras
>(
	this: Lionecs<C, S, X>,
	options?: ElementPluginOptions
): Lionecs<C, S, X & ElementPluginExtras<C, S>> {
	options = { ...elementPluginOptionsDefaults, ...options };

	const elementPluginEcs = this as unknown as InternalLionecs<
		C,
		S,
		X & InternalElementPluginExtras<C, S>
	>;

	const internalState: InternalElementPluginState = {
		_options: options,
		elements: new Map(),
	};

	Object.assign(
		elementPluginEcs,
		clone(elementPluginProperties),
		internalState
	);

	return elementPluginEcs as unknown as Lionecs<
		C,
		S,
		X & ElementPluginExtras<C, S>
	>;
}
