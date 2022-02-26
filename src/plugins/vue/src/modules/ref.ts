import type { Ref } from 'vue';
import { ref } from 'vue';

import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
	TypeOfComponent,
} from '~/types/component.js';
import type { BaseTypedEntity, Entity } from '~/types/entity.js';
import { useDefineMethods } from '~/utils/methods.js';

export function refModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	type UseLionecsRefOptions = {
		optional: boolean;
	};

	// `get(entity, component, options)`
	const { useLionecsRef } = defineMethods({
		useLionecsRef: function <
			E extends Entity,
			K extends E extends BaseTypedEntity<M, infer Req, infer Opt>
				? Req | Opt
				: ComponentKey<M>,
			O extends E extends BaseTypedEntity<M, infer _Req, infer Opt>
				? K extends Opt
					? { optional: true }
					: { optional: false }
				: UseLionecsRefOptions
		>(
			entity: E,
			component: K | ComponentFromKey<M, K>,
			options?: O
		): Ref<
			O extends UseLionecsRefOptions
				? O['optional'] extends true
					? TypeOfComponent<M[K]> | undefined
					: TypeOfComponent<M[K]>
				: TypeOfComponent<M[K]> | undefined
		> {
			const componentKey = this.getComponentKey(component);
			const componentStateRef = ref<TypeOfComponent<M[K]>>(
				this.get(entity, componentKey) as TypeOfComponent<M[K]>
			);

			// Registers a listener
			this.addEntityStateListener({
				entity,
				listener: ({ componentKeys }) => {
					if (componentKeys.includes(componentKey)) {
						const newComponentState = this.get(
							entity,
							componentKey
						) as TypeOfComponent<M[K]>;
						if (!options?.optional && newComponentState === undefined) {
							throw new Error(
								`Property ${componentKey} of entity ${entity.__key} was specified as required, but undefined was found.`
							);
						}

						(componentStateRef.value as any) = newComponentState;
					}
				},
			});

			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return componentStateRef as any;
		},
	});

	return {
		useLionecsRef,
	};
}
