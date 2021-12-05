import { retrieveModuleProperties } from 'lion-architecture';
import type {
	ComponentMap,
	InternalLionecs,
	Lionecs,
	LionecsExtras,
} from 'lionecs';
import rfdc from 'rfdc';

import * as vuePluginModules from './modules';
import type { InternalVuePluginProperties, VuePluginProperties } from './types';

const clone = rfdc();
const vuePluginProperties = retrieveModuleProperties(
	vuePluginModules
) as InternalVuePluginProperties<any>;

export function elementPlugin<M extends ComponentMap, X extends LionecsExtras>(
	this: Lionecs<M, X>
): Lionecs<M, X> {
	const vuePluginEcs = this as InternalLionecs<M, X>;

	Object.assign(vuePluginEcs, clone(vuePluginProperties));

	return vuePluginEcs as unknown as Lionecs<M, X> & VuePluginProperties<M>;
}
