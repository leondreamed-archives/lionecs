import type { ComponentMap } from './component.js';
import type { LionecsExtras } from './state.js';
import type { Lionecs } from '~/types/lionecs.js';

export type LionecsPlugin<
	M extends ComponentMap,
	A extends LionecsExtras // Plugin augmentations
> = (ecs: Lionecs<M>) => Lionecs<M, A>;
