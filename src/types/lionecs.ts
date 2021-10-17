import type { RemovePrivateProperties } from 'liontypes';

import type {
	ComponentStateListenerContext,
	EntityStateListenerContext,
	StateListener,
} from './context';
import type { Entity } from './entity';
import type { InternalLionecsProperties } from './properties';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	LionecsExtras,
	LionecsState,
	StateUpdate,
} from './state';

export type InternalLionecsState<
	C extends ComponentBase,
	S extends ComponentState<C>
> = {
	/**
	 * An object that represents the lionecs state.
	 */
	state: LionecsState<C, S>;
	/**
	 * A map where the keys are entities and the value is an array of all the entity
	 * listener contexts.
	 */
	_entityListenerContexts: Map<
		Entity,
		EntityStateListenerContext<C, S, Entity>[]
	>;

	/**
	 * A map where the keys are components and the value is an array of all the component
	 * listener contexts.
	 */
	_componentListenerContexts: Map<
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
	_activeUpdates: StateUpdate<C, S, ComponentKey<C>>[];

	/**
	 * A boolean that represents whether or not the `triggerListener` callback is
	 * currently triggering listeners; this is used to prevent "double triggers,"
	 * where a listener triggers another listener (e.g. by calling a `set` function
	 * within the listener) and ending up triggering a listener that is already queued
	 * to be triggered.
	 */
	_areListenersBeingTriggered: boolean;

	/**
	 * The active update call count is a counter that keeps track of how many
	 * `update` calls have been called so that the `set` function knows to
	 * not trigger a listener (the reason why a counter is used instead of a
	 * boolean is because `update` calls can be potentially nested).
	 */
	_activeUpdateCallCount: number;

	/**
	 * A map where the keys are the untriggered listeners (the function reference) and
	 * the value is the parameters that should be passed to the listeners when calling them.
	 */
	_untriggeredListeners: Map<
		StateListener<C, S>,
		Parameters<StateListener<C, S>>
	>;
};

type InternalLionecsKeys<
	C extends ComponentBase,
	S extends ComponentState<C>
> = InternalLionecsProperties<C, S> & InternalLionecsState<C, S>;

export interface InternalLionecs<
	C extends ComponentBase,
	S extends ComponentState<C>,
	_X extends LionecsExtras = LionecsExtras
> extends InternalLionecsKeys<C, S> {}

export interface Lionecs<
		C extends ComponentBase,
		S extends ComponentState<C>,
		X extends LionecsExtras = LionecsExtras
	>
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	extends RemovePrivateProperties<InternalLionecs<C, S, X>> {}
