import { nanoid } from 'nanoid';

import type { ComponentKey, ComponentMap } from '~/types/component';
import type { CreateEntityProps, Entity, EntityMap } from '~/types/entity';
import { useDefineMethods } from '~/utils/methods';

export function entityModule<C extends ComponentMap>() {
	const defineMethods = useDefineMethods<C>();

	return defineMethods({
		createEntity: function <E extends Entity>(
			props?: CreateEntityProps<C, E>
		): E {
			const entity = nanoid() as E;

			if (props !== undefined) {
				this.update(() => {
					for (const [componentName, componentValue] of Object.entries(
						props.components
					)) {
						this.set(entity, componentName as ComponentKey<C>, componentValue!);
					}
				});
			}

			return entity;
		},
		getEntityMap: function <K extends ComponentKey<C>>(
			componentKey: K
		): EntityMap<C, K> {
			return this.state.components[componentKey];
		},
		cloneEntity: function <E extends Entity>(entityToClone: E): E {
			const entity = this.createEntity<E>();

			this.update(() => {
				for (const componentString of Object.keys(this.state.components)) {
					const component = componentString as ComponentKey<C>;
					const componentState = this.getOpt(
						entityToClone,
						component as ComponentKey<C>
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
