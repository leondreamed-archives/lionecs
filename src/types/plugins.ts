import type { Lionecs } from '~/types/lionecs';

import type { ComponentBase, ComponentState, LionecsExtras } from './state';

export type LionecsPlugin<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras = LionecsExtras,
	A extends LionecsExtras = LionecsExtras
> = {
	(ecs: Lionecs<C, S, X>): Lionecs<C, S, X & A>;
};
