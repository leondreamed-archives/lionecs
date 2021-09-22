import type { Entity } from "./entity";
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	LionecsState,
} from "./state";

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
		oldState: LionecsState<C, S>;
		entities: Entity[];
	} & OptionalExtras<R>
) => void;

export type EntityStateListener<
	E extends Entity,
	C extends ComponentBase,
	S extends ComponentState<C>,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = (
	props: {
		entity: E;
		oldState: LionecsState<C, S>;
		components: ComponentKey<C>[];
	} & OptionalExtras<R>
) => void;

export type EntityStateListenerContext<
	C extends ComponentBase,
	S extends ComponentState<C>,
	E extends Entity,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = {
	listener: EntityStateListener<E, C, S, R>;
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
	| EntityStateListener<Entity, C, S>
	| ComponentStateListener<C, S, ComponentKey<C>>;
