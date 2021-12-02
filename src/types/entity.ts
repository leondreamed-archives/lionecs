import type {
	Component,
	ComponentKey,
	ComponentMap,
	KeyOfComponent,
	TypeOfComponent,
} from './component';

export type Entity = string;

export type EntityMap<
	C extends ComponentMap,
	K extends ComponentKey<C>
> = Record<Entity, Readonly<TypeOfComponent<C[K]>>>;

export type TypedEntity<
	R extends ComponentKey<ComponentMap>,
	O extends ComponentKey<ComponentMap> | '__empty' = '__empty'
> = Entity & {
	__required: {
		[K in R]: true;
	};
	__optional: {
		[K in O]: true;
	};
};

export type DefineTypedEntity<
	R extends Component<string, unknown>,
	O extends Component<string, unknown> = Component<'__empty', never>
> = TypedEntity<KeyOfComponent<R>, KeyOfComponent<O>>;

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
				[K in keyof TypedEntity<Req, Opt>['__required']]: TypeOfComponent<C[K]>;
		  } & {
				[K in keyof TypedEntity<Req, Opt>['__optional']]?: TypeOfComponent<C[K]>;
		  }
		: { [K in keyof TypedEntity<Req, Opt>['__required']]: TypeOfComponent<C[K]> }
	: { [K in ComponentKey<C>]?: TypeOfComponent<C[K]> };

export type CreateEntityProps<C extends ComponentMap, E extends Entity> = {
	components: CreateEntityComponentsProp<C, E>;
};
