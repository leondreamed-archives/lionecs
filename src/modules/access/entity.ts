import { nanoid } from 'nanoid';

import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
} from '~/types/component';
import type {
	CreateEntityProps,
	Entity,
	EntityKey,
	EntityMap,
} from '~/types/entity';
import { useDefineMethods } from '~/utils/methods';

export function entityModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		createEntity <E extends Entity>(
			props?: CreateEntityProps<M, E>
		): E {
			const entity = this.entityFromKey(nanoid()) as E;

			if (props !== undefined) {
				this.batch(() => {
					for (const [componentKey, componentValue] of Object.entries(
						props.components
					)) {
						this.set(entity, componentKey as ComponentKey<M>, componentValue!);
					}
				});
			}

			return entity;
		},
		entityFromKey(entityKey: EntityKey): Entity {
			return { __key: entityKey };
		},
		getEntityMap <K extends ComponentKey<M>>(
			component: K | ComponentFromKey<M, K>
		): EntityMap<M, K> {
			const componentKey = this.getComponentKey(component);
			return this.state.components[componentKey];
		},
		cloneEntity <E extends Entity>(entityToClone: E): E {
			const entity = this.createEntity<E>();

			this.batch(() => {
				for (const componentString of Object.keys(this.state.components)) {
					const component = componentString as ComponentKey<M>;
					const componentState = this.getOpt(
						entityToClone,
						component as ComponentKey<M>
					);
					if (componentState !== undefined) {
						this.set(entity, component, componentState);
					}
				}
			});

			return entity;
		},
	});
}
