import { nanoid } from 'nanoid';

import type {
	CreateEntityProps,
	Entity,
	EntityMap,
	TypedEntity,
} from '~/types/entity';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
} from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function entityModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

	return defineMethods({
		createEntity: function <E extends Entity>(
			props?: CreateEntityProps<C, S, E>
		): E {
			const entity = nanoid() as E;

			if (props !== undefined) {
				this.update(() => {
					for (const [componentName, componentValue] of Object.entries(
						props.components
					)) {
						this.set(entity, componentName as ComponentKey<C>, componentValue);
					}
				});
			}

			return entity;
		},
		getEntityMap: function <K extends ComponentKey<C>>(
			componentKey: K
		): EntityMap<C, S, K> {
			return this.state.components[componentKey];
		},
		cloneEntity: function <E extends Entity>(entityToClone: E): E {
			const entity = this.createEntity<E>();

			this.update(() => {
				for (const componentString of Object.keys(this.state.components)) {
					const component = componentString as ComponentKey<C>;
					const componentState = this.getOpt(
						entityToClone,
						component as keyof ComponentBase
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
