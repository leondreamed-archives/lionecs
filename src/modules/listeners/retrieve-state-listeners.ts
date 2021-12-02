import type { ComponentKey, ComponentMap } from '~/types/component';
import type {
	ComponentStateListener,
	EntityStateListener,
	StateListener,
} from '~/types/context';
import type { Entity } from '~/types/entity';
import type { StateUpdate } from '~/types/state';
import { StateUpdateType } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function retrieveStateListenerCallsModule<C extends ComponentMap>() {
	const defineMethods = useDefineMethods<C>();

	return defineMethods({
		retrieveStateListenerCalls(
			stateUpdates: StateUpdate<C, ComponentKey<C>>[]
		): [StateListener<C>, Parameters<StateListener<C>>][] {
			// Map of entities to the updates that affected it
			const affectedEntityUpdatesMap: Record<Entity, StateUpdate<C, any>[]> =
				{};

			// Map of components to the updates that affected it
			const affectedComponentUpdatesMap = {} as {
				[K in ComponentKey<C>]: StateUpdate<C, ComponentKey<C>>[];
			};

			for (const stateUpdate of stateUpdates) {
				(affectedEntityUpdatesMap[stateUpdate.entity] ??= []).push(stateUpdate);
				(affectedComponentUpdatesMap[stateUpdate.componentKey] ??=
					[] as StateUpdate<C, ComponentKey<C>>[]).push(stateUpdate);
			}

			const stateListeners: [StateListener<C>, Parameters<StateListener<C>>][] =
				[];
			// Save all entity listeners
			for (const [entity, affectedEntityUpdates] of Object.entries(
				affectedEntityUpdatesMap
			)) {
				for (const { listener } of this._entityListenerContexts.get(entity) ??
					[]) {
					const params: Parameters<EntityStateListener<C, Entity>> = [
						{
							componentKeys: affectedEntityUpdates.map(
								({ componentKey }) => componentKey
							),
							entity,
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
					// Looping through all the entities that were affected
					for (const componentUpdate of affectedComponentUpdates) {
						const params: Parameters<
							ComponentStateListener<C, ComponentKey<C>>
						> = [
							{
								component,
								entity: componentUpdate.entity,
								oldComponentState:
									componentUpdate.type === StateUpdateType.del
										? undefined
										: componentUpdate.oldComponentState,
							},
						];

						stateListeners.push([listener, params]);
					}
				}
			}

			return stateListeners;
		},
	});
}
