import type { ComponentMap } from './component';
import type { LionecsExtras } from './state';
import type { Lionecs } from '~/types/lionecs';

export type LionecsPlugin<
	M extends ComponentMap,
	A extends LionecsExtras // Plugin augmentations
> = (ecs: Lionecs<M>) => Lionecs<M, A>;
