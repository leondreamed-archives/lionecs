import type { Ref } from 'vue';
import { ref } from 'vue';

import type { Entity, TypedEntity } from '~/types/entity';
import type { InternalLionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
} from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function refModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

	type UseLionecsRefOptions = {
		optional: boolean;
	};

	// get(entity, component, options)
	const { useLionecsRef } = defineMethods({
		useLionecsRef: function <
			E extends Entity,
			K extends E extends TypedEntity<infer Req, infer Opt>
				?
						| TypedEntity<Req, Opt>['__requiredComponents']
						| TypedEntity<Req, Opt>['__optionalComponents']
				: ComponentKey<C>,
			O extends E extends TypedEntity<infer Req, infer Opt>
				? C extends TypedEntity<Req, Opt>['__optionalComponents']
					? { optional: true }
					: { optional: false }
				: UseLionecsRefOptions
		>(
			entity: E,
			component: K,
			options?: O
		): Ref<
			O extends UseLionecsRefOptions
				? O['optional'] extends true
					? S[K] | undefined
					: S[K]
				: S[K] | undefined
		> {
			const componentStateRef = ref<S[K]>(this.get(entity, component));

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
