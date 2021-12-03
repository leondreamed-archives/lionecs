import type { Entity, TypedEntity } from '~/types';
import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
} from '~/types/component';
import { useDefineMethods } from '~/utils/methods';

type ComponentKeyOrComponent<
	M extends ComponentMap,
	RKS extends ComponentKey<M>[]
> = {
	// Can either be an array of component keys or an array
	// of components
	[K in keyof RKS]:
		| RKS[K]
		| (K extends number ? ComponentFromKey<M, RKS[K]> : never);
};

type Query<M extends ComponentMap, KS extends ComponentKey<M>[]> = {
	required: ComponentKeyOrComponent<M, KS>;
};

export function queryModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();
	return defineMethods({
		/**
		 * Creates a query that matches entities based on their components. The
		 * query is lazy and only iterates through the components when another function
		 * is activated with the query.
		 */
		query: function <RKS extends ComponentKey<M>[]>(query: Query<M, RKS>) {
			const requiredComponentKeys = query.required.map((c) =>
				this.getComponentKey(c)
			);

			const _matchingEntities = new Set<Entity>();

			/**
			 * Populates the matching cache and registers all the component state
			 * listeners for the required components to keep the cache updated.
			 */
			const initializeQuery = () => {
				let minComponentLen = 0;
				let minComponentKey: ComponentKey<M> | undefined;

				for (const requiredComponentKey of requiredComponentKeys) {
					const len = Object.keys(
						this.state.components[requiredComponentKey]
					).length;
					if (len < minComponentLen) {
						minComponentLen = len;
						minComponentKey = requiredComponentKey;
					}
				}

				const nonMinRequiredComponentKeys = requiredComponentKeys.filter(
					(key) => key !== minComponentKey
				);

				// Loop through the component map of the component with the least number of entities
				for (const componentMap of Object.keys(
					this.state.components[minComponentKey]
				)) {
					for (const possibleEntity of Object.keys(componentMap)) {
						let isMatchingEntity = true;
						for (const nonMinRequiredComponentKey of nonMinRequiredComponentKeys) {
							// If this entity does not have the component, mark it as not matching the query
							if (
								this.getOpt(possibleEntity, nonMinRequiredComponentKey) ===
								undefined
							) {
								isMatchingEntity = false;
								break;
							}
						}
						if (isMatchingEntity) {
							_matchingEntities.add(possibleEntity);
						}
					}
				}

				// Now that the matching entities set has been populated, we register
				// a listener to watch all the required components and if the component
				// 
			};

			/**
			 * Loop through every entity that satisfies the component query
			 * options.
			 */
			const each = (cb: (entity: TypedEntity<M, RKS[number]>) => {}) => {};

			return {
				componentKeys,
			};
		},
	});
}
