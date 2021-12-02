import { produce } from 'immer';
import extend from 'just-extend';

import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
	TypeOfComponent,
} from '~/types/component';
import type { Entity } from '~/types/entity';
import type { StateUpdate } from '~/types/state';
import { StateUpdateType } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function mutationsModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

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
		del<K extends ComponentKey<M>>(entity: Entity, componentKey: K) {
			delete this.state.components[componentKey][entity];
		},
		set<K extends ComponentKey<M>>(
			entity: Entity,
			component: K | ComponentFromKey<M, K>,
			newComponentState: TypeOfComponent<M[K]>
		) {
			const componentKey = this.getComponentKey(component);
			const oldComponentState = this.get(entity, componentKey);
			this.getEntityMap(componentKey)[entity] = newComponentState;

			const stateUpdate: StateUpdate<M, K> = {
				type: StateUpdateType.set,
				componentKey,
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
		patch<K extends ComponentKey<M>>(
			entity: Entity,
			component: K | ComponentFromKey<M, K>,
			patchedState: Partial<TypeOfComponent<M[K]>>
		) {
			const oldComponentState = this.get(entity, component as ComponentKey<M>);
			if (oldComponentState === undefined) {
				throw new Error(`Cannot patch non-initialized state.`);
			}
			if (typeof oldComponentState !== 'object') {
				throw new TypeError(`Patch can only be used on object states.`);
			}

			const newComponentState = produce(
				oldComponentState,
				(state: TypeOfComponent<M[K]>) => {
					extend(state as any, patchedState);
				}
			);

			this.set(entity, component, newComponentState as TypeOfComponent<M[K]>);
		},
	});
}
