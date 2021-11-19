import type { Entity } from './entity';
import type { ComponentBase, ComponentKey, ComponentState } from './state';

export type ComponentStateChangeHandler<
	C extends ComponentBase,
	S extends ComponentState<C>,
	K extends ComponentKey<C>,
	E extends Entity,
	R extends Record<string, unknown>
> = {
	oldComponentState: S[K] | undefined;
	component: K;
	callback(props: {
		entity: E;
		extras: R;
		oldComponentState: S[K] | undefined;
		newComponentState: S[K] | undefined;
	}): void;
};
