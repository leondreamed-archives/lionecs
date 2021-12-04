import { retrieveModuleProperties } from 'lion-architecture';
import rfdc from 'rfdc';

import type { ComponentMap, InternalLionecs, Lionecs, LionecsExtras } from 'lionecs';

import * as vuePluginModules from './modules';
import type { InternalVuePluginProperties } from './types';

const clone = rfdc();
const vuePluginProperties = retrieveModuleProperties(
	vuePluginModules
) as InternalVuePluginProperties<any, any>;

export function elementPlugin<M extends ComponentMap, X extends LionecsExtras>(
	this: Lionecs<M, X>
): Lionecs<M, X> {
	const vuePluginEcs = this as InternalLionecs<M, X>;

	Object.assign(vuePluginEcs, clone(vuePluginProperties));

	return vuePluginEcs as unknown as Lionecs<M, X> & ;
}