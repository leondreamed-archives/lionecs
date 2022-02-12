import {
	BaseTypedEntity,
	Component,
	ComponentMap,
	KeyOfComponent,
} from '~/exports.js';

export function useDefineEntities<M extends ComponentMap>() {
	type ComponentsArray = readonly Component<M, string, unknown>[];
	type ComponentsObject = {
		required: ComponentsArray;
		optional?: ComponentsArray;
	};

	return function defineEntities<
		Entities extends Record<
			string,
			// An array on its own is by default all required
			ComponentsArray | ComponentsObject
		>
	>(
		_e: Entities
	): {
		[K in keyof Entities]: Entities[K] extends ComponentsObject
			? BaseTypedEntity<
					M,
					KeyOfComponent<Entities[K]['required'][number]>,
					Entities[K]['optional'] extends ComponentsArray
						? KeyOfComponent<NonNullable<Entities[K]['optional']>[number]>
						: never
			  >
			: Entities[K] extends ComponentsArray
			? BaseTypedEntity<M, KeyOfComponent<Entities[K][number]>, never>
			: never;
	} {
		return {} as any;
	};
}
