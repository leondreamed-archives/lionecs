import type { ComponentKey, ComponentMap, TypeOfComponent } from './component';
import type { BaseTypedEntity, Entity } from './entity';

export type EntityPProxy<
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
