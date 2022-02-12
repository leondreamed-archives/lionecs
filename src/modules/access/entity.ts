import { nanoid } from 'nanoid';

import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
} from '~/types/component.js';
import type {
	CreateEntityComponents,
	Entity,
	EntityKey,
	EntityMap,
} from '~/types/entity.js';
import { useDefineMethods } from '~/utils/methods.js';

export function entityModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		entity<E extends Entity>(components?: CreateEntityComponents<M, E>): E {
			const entity = this.entityFromKey(nanoid()) as E;

			if (components !== undefined) {
				this.batch(() => {
					for (const [componentKey, componentValue] of Object.entries(
						components
					)) {
						this.set(entity, componentKey as ComponentKey<M>, componentValue);
					}
				});
			}

			return entity;
		},
		entityFromKey(entityKey: EntityKey): Entity {
			return { __key: entityKey };
		},
		getEntityKey(entity: Entity) {
			return entity.__key;
		},
		getEntityMap<K extends ComponentKey<M>>(
			component: K | ComponentFromKey<M, K>
		): EntityMap<M, K> {
			const componentKey = this.getComponentKey(component);
			return this.state.components[componentKey];
		},
		cloneEntity<E extends Entity>(entityToClone: E): E {
			const entity = this.entity<E>();

			this.batch(() => {
				for (const componentString of Object.keys(this.state.components)) {
					const component = componentString as ComponentKey<M>;
					const componentState = this.getOpt(entityToClone, component);
					if (componentState !== undefined) {
						this.set(entity, component, componentState);
					}
				}
			});

			return entity;
		},
	});
}
