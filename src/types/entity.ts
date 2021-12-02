import type {
	Component,
	ComponentKey,
	ComponentMap,
	ComponentType,
} from './component';

export type Entity = string;

export type EntityMap<
	C extends ComponentMap,
	K extends ComponentKey<C>
> = Record<Entity, Readonly<ComponentType<C[K]>>>;

export type TypedEntity<
	R extends Component<string, unknown>,
	O extends Component<string, unknown> = Component<'__empty', never>
> = Entity & {
	__required: {
		[K in R['__name']]: true;
	};
	__optional: {
		[K in O['__name']]: true;
	};
};

export type EntityComponent<
	C extends ComponentMap,
	E extends Entity
> = E extends TypedEntity<infer R, infer O> ? R | O : ComponentKey<C>;

export type CreateEntityComponentsProp<
	C extends ComponentMap,
	E extends Entity
> = E extends TypedEntity<infer Req, infer Opt>
	? Opt extends ComponentKey<C>
		? {
				[K in keyof TypedEntity<Req, Opt>['__required']]: ComponentType<C[K]>;
		  } & {
				[K in keyof TypedEntity<Req, Opt>['__optional']]?: ComponentType<C[K]>;
		  }
		: { [K in keyof TypedEntity<Req, Opt>['__required']]: ComponentType<C[K]> }
	: { [K in ComponentKey<C>]?: ComponentType<C[K]> };

export type CreateEntityProps<C extends ComponentMap, E extends Entity> = {
	components: CreateEntityComponentsProp<C, E>;
};
