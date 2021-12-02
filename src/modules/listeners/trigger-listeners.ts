import type { ComponentKey, ComponentMap } from '~/types/component';
import type { StateUpdate } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function triggerListenersModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		triggerListeners(stateUpdates: StateUpdate<M, ComponentKey<M>>[]) {
			const stateListenerCalls = this.retrieveStateListenerCalls(stateUpdates);
			for (const [stateListenerCall, params] of stateListenerCalls) {
				this._untriggeredListenerCalls.add([stateListenerCall, params]);
			}

			if (!this._areListenersBeingTriggered) {
				this._areListenersBeingTriggered = true;
				// Trigger listeners as long as there are untriggered listeners remaining
				while (this._untriggeredListenerCalls.size > 0) {
					const untriggeredListenerCall = this._untriggeredListenerCalls
						.keys()
						.next().value;
					const [listener, listenerParams] = untriggeredListenerCall;
					listener(...listenerParams);
					this._untriggeredListenerCalls.delete(untriggeredListenerCall);
				}
				this._areListenersBeingTriggered = false;
			}
		},
	});
}
