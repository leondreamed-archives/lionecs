import type { Entity } from './entity';
import type { ComponentBase, ComponentKey, ComponentState } from './state';

type OptionalExtras<R extends Record<string, unknown> | undefined> =
	R extends Record<string, unknown> ? { extras: R } : { extras?: R };

export type ComponentStateListener<
	C extends ComponentBase,
	S extends ComponentState<C>,
	K extends ComponentKey<C>,
	R extends Record<string, unknown> | undefined = undefined
> = (
	props: {
		component: K;
		entity: Entity;
		oldComponentState: S[K] | undefined;
	} & OptionalExtras<R>
) => void;

export type EntityStateListener<
	C extends ComponentBase,
	E extends Entity,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = (
	props: {
		entity: E;
		components: ComponentKey<C>[];
	} & OptionalExtras<R>
) => void;

export type EntityStateListenerContext<
	C extends ComponentBase,
	E extends Entity,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = {
	listener: EntityStateListener<C, E, R>;
	extras: R;
};

export type ComponentStateListenerContext<
	C extends ComponentBase,
	S extends ComponentState<C>,
	K extends ComponentKey<C>,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = {
	listener: ComponentStateListener<C, S, K, R>;
	extras: R;
};

/**
 * A type which represents a state listener (either listening to an entity or a component).
 */
export type StateListener<
	C extends ComponentBase,
	S extends ComponentState<C>
> =
	| EntityStateListener<C, Entity>
	| ComponentStateListener<C, S, ComponentKey<C>>;
