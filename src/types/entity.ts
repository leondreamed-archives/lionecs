import type {
	Component,
	ComponentKey,
	ComponentMap,
	KeyOfComponent,
	TypeOfComponent,
} from './component.js';

export type EntityKey = string;
export type Entity = { __key: EntityKey };

export type EntityMap<
	M extends ComponentMap,
	K extends ComponentKey<M>
> = Record<EntityKey, Readonly<TypeOfComponent<M[K]>>>;

export interface BaseTypedEntity<
	M extends ComponentMap,
	R extends ComponentKey<M>,
	O extends ComponentKey<M> | never = never
> extends Entity {
	__required?: {
		[K in R]: true;
	};
	__optional?: {
		[K in O]: true;
	};
}

export type BaseDefineTypedEntity<
	M extends ComponentMap,
	R extends Component<string, unknown>,
	O extends Component<string, unknown> | never = never
> = BaseTypedEntity<M, KeyOfComponent<R>, KeyOfComponent<O>>;

export type BaseExtendTypedEntity<
	M extends ComponentMap,
	Parent extends Entity,
	Child extends Entity
> = Parent extends BaseTypedEntity<M, infer PR, infer PO>
	? Child extends BaseTypedEntity<M, infer CR, infer CO>
		? BaseTypedEntity<M, PR | CR, NonNullable<PO | CO>>
		: never
	: never;

export type CreateEntityComponents<
	M extends ComponentMap,
	E extends Entity
> = E extends BaseTypedEntity<M, infer Req, infer Opt>
	? {
			[K in Req]: TypeOfComponent<M[K]>;
	  } & {
			[K in Opt]?: TypeOfComponent<M[K]>;
	  }
	: { [K in ComponentKey<M>]?: TypeOfComponent<M[K]> };
