import type { ComponentBase, ComponentKey, ComponentState } from './state';

export type Entity = string;

export type EntityMap<
	C extends ComponentBase,
	S extends ComponentState<C>,
	K extends ComponentKey<C>
> = Record<Entity, Readonly<S[K]>>;

export type TypedEntity<
	C extends ComponentBase,
	R extends ComponentKey<C>,
	O extends ComponentKey<C> | undefined = undefined
> = Entity & {
	__requiredComponents: R;
	__optionalComponents: O;
};
