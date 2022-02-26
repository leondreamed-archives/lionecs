import type { UnionToIntersection } from 'utility-types';

import * as lionecsModules from '../modules/index.js';
import type { ComponentMap } from './component.js';

class ModuleWrapper<M extends ComponentMap> {
	t() {
		return lionecsModules['' as keyof typeof lionecsModules]<M>();
	}
}

export type InternalLionecsProperties<M extends ComponentMap> =
	UnionToIntersection<ReturnType<ModuleWrapper<M>['t']>>;

// eslint-disable-next-line no-warning-comments
/* TODO: When TypeScript 4.7 comes out
const moduleWrapper = <M extends ComponentMap>() => lionecsModules['' as keyof typeof lionecsModules]<M>();

export type InternalLionecsProperties<M extends ComponentMap> =
	UnionToIntersection<ReturnType<typeof moduleWrapper<M>>>;
*/
