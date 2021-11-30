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
	O extends ComponentKey<C> | '__empty' = '__empty'
> = Entity & {
	__required: {
		[K in R]: true;
	};
	__optional: {
		[K in O]: true;
	};
};

export type EntityComponent<
	C extends ComponentBase,
	E extends Entity
> = E extends TypedEntity<C, infer R, infer O> ? R | O : ComponentKey<C>;

export type CreateEntityComponentsProp<
	C extends ComponentBase,
	S extends ComponentState<C>,
	E extends Entity
> = E extends TypedEntity<C, infer Req, infer Opt>
	? Opt extends ComponentKey<C>
		? { [K in keyof TypedEntity<C, Req, Opt>['__required']]: S[K] } & {
				[K in keyof TypedEntity<C, Req, Opt>['__optional']]?: S[K];
		  }
		: { [K in keyof TypedEntity<C, Req, Opt>['__required']]: S[K] }
	: { [K in ComponentKey<C>]?: S[K] };

export type CreateEntityProps<
	C extends ComponentBase,
	S extends ComponentState<C>,
	E extends Entity
> = {
	components: CreateEntityComponentsProp<C, S, E>;
};
