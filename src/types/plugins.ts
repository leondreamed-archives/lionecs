import type { Lionecs } from '~/types/lionecs';

import type { ComponentMap } from './component';
import type { LionecsExtras } from './state';

export type LionecsPlugin<
	C extends ComponentMap,
	A extends LionecsExtras // plugin augmentations
> = {
	(ecs: Lionecs<C>): Lionecs<C, A>;
};
