import { produce } from 'immer';
import extend from 'just-extend';

import type { Entity } from '~/types/entity';
import type { Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	StateUpdate,
} from '~/types/state';
import { StateUpdateType } from '~/types/state';

export function mutationsModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	/**
	 * Batch update the state and trigger listeners only when the callback has finished
	 */
	function update(this: Lionecs<C, S>, cb: () => void) {
		this.activeUpdateCallCount += 1;
		cb();
		this.activeUpdateCallCount -= 1;

		if (this.activeUpdateCallCount === 0) {
			const stateUpdates = this.activeUpdates;
			this.activeUpdates = [];
			this.triggerListeners(stateUpdates);
		}
	}

	function del<K extends ComponentKey<C>>(
		this: Lionecs<C, S>,
		entity: Entity,
		componentKey: K
	) {
		delete this.state.components[componentKey][entity];
	}

	function set<K extends ComponentKey<C>>(
		this: Lionecs<C, S>,
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
		if (this.activeUpdateCallCount > 0) {
			this.activeUpdates.push(stateUpdate);
		}
		// If set() isn't called as part of an update, notify listeners
		else {
			this.triggerListeners([stateUpdate]);
		}
	}

	function patch<K extends ComponentKey<C>>(
		this: Lionecs<C, S>,
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
	}

	return {
		update,
		patch,
		del,
		set,
	};
}
