import type { Entity } from './entity';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	ComponentStateTypes,
} from './state';

export type MultiComponentStateChangeHandler<
	C extends ComponentBase,
	S extends ComponentState<C>,
	K extends readonly ComponentKey<C>[],
	E extends Entity,
	R extends Record<string, unknown>
> = {
	oldComponentStates: ComponentStateTypes<C, S, K>;
	components: K;
	callback(props: {
		entity: E;
		extras: R;
		oldComponentStates: ComponentStateTypes<C, S, K>;
		newComponentStates: ComponentStateTypes<C, S, K>;
	}): void;
};

export type SingleComponentStateChangeHandler<
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
