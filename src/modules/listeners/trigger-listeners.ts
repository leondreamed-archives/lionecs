import type { Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	StateUpdate,
} from '~/types/state';

export function triggerListenersModule<
	C extends ComponentBase,
	S extends ComponentState<C>,
>() {
	function triggerListeners(
		this: Lionecs<C, S>,
		stateUpdates: StateUpdate<C, S, ComponentKey<C>>[]
	) {
		const stateListeners = this.retrieveStateListeners(stateUpdates);
		for (const [stateListener, params] of stateListeners) {
			this.untriggeredListeners.set(stateListener, params);
		}

		if (!this.areListenersBeingTriggered) {
			this.areListenersBeingTriggered = true;
			// Trigger listeners as long as there are untriggered listeners remaining
			while (this.untriggeredListeners.size > 0) {
				const listener = this.untriggeredListeners.keys().next().value;
				const listenerParams = this.untriggeredListeners.get(listener);
				listener(listenerParams);
				this.untriggeredListeners.delete(listener);
			}
			this.areListenersBeingTriggered = false;
		}
	}

	return {
		triggerListeners,
	};
}
