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
			[
				requiredComponents: Component<string, unknown>,
				optionalComponents?: Component<string, unknown>
			]
		>
	>(): {
		[K in keyof Entities]: BaseTypedEntity<
			M,
			KeyOfComponent<Entities[K]['0']>,
			Entities[K]['1'] extends Component<string, unknown>
				? KeyOfComponent<Entities[K]['1']>
				: never
		>;
	} {
		return {} as any;
	};
}
