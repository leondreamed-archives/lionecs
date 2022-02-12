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
	RequiredComponentKeys extends ComponentKey<M>,
	OptionalComponentKeys extends ComponentKey<M> | never = never
> extends Entity {
	__required?: {
		[K in RequiredComponentKeys]: true;
	};
	__optional?: {
		[K in OptionalComponentKeys]: true;
	};
}

/**
 * An entity with certain components.
 */
export type TypedEntity<
	RequiredComponents extends Component<ComponentMap, string, unknown>,
	OptionalComponents extends
		| Component<ComponentMap, string, unknown>
		| never = never
> = RequiredComponents extends Component<infer M, infer _K, infer _T>
	? BaseTypedEntity<
			M,
			KeyOfComponent<RequiredComponents>,
			KeyOfComponent<OptionalComponents>
	  >
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
