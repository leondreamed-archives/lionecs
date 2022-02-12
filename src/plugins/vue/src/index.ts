import { retrieveModuleProperties, createInstance } from 'lion-architecture';
import type {
	ComponentMap,
	InternalLionecs,
	Lionecs,
	LionecsExtras,
} from '~/types/index.js';

import * as vuePluginModules from './modules/index.js';
import type { InternalVuePluginProperties, VuePluginProperties } from './types.js';

const vuePluginProperties = retrieveModuleProperties(
	vuePluginModules
) as InternalVuePluginProperties<any>;

export function elementPlugin<M extends ComponentMap, X extends LionecsExtras>(
	this: Lionecs<M, X>
): Lionecs<M, X> {
	const vuePluginEcs = this as InternalLionecs<M, X>;

	Object.assign(vuePluginEcs, createInstance(vuePluginProperties, {}));

	return vuePluginEcs as unknown as Lionecs<M, X> & VuePluginProperties<M>;
}
