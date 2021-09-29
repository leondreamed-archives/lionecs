import type { Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentState,
	LionecsExtras,
} from '~/types/state';

import * as elementModules from './modules';
import type {
	ElementExtras,
	ElementMethods,
	ElementPluginOptions,
	ElementProperty,
} from './types';

export const elementPluginOptionsDefaults: ElementPluginOptions = {
	setIdAttribute: true,
};

export function elementPlugin<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras
>(
	this: Lionecs<C, S, X>,
	options?: ElementPluginOptions
): Lionecs<C, S, X & ElementExtras<C, S>> {
	options = { ...elementPluginOptionsDefaults, ...options };

	const elementEcs = this as unknown as Lionecs<C, S, X & ElementExtras<C, S>>;

	const elementModulesObj = { ...elementModules };
	for (const module of Object.values(elementModulesObj)) {
		for (const [fn, value] of Object.entries(module<C, S>(options))) {
			elementEcs[fn as keyof ElementMethods<C, S>] = value;
		}
	}

	elementEcs.elements = new Map<ElementProperty, Element>();

	return elementEcs;
}
