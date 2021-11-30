import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	StateUpdate,
} from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function triggerListenersModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

	return defineMethods({
		triggerListeners(stateUpdates: StateUpdate<C, S, ComponentKey<C>>[]) {
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
