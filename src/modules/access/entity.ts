import { nanoid } from 'nanoid';

import type { Entity, EntityMap, TypedEntity } from '~/types/entity';
import type { Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
} from '~/types/state';

export function entityModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	type CreateEntityComponentsProp<E extends Entity> = E extends TypedEntity<
		C,
		infer Req,
		infer Opt
	>
		? { [K in Req]: S[K] } & (Opt extends ComponentKey<C>
				? { [K in Opt]: S[K] }
				: Record<string, never>)
		: { [K in ComponentKey<C>]?: S[K] };

	type CreateEntityProps<E extends Entity> = {
		components: CreateEntityComponentsProp<E>;
	};

	function createEntity<E extends Entity>(
		this: Lionecs<C, S>,
		props?: CreateEntityProps<E>
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
	}

	function getEntityMap<K extends ComponentKey<C>>(
		this: Lionecs<C, S>,
		componentKey: K
	): EntityMap<C, S, K> {
		return this.state.components[componentKey];
	}

	function cloneEntity<E extends Entity>(
		this: Lionecs<C, S>,
		entityToClone: E
	): E {
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
	}

	return {
		createEntity,
		getEntityMap,
		cloneEntity,
	};
}
