import type { Ref } from 'vue';
import { ref } from 'vue';

import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
	TypeOfComponent,
} from '~/types/component';
import type { Entity, TypedEntity } from '~/types/entity';
import { useDefineMethods } from '~/utils/methods';

export function refModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	type UseLionecsRefOptions = {
		optional: boolean;
	};

	// get(entity, component, options)
	const { useLionecsRef } = defineMethods({
		useLionecsRef: function <
			E extends Entity,
			K extends E extends TypedEntity<infer Req, infer Opt>
				?
						| keyof TypedEntity<Req, Opt>['__required']
						| keyof TypedEntity<Req, Opt>['__optional']
				: ComponentKey<M>,
			O extends E extends TypedEntity<infer Req, infer Opt>
				? M extends keyof TypedEntity<Req, Opt>['__optional']
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
				this.get(entity, componentKey)
			);

			// Registers a listener
			this.addEntityStateListener({
				entity,
				listener: ({ componentKeys }) => {
					if (componentKeys.includes(componentKey)) {
						const newComponentState = this.get(entity, componentKey);
						if (!options?.optional && newComponentState === undefined) {
							throw new Error(
								`Property ${component} of entity ${entity} was specified as required, but undefined was found.`
							);
						}
						componentStateRef.value = newComponentState;
					}
				},
			});

			return componentStateRef;
		},
	});

	return {
		useLionecsRef,
	};
}
