import { produce } from 'immer';
import extend from 'just-extend';

import type {
	ComponentKey,
	ComponentMap,
	ComponentType,
} from '~/types/component';
import type { Entity } from '~/types/entity';
import type { StateUpdate } from '~/types/state';
import { StateUpdateType } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function mutationsModule<C extends ComponentMap>() {
	const defineMethods = useDefineMethods<C>();

	return defineMethods({
		/**
		 * Batch update the state and trigger listeners only when the callback has finished
		 */
		update(cb: () => void) {
			this._activeUpdateCallCount += 1;
			cb();
			this._activeUpdateCallCount -= 1;

			if (this._activeUpdateCallCount === 0) {
				const stateUpdates = this._activeUpdates;
				this._activeUpdates = [];
				this.triggerListeners(stateUpdates);
			}
		},
		del<K extends ComponentKey<C>>(entity: Entity, componentKey: K) {
			delete this.state.components[componentKey][entity];
		},
		set<K extends ComponentKey<C>>(
			entity: Entity,
			componentKey: K,
			newComponentState: ComponentType<C[K]>
		) {
			const oldComponentState = this.get(
				entity,
				componentKey as ComponentKey<C>
			);
			this.getEntityMap(componentKey)[entity] = newComponentState;

			const stateUpdate: StateUpdate<C, K> = {
				type: StateUpdateType.set,
				component: componentKey,
				entity,
				newComponentState,
				oldComponentState,
			};
			// If set() is called as part of an update, push the changes
			if (this._activeUpdateCallCount > 0) {
				this._activeUpdates.push(stateUpdate);
			}
			// If set() isn't called as part of an update, notify listeners
			else {
				this.triggerListeners([stateUpdate]);
			}
		},
		patch<K extends ComponentKey<C>>(
			entity: Entity,
			componentKey: K,
			patchedState: Partial<ComponentType<C[K]>>
		) {
			const oldComponentState = this.get(
				entity,
				componentKey as ComponentKey<C>
			);
			if (oldComponentState === undefined) {
				throw new Error(`Cannot patch non-initialized state.`);
			}
			if (typeof oldComponentState !== 'object') {
				throw new TypeError(`Patch can only be used on object states.`);
			}

			const newComponentState = produce(
				oldComponentState,
				(state: ComponentType<C[K]>) => {
					extend(state as any, patchedState);
				}
			);

			this.set(entity, componentKey, newComponentState as ComponentType<C[K]>);
		},
	});
}
