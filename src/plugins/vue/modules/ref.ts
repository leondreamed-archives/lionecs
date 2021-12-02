import type { Ref } from 'vue';
import { ref } from 'vue';

import type {
	Component,
	ComponentKey,
	ComponentMap,
	ComponentType,
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
						| TypedEntity<Req, Opt>['__required']
						| TypedEntity<Req, Opt>['__optional']
				: ComponentKey<M>,
			O extends E extends TypedEntity<infer Req, infer Opt>
				? M extends TypedEntity<Req, Opt>['__optional']
					? { optional: true }
					: { optional: false }
				: UseLionecsRefOptions
		>(
			entity: E,
			component: Component<K, M[K]>,
			options?: O
		): Ref<
			O extends UseLionecsRefOptions
				? O['optional'] extends true
					? ComponentType<M[K]> | undefined
					: ComponentType<M[K]>
				: ComponentType<M[K]> | undefined
		> {
			const componentStateRef = ref<ComponentType<M[K]>>(
				this.get(entity, component)
			);

			// Registers a listener
			this.addEntityStateListener({
				entity,
				listener: ({ components }) => {
					if (components.includes(component)) {
						const newComponentState = this.get(entity, component);
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
