import { produce } from "immer";
import extend from "just-extend";
import { Entity } from "~/types/entity";
import { Lionecs } from "~/types/lionecs";
import {
	ComponentBase,
	ComponentKey,
	ComponentState,
	StateUpdate,
	StateUpdateType,
} from "~/types/state";

/**
 * Batch update the state and trigger listeners only when the callback has finished
 */
export function update<C extends ComponentBase, S extends ComponentState<C>>(
	this: Lionecs<C, S>,
	cb: () => void
) {
	this.activeUpdateCallCount += 1;
	cb();
	this.activeUpdateCallCount -= 1;

	if (this.activeUpdateCallCount === 0) {
		const stateUpdates = this.activeUpdates;
		this.activeUpdates = [];
		this.triggerListeners(stateUpdates);
	}
}

export function del<
	C extends ComponentBase,
	S extends ComponentState<C>,
	K extends ComponentKey<C>
>(this: Lionecs<C, S>, entity: Entity, componentKey: K) {
	delete this.state.components[componentKey][entity];
}

export function set<
	C extends ComponentBase,
	S extends ComponentState<C>,
	K extends ComponentKey<C>
>(
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

export function patch<
	C extends ComponentBase,
	S extends ComponentState<C>,
	K extends ComponentKey<C>
>(
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
