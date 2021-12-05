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

export interface BaseTypedEntityComponents<
	M extends ComponentMap,
	_R extends ComponentKey<M>,
	_O extends ComponentKey<M> | undefined
> {}

export type BaseTypedEntity<
	M extends ComponentMap,
	R extends ComponentKey<M>,
	O extends ComponentKey<M> | undefined = undefined
> = Entity & BaseTypedEntityComponents<M, R, O>;

export type BaseDefineTypedEntity<
	M extends ComponentMap,
	R extends Component<string, unknown>,
	O extends Component<string, unknown> | undefined = undefined
> = BaseTypedEntity<
	M,
	KeyOfComponent<R>,
	O extends Component<string, unknown> ? KeyOfComponent<O> : undefined
>;

export type EntityComponent<
	M extends ComponentMap,
	E extends Entity
> = E extends BaseTypedEntity<M, infer R, infer O> ? R | O : ComponentKey<M>;

export type CreateEntityComponentsProp<
	M extends ComponentMap,
	E extends Entity
> = E extends BaseTypedEntityComponents<M, infer Req, infer Opt>
	? Opt extends ComponentKey<M>
		? {
				[K in keyof Req]: K extends ComponentKey<M>
					? TypeOfComponent<M[K]>
					: never;
		  } & {
				[K in keyof Opt]: K extends ComponentKey<M>
					? TypeOfComponent<M[K]>
					: never;
		  }
		: {
				[K in keyof Req]: K extends ComponentKey<M>
					? TypeOfComponent<M[K]>
					: never;
		  }
	: { [K in ComponentKey<M>]?: TypeOfComponent<M[K]> };

export type CreateEntityProps<M extends ComponentMap, E extends Entity> = {
	components: CreateEntityComponentsProp<M, E>;
};
