import type { BaseTypedEntity, Entity, EntityKey } from '~/types/index.js';
import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
} from '~/types/component.js';
import { useDefineMethods } from '~/utils/methods.js';

type ComponentKeyOrComponent<
	M extends ComponentMap,
	RequiredKeys extends Array<ComponentKey<M>>
> = {
	// Can either be an array of component keys or an array
	// of components
	[K in keyof RequiredKeys]:
		| RequiredKeys[K]
		| (K extends number ? ComponentFromKey<M, RequiredKeys[K]> : never);
};

type Query<M extends ComponentMap, Keys extends Array<ComponentKey<M>>> = {
	required: ComponentKeyOrComponent<M, Keys>;
};

export function queryModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();
	return defineMethods({
		/**
		 * Creates a query that matches entities based on their components. The
		 * query is lazy and only iterates through the components when another function
		 * is activated with the query.
		 */
		query<RequiredKeys extends Array<ComponentKey<M>>>(
			query: Query<M, RequiredKeys>
		) {
			if (query.required.length === 0) {
				throw new Error('At least one required component must be specified.');
			}

			const requiredComponentKeys = query.required.map((c) =>
				this.getComponentKey(c)
			);

			const _matchingEntityKeys = new Set<EntityKey>();

			let _isQueryInitialized = false;

			const getMinimumComponentKey = () => {
				// Finding the minimum component key to iterate over
				let minComponentKey: ComponentKey<M> | undefined;
				let minComponentLen = Number.POSITIVE_INFINITY;

				for (const requiredComponentKey of requiredComponentKeys) {
					const len = Object.keys(
						this.state.components[requiredComponentKey]
					).length;
					if (len < minComponentLen) {
						minComponentLen = len;
						minComponentKey = requiredComponentKey;
					}
				}

				return minComponentKey;
			};

			const isMatchingEntity = (
				entity: Entity
			): entity is BaseTypedEntity<M, RequiredKeys[number]> => {
				const minComponentKey = getMinimumComponentKey();
				for (const requiredComponentKey of requiredComponentKeys) {
					// No need to check whether the entity has the minComponentKey because we're iterating
					// over those entities
					if (minComponentKey === requiredComponentKey) continue;

					// If this entity does not have the component, mark it as not matching the query
					if (this.getOpt(entity, requiredComponentKey) === undefined) {
						return false;
					}
				}

				return true;
			};

			/**
			 * Populates the matching cache and registers all the component state
			 * listeners for the required components to keep the cache updated.
			 */
			const initializeQuery = () => {
				const minComponentKey = getMinimumComponentKey();

				// Loop through the component map of the component with the least number of entities
				for (const possibleEntityKey of Object.keys(
					this.getEntityMap(minComponentKey!)
				)) {
					if (isMatchingEntity(this.entityFromKey(possibleEntityKey))) {
						_matchingEntityKeys.add(possibleEntityKey);
					}
				}

				// Now that the matching entities set has been populated, we register
				// a listener to watch all the required components so that the matching entities
				// set can be updated
				for (const requiredComponentKey of requiredComponentKeys) {
					this.addComponentStateListener({
						component: requiredComponentKey,
						listener: ({ entity, component }) => {
							const newComponentState = this.get(entity, component);
							// If the component was deleted, remove the entity from the matching entities set
							if (newComponentState === undefined) {
								_matchingEntityKeys.delete(entity.__key);
							}
							// Otherwise, add the entity to the matching entities set (doesn't matter if entity is already
							// in the set because we use an ES6 Set which prevents duplicates)
							else {
								if (isMatchingEntity(entity)) {
									_matchingEntityKeys.add(entity.__key);
								}
							}
						},
					});
				}

				_isQueryInitialized = true;
			};

			/**
			 * Loop through every entity that satisfies the component query
			 * options.
			 */
			const each = (
				cb: (entity: BaseTypedEntity<M, RequiredKeys[number]>) => void
			) => {
				if (!_isQueryInitialized) initializeQuery();
				for (const matchingEntityKey of _matchingEntityKeys) {
					cb(this.entityFromKey(matchingEntityKey));
				}
			};

			const first = (): BaseTypedEntity<M, RequiredKeys[number]> => {
				if (!_isQueryInitialized) initializeQuery();
				return this.entityFromKey(_matchingEntityKeys.values().next().value);
			};

			return {
				each,
				first,
			};
		},
	});
}
