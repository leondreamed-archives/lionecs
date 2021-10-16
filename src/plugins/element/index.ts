import rfdc from 'rfdc';

import type { InternalLionecs, Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentState,
	LionecsExtras,
} from '~/types/state';

import * as elementModules from './modules';
import type {
	ElementExtras,
	ElementPluginOptions,
	InternalElementExtras,
	InternalElementExtrasInner,
	InternalElementProperties,
	InternalElementState,
} from './types';

export const elementPluginOptionsDefaults: ElementPluginOptions = {
	setIdAttribute: true,
};

const clone = rfdc();
const elementModulesObj = { ...elementModules };
const elementProperties = {} as InternalElementProperties<any, any>;
for (const module of Object.values(elementModulesObj)) {
	for (const [fn, value] of Object.entries(module<any, any>())) {
		elementProperties[fn as keyof InternalElementProperties<any, any>] = value;
	}
}

export function elementPlugin<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras
>(
	this: Lionecs<C, S, X>,
	options?: ElementPluginOptions
): Lionecs<C, S, X & ElementExtras<C, S>> {
	options = { ...elementPluginOptionsDefaults, ...options };

	const elementEcs = this as unknown as InternalLionecs<
		C,
		S,
		X & InternalElementExtras<C, S>
	>;

	const internalState: InternalElementState = {
		_options: options,
		elements: new Map(),
	};

	elementEcs.element = Object.assign(
		clone(elementProperties),
		internalState
	) as InternalElementExtrasInner<C, S>;

	return elementEcs as unknown as Lionecs<C, S, X & ElementExtras<C, S>>;
}
