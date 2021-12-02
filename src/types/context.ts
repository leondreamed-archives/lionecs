import type { ComponentKey, ComponentMap, TypeOfComponent } from './component';
import type { Entity } from './entity';

type OptionalExtras<R extends Record<string, unknown> | undefined> =
	R extends Record<string, unknown> ? { extras: R } : { extras?: R };

export type ComponentStateListener<
	C extends ComponentMap,
	K extends ComponentKey<C>,
	R extends Record<string, unknown> | undefined = undefined
> = (
	props: {
		component: K;
		entity: Entity;
		oldComponentState: TypeOfComponent<C[K]> | undefined;
	} & OptionalExtras<R>
) => void;

export type EntityStateListener<
	C extends ComponentMap,
	E extends Entity,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = (
	props: {
		entity: E;
		componentKeys: ComponentKey<C>[];
	} & OptionalExtras<R>
) => void;

export type EntityStateListenerContext<
	C extends ComponentMap,
	E extends Entity,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = {
	listener: EntityStateListener<C, E, R>;
	extras: R;
};

export type ComponentStateListenerContext<
	C extends ComponentMap,
	K extends ComponentKey<C>,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = {
	listener: ComponentStateListener<C, K, R>;
	extras: R;
};

/**
 * A type which represents a state listener (either listening to an entity or a component).
 */
export type StateListener<C extends ComponentMap> =
	| EntityStateListener<C, Entity>
	| ComponentStateListener<C, ComponentKey<C>>;
