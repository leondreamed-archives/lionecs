import type { Lionecs } from '~/types/lionecs';

import type { ComponentBase, ComponentState, LionecsExtras } from './state';

export type LionecsPlugin<
	C extends ComponentBase,
	S extends ComponentState<C>,
	A extends LionecsExtras // plugin augmentations
> = {
	(ecs: Lionecs<C, S>): Lionecs<C, S, A>;
};
