import { produce } from 'immer';

import type {
	ComponentStateListener,
	EntityStateListener,
	StateListener,
} from '~/types/context';
import type { Entity, EntityMap } from '~/types/entity';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	StateUpdate,
} from '~/types/state';
import { StateUpdateType } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function retrieveStateListenersModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

	const { retrieveStateListeners } = defineMethods({
		retrieveStateListeners(
			stateUpdates: StateUpdate<C, S, ComponentKey<C>>[]
		): [StateListener<C, S>, Parameters<StateListener<C, S>>][] {
			// Construct the old state object
			const oldState = produce(this.state, (state) => {
				const stateComponents = state.components as {
					[K in ComponentKey<C>]: EntityMap<C, S, K>;
				};
				for (const stateUpdate of stateUpdates) {
					const { component, entity, type } = stateUpdate;
					if (type === StateUpdateType.set) {
						if (stateUpdate.oldComponentState === undefined) {
							delete stateComponents[component][entity];
						} else {
							stateComponents[entity as ComponentKey<C>] =
								stateUpdate.oldComponentState;
						}
					} else if (type === StateUpdateType.del) {
						delete stateComponents[entity];
					}
				}
			});

			// Map of entities to the updates that affected it
			const affectedEntityUpdatesMap: Record<Entity, StateUpdate<C, S, any>[]> =
				{};

			// Map of components to the updates that affected it
			const affectedComponentUpdatesMap = {} as {
				[K in ComponentKey<C>]: StateUpdate<C, S, ComponentKey<C>>[];
			};

			for (const stateUpdate of stateUpdates) {
				(affectedEntityUpdatesMap[stateUpdate.entity] ??= []).push(stateUpdate);
				(affectedComponentUpdatesMap[stateUpdate.component] ??=
					[] as StateUpdate<C, S, ComponentKey<C>>[]).push(stateUpdate);
			}

			const stateListeners: [
				StateListener<C, S>,
				Parameters<StateListener<C, S>>
			][] = [];
			// Save all entity listeners
			for (const [entity, affectedEntityUpdates] of Object.entries(
				affectedEntityUpdatesMap
			)) {
				for (const { listener } of this._entityListenerContexts.get(entity) ??
					[]) {
					const params: Parameters<EntityStateListener<Entity, C, S>> = [
						{
							components: affectedEntityUpdates.map(
								({ component }) => component
							),
							entity,
							oldState,
						},
					];
					stateListeners.push([listener, params]);
				}
			}

			// Save all component listeners
			for (const [componentString, affectedComponentUpdates] of Object.entries(
				affectedComponentUpdatesMap
			)) {
				const component = componentString as ComponentKey<C>;
				for (const { listener } of this._componentListenerContexts.get(
					component
				) ?? []) {
					const params: Parameters<
						ComponentStateListener<C, S, ComponentKey<C>>
					> = [
						{
							component,
							entities: affectedComponentUpdates.map(({ entity }) => entity),
							oldState,
						},
					];

					stateListeners.push([listener, params]);
				}
			}

			return stateListeners;
		},
	});

	return {
		retrieveStateListeners,
	};
}
