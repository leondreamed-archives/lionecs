import { produce } from 'immer';

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
		batch(cb: () => void) {
			this._activeUpdateCallCount += 1;
			cb();
			this._activeUpdateCallCount -= 1;

			if (this._activeUpdateCallCount === 0) {
				const stateUpdates = this._activeUpdates;
				this._activeUpdates = [];
				this.triggerListeners(stateUpdates);
			}
		},
		del<K extends ComponentKey<M>>(
			entity: Entity,
			component: K | ComponentFromKey<M, K>
		) {
			const componentKey = this.getComponentKey(component);
			delete this.state.components[componentKey][entity.__key];
		},
		set<K extends ComponentKey<M>>(
			entity: Entity,
			component: K | ComponentFromKey<M, K>,
			newComponentState: TypeOfComponent<M[K]>
		) {
			const componentKey = this.getComponentKey(component);
			const oldComponentState = this.get(entity, componentKey);
			this.getEntityMap(componentKey)[entity.__key] = newComponentState;

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
		update<K extends ComponentKey<M>>(
			entity: Entity,
			component: K | ComponentFromKey<M, K>,
			updateState: (
				oldComponentState: TypeOfComponent<M[K]>
			) => TypeOfComponent<M[K]>
		) {
			const componentKey = this.getComponentKey(component);
			const oldComponentState = this.get(entity, componentKey);

			if (oldComponentState === undefined) {
				throw new Error(`The entity ${entity} does not have an old state.`);
			}

			let newComponentState: TypeOfComponent<M[K]>;
			// If the old component state is an object, use an immer proxy to prevent
			// mutations to the original object
			if (typeof oldComponentState === 'object' && oldComponentState !== null) {
				newComponentState = produce(
					oldComponentState,
					(immerOldComponentState: TypeOfComponent<M[K]>) =>
						updateState(immerOldComponentState)
				) as TypeOfComponent<M[K]>;
			} else {
				newComponentState = updateState(oldComponentState as any);
			}

			this.set(entity, componentKey, newComponentState);
		},
	});
}
