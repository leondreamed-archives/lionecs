import type {
	Component,
	ComponentKey,
	ComponentMap,
	KeyOfComponent,
	TypeOfComponent,
} from './component';

export type Entity = string;

export type EntityMap<
	M extends ComponentMap,
	K extends ComponentKey<M>
> = Record<Entity, Readonly<TypeOfComponent<M[K]>>>;

export type BaseTypedEntity<
	M extends ComponentMap,
	R extends ComponentKey<M>,
	O extends ComponentKey<M> | '__empty' = '__empty'
> = Entity & {
	__required: {
		[K in R]: true;
	};
	__optional: {
		[K in O]: true;
	};
};

export type BaseDefineTypedEntity<
	M extends ComponentMap,
	R extends Component<string, unknown>,
	O extends Component<string, unknown> = Component<'__empty', never>
> = BaseTypedEntity<M, KeyOfComponent<R>, KeyOfComponent<O>>;

export type EntityComponent<
	M extends ComponentMap,
	E extends Entity
> = E extends BaseTypedEntity<M, infer R, infer O> ? R | O : ComponentKey<M>;

export type CreateEntityComponentsProp<
	M extends ComponentMap,
	E extends Entity
> = E extends BaseTypedEntity<M, infer Req, infer Opt>
	? Opt extends ComponentKey<M>
		? {
				[K in keyof BaseTypedEntity<
					M,
					Req,
					Opt
				>['__required']]: TypeOfComponent<M[K]>;
		  } & {
				[K in keyof BaseTypedEntity<
					M,
					Req,
					Opt
				>['__optional']]?: TypeOfComponent<M[K]>;
		  }
		: {
				[K in keyof BaseTypedEntity<
					M,
					Req,
					Opt
				>['__required']]: TypeOfComponent<M[K]>;
		  }
	: { [K in ComponentKey<M>]?: TypeOfComponent<M[K]> };

export type CreateEntityProps<M extends ComponentMap, E extends Entity> = {
	components: CreateEntityComponentsProp<M, E>;
};
