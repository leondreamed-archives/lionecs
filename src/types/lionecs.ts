import type { RemovePrivateProperties } from 'liontypes';

import type { ComponentKey, ComponentMap } from './component';
import type {
	ComponentStateListenerContext,
	EntityStateListenerContext,
	StateListener,
} from './context';
import type { Entity } from './entity';
import type { InternalLionecsProperties } from './properties';
import type { LionecsExtras, LionecsState, StateUpdate } from './state';

export type InternalLionecsState<
	M extends ComponentMap,
	X extends LionecsExtras = LionecsExtras
> = X & {
	/**
	 * An object that represents the lionecs state.
	 */
	state: LionecsState<M>;
	/**
	 * A map where the keys are entities and the value is an array of all the entity
	 * listener contexts.
	 */
	_entityListenerContexts: Map<Entity, EntityStateListenerContext<M, Entity>[]>;

	/**
	 * A map where the keys are components and the value is an array of all the component
	 * listener contexts.
	 */
	_componentListenerContexts: Map<
		ComponentKey<M>,
		ComponentStateListenerContext<M, ComponentKey<M>>[]
	>;

	/**
	 * An array of updates that's updated by the `set` function. It's mainly used
	 * so that the `update` function can keep track of all the updates that have
	 * been batched in its callback, which it can then pass to the `triggerListeners`
	 * function to trigger the listeners for the entities/components which were
	 * updated in the `update` callback.
	 */
	_activeUpdates: StateUpdate<M, ComponentKey<M>>[];

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
	 * A set of 2-value tuples that represent untriggered listener calls where the first element
	 * is a reference to the listener function and the second element contains the parameters to
	 * pass to the listener function.
	 */
	_untriggeredListenerCalls: Set<
		[StateListener<M>, Parameters<StateListener<M>>]
	>;
};

type InternalLionecsKeys<
	M extends ComponentMap,
	_X extends LionecsExtras
> = InternalLionecsProperties<M> & InternalLionecsState<M>;

export interface InternalLionecs<
	M extends ComponentMap,
	X extends LionecsExtras = LionecsExtras
> extends InternalLionecsKeys<M, X> {}

export interface Lionecs<
	M extends ComponentMap,
	X extends LionecsExtras = LionecsExtras
> extends RemovePrivateProperties<InternalLionecs<M, X>> {}
