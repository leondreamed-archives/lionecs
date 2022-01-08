import type { ComponentKey, ComponentMap, TypeOfComponent } from './component';
import type { BaseTypedEntity, Entity } from './entity';

export type EntityProxy<
	M extends ComponentMap,
	E extends Entity
> = E extends BaseTypedEntity<M, infer Req, infer Opt>
	? {
			[K in Req]: TypeOfComponent<M[K]>;
	  } & {
			[K in Opt]?: TypeOfComponent<M[K]>;
	  }
	: { [K in ComponentKey<M>]?: TypeOfComponent<M[K]> };
