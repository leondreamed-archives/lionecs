import type { ComponentKey, ComponentMap } from './component';
import type { Entity } from './entity';

export type ComponentStateChangeHandler<
	C extends ComponentMap,
	K extends ComponentKey<C>,
	E extends Entity,
	R extends Record<string, unknown>
> = {
	oldComponentState: C[K] | undefined;
	component: K;
	callback(props: {
		entity: E;
		extras: R;
		oldComponentState: C[K] | undefined;
		newComponentState: C[K] | undefined;
	}): void;
};
