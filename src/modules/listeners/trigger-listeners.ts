import type { InternalLionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	StateUpdate,
} from '~/types/state';
import { createMethodsDefiner } from '~/utils/methods';

export function triggerListenersModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = createMethodsDefiner<C, S>();

	const { triggerListeners } = defineMethods({
		triggerListeners(
			this: InternalLionecs<C, S>,
			stateUpdates: StateUpdate<C, S, ComponentKey<C>>[]
		) {
			const stateListeners = this.retrieveStateListeners(stateUpdates);
			for (const [stateListener, params] of stateListeners) {
				this._untriggeredListeners.set(stateListener, params);
			}

			if (!this._areListenersBeingTriggered) {
				this._areListenersBeingTriggered = true;
				// Trigger listeners as long as there are untriggered listeners remaining
				while (this._untriggeredListeners.size > 0) {
					const listener = this._untriggeredListeners.keys().next().value;
					const listenerParams = this._untriggeredListeners.get(listener);
					listener(listenerParams);
					this._untriggeredListeners.delete(listener);
				}
				this._areListenersBeingTriggered = false;
			}
		},
	});

	return {
		triggerListeners,
	};
}
