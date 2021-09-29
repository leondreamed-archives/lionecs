import type { Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentState,
	LionecsExtras,
} from '~/types/state';

import * as elementModules from './modules';
import type { ElementExtras, ElementMethods, ElementProperty } from './types';

export function elementPlugin<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras
>(ecs: Lionecs<C, S, X>): Lionecs<C, S, X & ElementExtras<C, S>> {
	const elementEcs = ecs as unknown as Lionecs<C, S, X & ElementExtras<C, S>>;

	const elementModulesObj = { ...elementModules };
	for (const module of Object.values(elementModulesObj)) {
		for (const [fn, value] of Object.entries(module<C, S>())) {
			elementEcs[fn as keyof ElementMethods<C, S>] = value;
		}
	}

	elementEcs.elements = new Map<ElementProperty, Element>();

	return elementEcs;
}
