import type {
	Component,
	ComponentKey,
	ComponentMap,
	KeyOfComponent,
	TypeOfComponent,
} from './component';

export type EntityKey = string;
export type Entity = { __key: EntityKey };

export type EntityMap<
	M extends ComponentMap,
	K extends ComponentKey<M>
> = Record<EntityKey, Readonly<TypeOfComponent<M[K]>>>;

export interface BaseTypedEntity<
	M extends ComponentMap,
	R extends ComponentKey<M>,
	O extends ComponentKey<M> | undefined = undefined
> extends Entity {
	__required: {
		[K in R]: true;
	};
	__optional: O extends ComponentKey<M>
		? {
				[K in O]: true;
		  }
		: Record<never, never>;
}

export type BaseDefineTypedEntity<
	M extends ComponentMap,
	R extends Component<string, unknown>,
	O extends Component<string, unknown> | undefined = undefined
> = BaseTypedEntity<
	M,
	KeyOfComponent<R>,
	O extends Component<string, unknown> ? KeyOfComponent<O> : undefined
>;

export type BaseExtendTypedEntity<
	M extends ComponentMap,
	Parent extends Entity,
	Child extends Entity
> = Parent extends BaseTypedEntity<M, infer PR, infer PO>
	? Child extends BaseTypedEntity<M, infer CR, infer CO>
		? BaseTypedEntity<M, PR | CR, NonNullable<PO | CO>>
		: never
	: never;

export type EntityComponent<
	M extends ComponentMap,
	E extends Entity
> = E extends BaseTypedEntity<M, infer R, infer O> ? R | O : ComponentKey<M>;

export type CreateEntityProps<M extends ComponentMap, E extends Entity> = {
	components: E extends BaseTypedEntity<M, infer Req, infer Opt>
		? Opt extends ComponentKey<M>
			? {
					[K in Req]: TypeOfComponent<M[K]>;
			  } & {
					[K in Opt]: TypeOfComponent<M[K]>;
			  }
			: {
					[K in Req]: TypeOfComponent<M[K]>;
			  }
		: { [K in ComponentKey<M>]?: TypeOfComponent<M[K]> };
};
