import type { ComponentKey, ComponentMap, ComponentType } from './component';

export type Entity = string;

export type EntityMap<
	C extends ComponentMap,
	K extends ComponentKey<C>
> = Record<Entity, Readonly<ComponentType<C[K]>>>;

export type TypedEntity<
	C extends ComponentMap,
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
	C extends ComponentMap,
	E extends Entity
> = E extends TypedEntity<C, infer R, infer O> ? R | O : ComponentKey<C>;

export type CreateEntityComponentsProp<
	C extends ComponentMap,
	E extends Entity
> = E extends TypedEntity<C, infer Req, infer Opt>
	? Opt extends ComponentKey<C>
		? { [K in keyof TypedEntity<C, Req, Opt>['__required']]: C[K] } & {
				[K in keyof TypedEntity<C, Req, Opt>['__optional']]?: C[K];
		  }
		: { [K in keyof TypedEntity<C, Req, Opt>['__required']]: C[K] }
	: { [K in ComponentKey<C>]?: C[K] };

export type CreateEntityProps<C extends ComponentMap, E extends Entity> = {
	components: CreateEntityComponentsProp<C, E>;
};
