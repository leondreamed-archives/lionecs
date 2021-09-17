import { produce } from 'immer';
import extend from 'just-extend';
import { nanoid } from 'nanoid';

import type {
	ComponentStateListener,
	ComponentStateListenerContext,
	EntityStateListener,
	EntityStateListenerContext,
} from './types/context';
import type { Entity, EntityMap, TypedEntity } from './types/entity';
import type {
	MultiComponentStateChangeHandler,
	SingleComponentStateChangeHandler,
} from './types/handlers';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	LionecsState,
	StateUpdate,
} from './types/state';
import { StateUpdateType } from './types/state';

type CreateLionecsProps<C extends ComponentBase> = {
	components: C[];
};
export function createLionecs<
	C extends ComponentBase,
	S extends ComponentState<C>
>({ components: _components }: CreateLionecsProps<C>) {
	/**
	 * An object that represents the lionecs state.
	 */
	const lionecsState = {
		components: {},
		entities: {},
	} as LionecsState<C, S>;

	/**
	 * A map where the keys are entities and the value is an array of all the entity
	 * listener contexts.
	 */
	const entityListenerContexts = new Map<
		Entity,
		EntityStateListenerContext<C, S, Entity>[]
	>();

	/**
	 * A map where the keys are components and the value is an array of all the component
	 * listener contexts.
	 */
	const componentListenerContexts = new Map<
		ComponentKey<C>,
		ComponentStateListenerContext<C, S, ComponentKey<C>>[]
	>();

	/**
	 * The active update call count is a counter that keeps track of how many
	 * `update` calls have been called so that the `set` function knows to
	 * not trigger a listener (the reason why a counter is used instead of a
	 * boolean is because `update` calls can be potentially nested).
	 */
	let activeUpdateCallCount = 0;

	/**
	 * An array of updates that's updated by the `set` function. It's mainly used
	 * so that the `update` function can keep track of all the updates that have
	 * been batched in its callback, which it can then pass to the `triggerListeners`
	 * function to trigger the listeners for the entities/components which were
	 * updated in the `update` callback.
	 */
	let activeUpdates: StateUpdate<C, S, ComponentKey<C>>[] = [];

	/**
	 * A boolean that represents whether or not the `triggerListener` callback is
	 * currently triggering listeners; this is used to prevent "double triggers,"
	 * where a listener triggers another listener (e.g. by calling a `set` function
	 * within the listener) and ending up triggering a listener that is already queued
	 * to be triggered.
	 */
	let areListenersBeingTriggered = false;

	/**
	 * A type which represents a state listener (either listening to an entity or a component).
	 */
	type StateListener =
		| EntityStateListener<Entity, C, S>
		| ComponentStateListener<C, S, ComponentKey<C>>;

	/**
	 * A map where the keys are the untriggered listeners (the function reference) and
	 * the value is the parameters that should be passed to the listeners when calling them.
	 */
	const untriggeredListeners = new Map<
		StateListener,
		Parameters<StateListener>
	>();

	function retrieveStateListeners(
		stateUpdates: StateUpdate<C, S, ComponentKey<C>>[]
	): [StateListener, Parameters<StateListener>][] {
		// Construct the old state object
		const oldState = produce(lionecsState, (state) => {
			const stateComponents = state.components as {
				[K in keyof C]: EntityMap<C, S, K>;
			};
			for (const stateUpdate of stateUpdates) {
				const { component, entity, type } = stateUpdate;
				if (type === StateUpdateType.set) {
					if (stateUpdate.oldComponentState === undefined) {
						delete stateComponents[component][entity];
					} else {
						stateComponents[entity as ComponentKey<C>] =
							stateUpdate.oldComponentState;
					}
				} else if (type === StateUpdateType.del) {
					delete stateComponents[entity];
				}
			}
		});

		// Map of entities to the updates that affected it
		const affectedEntityUpdatesMap: Record<Entity, StateUpdate<C, S, any>[]> =
			{};

		// Map of components to the updates that affected it
		const affectedComponentUpdatesMap = {} as {
			[K in ComponentKey<C>]: StateUpdate<C, S, ComponentKey<C>>[];
		};

		for (const stateUpdate of stateUpdates) {
			(affectedEntityUpdatesMap[stateUpdate.entity] ??= []).push(stateUpdate);
			(affectedComponentUpdatesMap[stateUpdate.component] ??= [] as StateUpdate<
				C,
				S,
				ComponentKey<C>
			>[]).push(stateUpdate);
		}

		const stateListeners: [StateListener, Parameters<StateListener>][] = [];
		// Save all entity listeners
		for (const [entity, affectedEntityUpdates] of Object.entries(
			affectedEntityUpdatesMap
		)) {
			for (const { listener } of entityListenerContexts.get(entity) ?? []) {
				const params: Parameters<EntityStateListener<Entity, C, S>> = [
					{
						components: affectedEntityUpdates.map(({ component }) => component),
						entity,
						oldState,
					},
				];
				stateListeners.push([listener, params]);
			}
		}

		// Save all component listeners
		for (const [componentString, affectedComponentUpdates] of Object.entries(
			affectedComponentUpdatesMap
		)) {
			const component = componentString as ComponentKey<C>;
			for (const { listener } of componentListenerContexts.get(component) ??
				[]) {
				const params: Parameters<
					ComponentStateListener<C, S, ComponentKey<C>>
				> = [
					{
						component,
						entities: affectedComponentUpdates.map(({ entity }) => entity),
						oldState,
					},
				];

				stateListeners.push([listener, params]);
			}
		}

		return stateListeners;
	}

	function triggerListeners(
		stateUpdates: StateUpdate<C, S, ComponentKey<C>>[]
	) {
		const stateListeners = retrieveStateListeners(stateUpdates);
		for (const [stateListener, params] of stateListeners) {
			untriggeredListeners.set(stateListener, params);
		}

		if (!areListenersBeingTriggered) {
			areListenersBeingTriggered = true;
			// Trigger listeners as long as there are untriggered listeners remaining
			while (untriggeredListeners.size > 0) {
				const listener = untriggeredListeners.keys().next().value;
				const listenerParams = untriggeredListeners.get(listener);
				listener(listenerParams);
				untriggeredListeners.delete(listener);
			}
			areListenersBeingTriggered = false;
		}
	}

	/** Access */

	/**
	 * Batch update the state and trigger listeners only when the callback has finished
	 */
	function update(cb: () => void) {
		activeUpdateCallCount += 1;
		cb();
		activeUpdateCallCount -= 1;

		if (activeUpdateCallCount === 0) {
			const stateUpdates = activeUpdates;
			activeUpdates = [];
			triggerListeners(stateUpdates);
		}
	}

	type GetOptions = {
		optional?: boolean;
	};

	// get(state, entity, component, options)
	function get<
		E extends Entity,
		K extends E extends TypedEntity<infer Req, infer Opt>
			?
					| TypedEntity<Req, Opt>['__requiredComponents']
					| TypedEntity<Req, Opt>['__optionalComponents']
			: ComponentKey<C>,
		O extends E extends TypedEntity<infer Req, infer Opt>
			? C extends TypedEntity<Req, Opt>['__optionalComponents']
				? { optional: true }
				: { optional: false }
			: GetOptions
	>(
		state: LionecsState<C, S>,
		entity: E,
		component: K,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? S[K] | undefined
			: S[K]
		: S[K] | undefined;

	// get(entity, component, options)
	function get<
		E extends Entity,
		K extends E extends TypedEntity<infer Req, infer Opt>
			?
					| TypedEntity<Req, Opt>['__requiredComponents']
					| TypedEntity<Req, Opt>['__optionalComponents']
			: ComponentKey<C>,
		O extends E extends TypedEntity<infer Req, infer Opt>
			? C extends TypedEntity<Req, Opt>['__optionalComponents']
				? { optional: true }
				: { optional: false }
			: GetOptions
	>(
		entity: E,
		component: K,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? S[K] | undefined
			: S[K]
		: S[K] | undefined;

	function get<K extends ComponentKey<C>>(...args: unknown[]): S[K] {
		// get(entity, component, options)
		if (typeof args[0] === 'string') {
			const [entity, component, options] = args as [
				Entity,
				K,
				GetOptions | undefined
			];
			const optional = options?.optional ?? true;

			const componentState = lionecsState.components[component][entity];

			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as S[K];
		}
		// get(state, entity, component, options)
		else {
			const [state, entity, component, options] = args as [
				LionecsState<C, S>,
				Entity,
				K,
				GetOptions | undefined
			];
			const optional = options?.optional ?? true;

			const componentState = state.components[component][entity];
			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as S[K];
		}
	}

	function getOpt<K extends ComponentKey<C>>(
		state: LionecsState<C, S>,
		entity: Entity,
		component: K
	): S[K] | undefined;

	function getOpt<K extends ComponentKey<C>>(
		entity: Entity,
		component: K
	): S[K] | undefined;

	function getOpt<K extends ComponentKey<C>>(
		...args: unknown[]
	): S[K] | undefined {
		// getOpt(state, entity, component)
		if (args.length === 3) {
			const [state, entity, component] = args as [
				LionecsState<C, S>,
				Entity,
				K
			];
			return state.components[component][entity] as S[K];
		} else {
			const [entity, component] = args as [Entity, K];
			return lionecsState.components[component][entity] as S[K];
		}
	}

	function del<K extends ComponentKey<C>>(entity: Entity, componentKey: K) {
		delete lionecsState.components[componentKey][entity];
	}

	function getEntityMap<K extends ComponentKey<C>>(
		componentKey: K
	): EntityMap<C, S, K> {
		return lionecsState.components[componentKey];
	}

	function set<K extends ComponentKey<C>>(
		entity: Entity,
		componentKey: K,
		newComponentState: S[K]
	) {
		const oldComponentState = get(entity, componentKey);
		getEntityMap(componentKey)[entity] = newComponentState;

		const stateUpdate: StateUpdate<C, S, K> = {
			type: StateUpdateType.set,
			component: componentKey,
			entity,
			newComponentState,
			oldComponentState,
		};
		// If set() is called as part of an update, push the changes
		if (activeUpdateCallCount > 0) {
			activeUpdates.push(stateUpdate);
		}
		// If set() isn't called as part of an update, notify listeners
		else {
			triggerListeners([stateUpdate]);
		}
	}

	function patch<K extends ComponentKey<C>>(
		entity: Entity,
		componentKey: K,
		patchedState: Partial<S[K]>
	) {
		const oldComponentState = get(entity, componentKey);
		if (oldComponentState === undefined) {
			throw new Error(`Cannot patch non-initialized state.`);
		}

		const newComponentState = produce(oldComponentState, (state: S[K]) => {
			extend(state, patchedState);
		});

		set(entity, componentKey, newComponentState);
	}

	type CreateEntityComponentsProp<E extends Entity> = E extends TypedEntity<
		C,
		infer Req,
		infer Opt
	>
		? { [K in Req]: S[K] } &
				(Opt extends ComponentKey<C>
					? { [K in Opt]: S[K] }
					: Record<string, never>)
		: { [K in ComponentKey<C>]?: S[K] };

	type CreateEntityProps<E extends Entity> = {
		components: CreateEntityComponentsProp<E>;
	};

	function createEntity<E extends Entity>(
		props?: CreateEntityProps<E>
	): Entity {
		const entity = nanoid();

		if (props !== undefined) {
			update(() => {
				for (const [componentName, componentValue] of Object.entries(
					props.components
				)) {
					set(entity, componentName as ComponentKey<C>, componentValue);
				}
			});
		}

		return entity;
	}

	function cloneEntity<E extends Entity>(entityToClone: E): E {
		const entity = createEntity() as E;

		update(() => {
			for (const componentString of Object.keys(lionecsState.components)) {
				const component = componentString as ComponentKey<C>;
				const componentState = getOpt(entityToClone, component);
				if (componentState !== undefined) {
					set(entity, component, componentState);
				}
			}
		});

		return entity;
	}

	/* Handlers */

	/**
	 * Handlers should be responsible for applying changes to the ECS data to the DOM.
	 * Listeners/systems will call these handlers and will expect them to update the DOM
	 * as necessary based on the current state and the last state the handler managed.
	 * Instead of checking the DOM to determine the current state (which has performance
	 * implications), the handlers will keep a copy of the last state they acted upon to
	 * keep track of the current DOM state.
	 */
	function createHandlerManager<
		E extends Entity,
		R extends Record<string, unknown> = Record<never, never>
	>() {
		const handlers: (
			| SingleComponentStateChangeHandler<C, S, E, R>
			| MultiComponentStateChangeHandler<C, S, E, R>
		)[] = [];

		type ExecuteHandlerProps = {
			entity: E;
			extras: R;
			components?: ComponentKey<C>[];
		};

		/**
		 * Execute the handlers in the order they were defined.
		 */
		function executeHandlers({
			entity,
			extras,
			components,
		}: ExecuteHandlerProps) {
			for (const handler of handlers) {
				let didComponentsChange = false;

				const isMultiComponentHandler = 'components' in handler;
				const handlerComponents = isMultiComponentHandler
					? handler.components
					: [handler.component];
				const oldComponentStates = isMultiComponentHandler
					? handler.oldComponentStates
					: [handler.oldComponentState];

				for (const [componentIndex, component] of handlerComponents.entries()) {
					// If the handler isn't responsible for the component, then skip it.
					if (components !== undefined && !components.includes(component))
						continue;

					// Check if the component state changed
					const currentComponentState = get(entity as Entity, component);

					if (currentComponentState !== oldComponentStates[componentIndex]) {
						didComponentsChange = true;
						break;
					}
				}

				// If a change in the components was detected, trigger the callback
				if (didComponentsChange) {
					if (isMultiComponentHandler) {
						const currentComponentStates = handlerComponents.map((component) =>
							get(entity as Entity, component)
						);

						handler.callback({
							newComponentStates: currentComponentStates,
							oldComponentStates,
							entity,
							extras,
						});

						handler.oldComponentStates = currentComponentStates;
					} else {
						const currentComponentState = get(
							entity as Entity,
							handler.component
						);

						handler.callback({
							entity,
							extras,
							oldComponentState: handler.oldComponentState,
							newComponentState: currentComponentState,
						});

						handler.oldComponentState = currentComponentState;
					}
				}
			}
		}

		function createMultiComponentHandler<K extends readonly ComponentKey<C>[]>(
			components: K,
			callback: MultiComponentStateChangeHandler<C, S, E, R>['callback']
		) {
			handlers.push({
				components,
				callback,
				oldComponentStates: components.map(() => undefined),
			});
		}

		function createSingleComponentHandler<K extends ComponentKey<C>>(
			component: K,
			callback: SingleComponentStateChangeHandler<C, S, E, R>['callback']
		) {
			handlers.push({
				component,
				callback,
				oldComponentState: undefined,
			});
		}

		function createHandler<
			K extends ComponentKey<C> | readonly ComponentKey<C>[]
		>(
			componentOrComponents: K,
			callback: K extends ComponentKey<C>
				? SingleComponentStateChangeHandler<C, S, E, R>['callback']
				: C extends readonly ComponentKey<C>[]
				? MultiComponentStateChangeHandler<C, S, E, R>['callback']
				: never
		) {
			if (typeof componentOrComponents === 'string') {
				createSingleComponentHandler(
					componentOrComponents,
					callback as SingleComponentStateChangeHandler<C, S, E, R>['callback']
				);
			} else {
				createMultiComponentHandler(
					componentOrComponents as readonly ComponentKey<C>[],
					callback as MultiComponentStateChangeHandler<C, S, E, R>['callback']
				);
			}
		}

		function addEntityStateListener<
			E extends Entity,
			R extends Record<string, unknown> | undefined = undefined
		>({
			entity,
			listener,
			extras,
		}: {
			entity: E;
			listener: EntityStateListener<E, C, S, R>;
			extras?: R;
		}) {
			if (!entityListenerContexts.has(entity)) {
				entityListenerContexts.set(entity, []);
			}

			entityListenerContexts.get(entity)!.push({
				listener: listener as any,
				extras,
			});
		}

		function addComponentStateListener<
			K extends ComponentKey<C>,
			R extends Record<string, unknown> | undefined = undefined
		>({
			component,
			listener,
			extras,
		}: {
			component: K;
			listener: ComponentStateListener<C, S, K, R>;
			extras?: R;
		}) {
			if (!componentListenerContexts.has(component)) {
				componentListenerContexts.set(component, []);
			}

			componentListenerContexts.get(component)!.push({
				listener: listener as any,
				extras,
			});
		}

		function removeEntityStateListener<
			E extends Entity,
			R extends Record<string, unknown> | undefined = undefined
		>({
			entity,
			listener,
		}: {
			entity: Entity;
			listener: EntityStateListener<E, C, S, R>;
		}) {
			const index =
				entityListenerContexts
					.get(entity)
					?.findIndex((e) => e.listener === listener) ?? -1;

			if (index !== -1) {
				entityListenerContexts.get(entity)!.splice(index, 1);
			}
		}

		function removeComponentStateListener<
			K extends ComponentKey<C>,
			R extends Record<string, unknown> | undefined = undefined
		>({
			component,
			listener,
		}: {
			component: K;
			listener: ComponentStateListener<C, S, K, R>;
		}) {
			const index =
				componentListenerContexts
					.get(component)
					?.findIndex((e) => e.listener === listener) ?? -1;

			if (index !== -1) {
				componentListenerContexts.get(component)!.splice(index, 1);
			}
		}

		function createEntityStateListenerManager<
			E extends Entity,
			R extends Record<string, unknown> | undefined = undefined
		>(listener: EntityStateListener<E, C, S, R>) {
			const listeners = new Map<Entity, EntityStateListener<E, C, S, R>>();

			function registerEntityStateListener(entity: E, extras?: R) {
				if (!listeners.has(entity)) {
					addEntityStateListener({ entity, listener, extras });
					listeners.set(entity, listener);
				}
			}

			function deleteEntityStateListener(entity: E) {
				removeEntityStateListener({ entity, listener });
				listeners.delete(entity);
			}

			return { registerEntityStateListener, deleteEntityStateListener };
		}

		function createComponentStateListenerManager<
			K extends ComponentKey<C>,
			R extends Record<string, unknown> | undefined = undefined
		>(listener: ComponentStateListener<C, S, K, R>) {
			const listeners = new Map<
				ComponentKey<C>,
				ComponentStateListener<C, S, K, R>
			>();

			function registerComponentStateListener(component: K) {
				if (!listeners.has(component)) {
					addComponentStateListener({ component, listener });
					listeners.set(component, listener);
				}
			}

			function deleteComponentStateListener(component: K) {
				removeComponentStateListener({ component, listener });
				listeners.delete(component);
			}

			return { registerComponentStateListener, deleteComponentStateListener };
		}

		return {
			executeHandlers,
			createHandler,
			createComponentStateListenerManager,
			createEntityStateListenerManager,
		};
	}

	return {
		get,
		getOpt,
		set,
		del,
		update,
		patch,

		createEntity,
		cloneEntity,

		createHandlerManager,
	};
}
