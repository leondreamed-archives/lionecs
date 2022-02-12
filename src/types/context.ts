import type { ComponentKey, ComponentMap, TypeOfComponent } from './component.js';
import type { BaseTypedEntity, Entity } from './entity.js';

type OptionalExtras<R extends Record<string, unknown> | undefined> =
	R extends Record<string, unknown> ? { extras: R } : { extras?: R };

export type ComponentStateListener<
	M extends ComponentMap,
	K extends ComponentKey<M>,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = (
	props: {
		component: K;
		entity: BaseTypedEntity<M, K>;
		oldComponentState: TypeOfComponent<M[K]> | undefined;
	} & OptionalExtras<R>
) => void;

export type EntityStateListener<
	M extends ComponentMap,
	E extends Entity,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = (
	props: {
		entity: E;
		componentKeys: Array<ComponentKey<M>>;
	} & OptionalExtras<R>
) => void;

export type EntityStateListenerContext<
	M extends ComponentMap,
	E extends Entity,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = {
	listener: EntityStateListener<M, E, R>;
	extras: R;
};

export type ComponentStateListenerContext<
	M extends ComponentMap,
	K extends ComponentKey<M>,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> = {
	listener: ComponentStateListener<M, K, R>;
	extras: R;
};

/**
 * A type which represents a state listener (either listening to an entity or a component).
 */
export type StateListener<
	M extends ComponentMap,
	R extends Record<string, unknown> | undefined =
		| Record<string, unknown>
		| undefined
> =
	| EntityStateListener<M, Entity, R>
	| ComponentStateListener<M, ComponentKey<M>, R>;
