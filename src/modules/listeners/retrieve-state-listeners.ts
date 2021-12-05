import type { ComponentKey, ComponentMap } from '~/types/component';
import type {
	ComponentStateListener,
	EntityStateListener,
	StateListener,
} from '~/types/context';
import type { Entity, EntityKey } from '~/types/entity';
import type { StateUpdate } from '~/types/state';
import { StateUpdateType } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function retrieveStateListenerCallsModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		retrieveStateListenerCalls(
			stateUpdates: StateUpdate<M, ComponentKey<M>>[]
		): [StateListener<M>, Parameters<StateListener<M>>][] {
			// Map of entities to the updates that affected it
			const affectedEntityUpdatesMap: Record<EntityKey, StateUpdate<M, any>[]> =
				{};

			// Map of components to the updates that affected it
			const affectedComponentUpdatesMap = {} as {
				[K in ComponentKey<M>]: StateUpdate<M, ComponentKey<M>>[];
			};

			for (const stateUpdate of stateUpdates) {
				(affectedEntityUpdatesMap[stateUpdate.entity.__key] ??= []).push(
					stateUpdate
				);
				(affectedComponentUpdatesMap[stateUpdate.componentKey] ??=
					[] as StateUpdate<M, ComponentKey<M>>[]).push(stateUpdate);
			}

			const stateListeners: [StateListener<M>, Parameters<StateListener<M>>][] =
				[];
			// Save all entity listeners
			for (const [entityKey, affectedEntityUpdates] of Object.entries(
				affectedEntityUpdatesMap
			)) {
				for (const { listener } of this._entityListenerContexts.get(
					entityKey
				) ?? []) {
					const params: Parameters<EntityStateListener<M, Entity>> = [
						{
							componentKeys: affectedEntityUpdates.map(
								({ componentKey }) => componentKey
							),
							entity: this.entityFromKey(entityKey),
						},
					];
					stateListeners.push([listener, params]);
				}
			}

			// Save all component listeners
			for (const [componentString, affectedComponentUpdates] of Object.entries(
				affectedComponentUpdatesMap
			)) {
				const component = componentString as ComponentKey<M>;
				for (const { listener } of this._componentListenerContexts.get(
					component
				) ?? []) {
					// Looping through all the entities that were affected
					for (const componentUpdate of affectedComponentUpdates) {
						const params: Parameters<
							ComponentStateListener<M, ComponentKey<M>>
						> = [
							{
								component,
								entity: componentUpdate.entity as any,
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
