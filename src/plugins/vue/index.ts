import rfdc from 'rfdc';

import type { InternalLionecs, Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentState,
	LionecsExtras,
} from '~/types/state';

import * as vuePluginModules from './modules';
import type { InternalVuePluginProperties } from './types';

const clone = rfdc();
const vuePluginModulesObj = { ...vuePluginModules };
const vuePluginProperties = {} as InternalVuePluginProperties<any, any>;
for (const module of Object.values(vuePluginModulesObj)) {
	for (const [fn, value] of Object.entries(module<any, any>())) {
		vuePluginProperties[fn as keyof InternalVuePluginProperties<any, any>] =
			value;
	}
}

export function elementPlugin<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras
>(this: Lionecs<C, S, X>): Lionecs<C, S, X> {
	const vuePluginEcs = this as unknown as InternalLionecs<C, S>;

	Object.assign(vuePluginEcs, clone(vuePluginProperties));

	return vuePluginEcs as unknown as Lionecs<C, S, X>;
}
