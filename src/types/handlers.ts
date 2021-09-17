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
	E extends Entity,
	R extends Record<string, unknown>
> = {
	oldComponentStates: ComponentStateTypes<C, S, readonly ComponentKey<C>[]>;
	components: readonly ComponentKey<C>[];
	callback(props: {
		entity: E;
		extras: R;
		oldComponentStates: ComponentStateTypes<C, S, readonly ComponentKey<C>[]>;
		newComponentStates: ComponentStateTypes<C, S, readonly ComponentKey<C>[]>;
	}): void;
};

export type SingleComponentStateChangeHandler<
	C extends ComponentBase,
	S extends ComponentState<C>,
	E extends Entity,
	R extends Record<string, unknown>
> = {
	oldComponentState: S[ComponentKey<C>] | undefined;
	component: ComponentKey<C>;
	callback(props: {
		entity: E;
		extras: R;
		oldComponentState: S[ComponentKey<C>] | undefined;
		newComponentState: S[ComponentKey<C>] | undefined;
	}): void;
};
