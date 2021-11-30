import { produce } from 'immer';
import extend from 'just-extend';

import type { Entity } from '~/types/entity';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	StateUpdate,
} from '~/types/state';
import { StateUpdateType } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function mutationsModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

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
			newComponentState: S[K]
		) {
			const oldComponentState = this.get(
				entity,
				componentKey as keyof ComponentBase
			);
			this.getEntityMap(componentKey)[entity] = newComponentState;

			const stateUpdate: StateUpdate<C, S, K> = {
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
			patchedState: Partial<S[K]>
		) {
			const oldComponentState = this.get(
				entity,
				componentKey as keyof ComponentBase
			);
			if (oldComponentState === undefined) {
				throw new Error(`Cannot patch non-initialized state.`);
			}

			const newComponentState = produce(oldComponentState, (state: S[K]) => {
				extend(state, patchedState);
			});

			this.set(entity, componentKey, newComponentState as S[K]);
		},
	});
}
