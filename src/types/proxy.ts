import type { ComponentKey, ComponentMap, TypeOfComponent } from './component';
import type { BaseTypedEntityComponents, Entity } from './entity';

export type EntityPProxy<
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
