import type {
	ComponentStateListenerContext,
	EntityStateListenerContext,
	StateListener,
} from './context';
import type { Entity } from './entity';
import type { LionecsMethods } from './methods';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	LionecsExtras,
	LionecsState,
	StateUpdate,
} from './state';

type LionecsBase<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras
> = LionecsMethods<C, S> & X;

export type Lionecs<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras = LionecsExtras
> = LionecsBase<C, S, X> & {
	/**
	 * An object that represents the lionecs state.
	 */
	state: LionecsState<C, S>;
	/**
	 * A map where the keys are entities and the value is an array of all the entity
	 * listener contexts.
	 */
	entityListenerContexts: Map<
		Entity,
		EntityStateListenerContext<C, S, Entity>[]
	>;

	/**
	 * A map where the keys are components and the value is an array of all the component
	 * listener contexts.
	 */
	componentListenerContexts: Map<
		ComponentKey<C>,
		ComponentStateListenerContext<C, S, ComponentKey<C>>[]
	>;

	/**
	 * An array of updates that's updated by the `set` function. It's mainly used
	 * so that the `update` function can keep track of all the updates that have
	 * been batched in its callback, which it can then pass to the `triggerListeners`
	 * function to trigger the listeners for the entities/components which were
	 * updated in the `update` callback.
	 */
	activeUpdates: StateUpdate<C, S, ComponentKey<C>>[];

	/**
	 * A boolean that represents whether or not the `triggerListener` callback is
	 * currently triggering listeners; this is used to prevent "double triggers,"
	 * where a listener triggers another listener (e.g. by calling a `set` function
	 * within the listener) and ending up triggering a listener that is already queued
	 * to be triggered.
	 */
	areListenersBeingTriggered: boolean;

	/**
	 * The active update call count is a counter that keeps track of how many
	 * `update` calls have been called so that the `set` function knows to
	 * not trigger a listener (the reason why a counter is used instead of a
	 * boolean is because `update` calls can be potentially nested).
	 */
	activeUpdateCallCount: number;

	/**
	 * A map where the keys are the untriggered listeners (the function reference) and
	 * the value is the parameters that should be passed to the listeners when calling them.
	 */
	untriggeredListeners: Map<
		StateListener<C, S>,
		Parameters<StateListener<C, S>>
	>;
}
