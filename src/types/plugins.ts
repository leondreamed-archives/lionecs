import type { Lionecs } from '~/types/lionecs';

import type { ComponentMap } from './component';
import type { LionecsExtras } from './state';

export type LionecsPlugin<
	M extends ComponentMap,
	A extends LionecsExtras // plugin augmentations
> = {
	(ecs: Lionecs<M>): Lionecs<M, A>;
};
