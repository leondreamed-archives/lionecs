import type { ComponentKey, ComponentMap } from '~/types/component.js';
import type {
	ComponentStateListener,
	EntityStateListener,
	StateListener,
} from '~/types/context.js';
import type { Entity, EntityKey } from '~/types/entity.js';
import type { StateUpdate } from '~/types/state.js';
import { StateUpdateType } from '~/types/state.js';
import { useDefineMethods } from '~/utils/methods.js';

export function retrieveStateListenerCallsModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		retrieveStateListenerCalls(
			stateUpdates: Array<StateUpdate<M, ComponentKey<M>>>
		): Array<[StateListener<M>, Parameters<StateListener<M>>]> {
			// Map of entities to the updates that affected it
			const affectedEntityUpdatesMap: Record<
				EntityKey,
				Array<StateUpdate<M, any>>
			> = {};

			// Map of components to the updates that affected it
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			const affectedComponentUpdatesMap = {} as {
				[K in ComponentKey<M>]: Array<StateUpdate<M, ComponentKey<M>>>;
			};

			for (const stateUpdate of stateUpdates) {
				(affectedEntityUpdatesMap[stateUpdate.entity.__key] ??= []).push(
					stateUpdate
				);
				(affectedComponentUpdatesMap[stateUpdate.componentKey] ??= [] as Array<
					StateUpdate<M, ComponentKey<M>>
				>).push(stateUpdate);
			}

			const stateListeners: Array<
				[StateListener<M>, Parameters<StateListener<M>>]
			> = [];
			// Save all entity listeners
			for (const [entityKey, affectedEntityUpdates] of Object.entries(
				affectedEntityUpdatesMap
			)) {
				for (const { listener, extras } of this._entityListenerContexts.get(
					entityKey
				) ?? []) {
					const params: Parameters<EntityStateListener<M, Entity>> = [
						{
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							componentKeys: affectedEntityUpdates.map(
								// eslint-disable-next-line @typescript-eslint/no-unsafe-return
								({ componentKey }) => componentKey
							),
							entity: this.entityFromKey(entityKey),
							extras,
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
				for (const { listener, extras } of this._componentListenerContexts.get(
					component
				) ?? []) {
					// Looping through all the entities that were affected
					for (const componentUpdate of affectedComponentUpdates) {
						const params: Parameters<
							ComponentStateListener<M, ComponentKey<M>>
						> = [
							{
								component,
								entity: componentUpdate.entity,
								oldComponentState:
									componentUpdate.type === StateUpdateType.del
										? undefined
										: componentUpdate.oldComponentState,
								extras,
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
