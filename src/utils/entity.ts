import {
	BaseTypedEntity,
	Component,
	ComponentMap,
	KeyOfComponent,
} from '~/exports.js';

export function useDefineEntities<M extends ComponentMap>() {
	return function defineEntities<
		Entities extends Record<
			string,
			{
				required: readonly Component<M, string, unknown>[];
				optional?: readonly Component<M, string, unknown>[];
			}
		>
	>(
		_e: Entities
	): {
		[K in keyof Entities]: BaseTypedEntity<
			M,
			KeyOfComponent<Entities[K]['required'][number]>,
			Entities[K]['optional'] extends Component<M, string, unknown>[]
				? KeyOfComponent<Entities[K]['optional'][number]>
				: never
		>;
	} {
		return {} as any;
	};
}
