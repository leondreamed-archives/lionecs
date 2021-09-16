import { produce } from 'immer';
import extend from 'just-extend';
import { nanoid } from 'nanoid';

import type { ComponentStateListener, EntityStateListener } from './listeners';
import type {
	Component,
	ComponentState,
	Entity,
	RegisterModuleContext,
	TypedecsState,
	TypedEntity,
} from './types';

export function registerAccessModule({
	typedecsState,
	componentListenerContexts,
	entityListenerContexts,
}: RegisterModuleContext) {
	enum StateUpdateType {
		set = 'set',
		del = 'del',
	}

	type StateUpdate<C extends Component = Component> =
		| {
				type: StateUpdateType.set;
				entity: Entity;
				component: C;
				oldComponentState: ComponentState[C] | undefined;
				newComponentState: ComponentState[C];
		  }
		| {
				type: StateUpdateType.del;
				entity: Entity;
				component: C;
		  };

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
	let activeUpdates: StateUpdate[] = [];

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
		| EntityStateListener<Entity>
		| ComponentStateListener<Component>;

	/**
	 * A map where the keys are the untriggered listeners (the function reference) and
	 * the value is the parameters that should be passed to the listeners when calling them.
	 */
	const untriggeredListeners = new Map<
		StateListener,
		Parameters<StateListener>
	>();

	function retrieveStateListeners(
		stateUpdates: StateUpdate[]
	): [StateListener, Parameters<StateListener>][] {
		// Construct the old state object
		const oldState = produce(typedecsState, (state) => {
			for (const stateUpdate of stateUpdates) {
				const { component, entity, type } = stateUpdate;
				if (type === StateUpdateType.set) {
					if (stateUpdate.oldComponentState === undefined) {
						delete state.components[component][entity];
					} else {
						state.components[component][entity] = stateUpdate.oldComponentState;
					}
				} else if (type === StateUpdateType.del) {
					delete state.components[component][entity];
				}
			}
		});

		// Map of entities to the updates that affected it
		const affectedEntityUpdatesMap: Record<Entity, StateUpdate[]> = {};

		// Map of components to the updates that affected it
		const affectedComponentUpdatesMap: { [C in Component]?: StateUpdate[] } =
			{};

		for (const stateUpdate of stateUpdates) {
			(affectedEntityUpdatesMap[stateUpdate.entity] ??= []).push(stateUpdate);
			(affectedComponentUpdatesMap[stateUpdate.component] ??= []).push(
				stateUpdate
			);
		}

		const stateListeners: [StateListener, Parameters<StateListener>][] = [];
		// Save all entity listeners
		for (const [entity, affectedEntityUpdates] of Object.entries(
			affectedEntityUpdatesMap
		)) {
			for (const { listener } of entityListenerContexts.get(entity) ?? []) {
				const params: Parameters<EntityStateListener<Entity>> = [
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
			const component = componentString as Component;
			for (const { listener } of componentListenerContexts.get(component) ??
				[]) {
				const params: Parameters<ComponentStateListener<Component>> = [
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

	function triggerListeners(stateUpdates: StateUpdate[]) {
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
		C extends E extends TypedEntity<infer Req, infer Opt>
			?
					| TypedEntity<Req, Opt>['__requiredComponents']
					| TypedEntity<Req, Opt>['__optionalComponents']
			: Component,
		O extends E extends TypedEntity<infer Req, infer Opt>
			? C extends TypedEntity<Req, Opt>['__optionalComponents']
				? { optional: true }
				: { optional: false }
			: GetOptions
	>(
		state: TypedecsState,
		entity: E,
		component: C,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? ComponentState[C] | undefined
			: ComponentState[C]
		: ComponentState[C] | undefined;

	// get(entity, component, options)
	function get<
		E extends Entity,
		C extends E extends TypedEntity<infer Req, infer Opt>
			?
					| TypedEntity<Req, Opt>['__requiredComponents']
					| TypedEntity<Req, Opt>['__optionalComponents']
			: Component,
		O extends E extends TypedEntity<infer Req, infer Opt>
			? C extends TypedEntity<Req, Opt>['__optionalComponents']
				? { optional: true }
				: { optional: false }
			: GetOptions
	>(
		entity: E,
		component: C,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? ComponentState[C] | undefined
			: ComponentState[C]
		: ComponentState[C] | undefined;

	function get<C extends Component>(...args: unknown[]): ComponentState[C] {
		// get(entity, component, options)
		if (typeof args[0] === 'string') {
			const [entity, component, options] = args as [
				Entity,
				C,
				GetOptions | undefined
			];
			const optional = options?.optional ?? true;

			const componentState = typedecsState.components[component][entity];

			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as ComponentState[C];
		}
		// get(state, entity, component, options)
		else {
			const [state, entity, component, options] = args as [
				TypedecsState,
				Entity,
				C,
				GetOptions | undefined
			];
			const optional = options?.optional ?? true;

			const componentState = state.components[component][entity];
			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as ComponentState[C];
		}
	}

	function getOpt<C extends Component>(
		state: TypedecsState,
		entity: Entity,
		component: C
	): ComponentState[C] | undefined;

	function getOpt<C extends Component>(
		entity: Entity,
		component: C
	): ComponentState[C] | undefined;

	function getOpt<C extends Component>(
		...args: unknown[]
	): ComponentState[C] | undefined {
		// getOpt(state, entity, component)
		if (args.length === 3) {
			const [state, entity, component] = args as [TypedecsState, Entity, C];
			return state.components[component][entity] as ComponentState[C];
		} else {
			const [entity, component] = args as [Entity, C];
			return typedecsState.components[component][entity] as ComponentState[C];
		}
	}

	function del<C extends Component>(entity: Entity, component: C) {
		delete typedecsState.components[component][entity];
	}

	function set<C extends Component>(
		entity: Entity,
		componentEnum: C,
		newComponentState: ComponentState[C]
	) {
		const component = componentEnum as Component;

		const oldComponentState = get(entity, component);
		typedecsState.components[component][entity] = newComponentState;

		const stateUpdate: StateUpdate = {
			type: StateUpdateType.set,
			component,
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

	function patch<C extends Component>(
		entity: Entity,
		componentEnum: C,
		patchedState: Partial<ComponentState[C]>
	) {
		const component = componentEnum as Component;

		const oldComponentState = get(entity, component);
		if (oldComponentState === undefined) {
			throw new Error(`Cannot patch non-initialized state.`);
		}

		const newComponentState = produce(
			oldComponentState,
			(state: ComponentState[Component]) => {
				extend(state, patchedState);
			}
		);

		set(entity, component, newComponentState);
	}

	type CreateEntityComponentsProp<E extends Entity> = E extends TypedEntity<
		infer Req,
		infer Opt
	>
		? { [C in Req]: ComponentState[C] } &
				(Opt extends Component
					? { [C in Opt]: ComponentState[C] }
					: Record<string, never>)
		: { [C in Component]?: ComponentState[C] };

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
					set(entity, componentName as Component, componentValue);
				}
			});
		}

		return entity;
	}

	function cloneEntity<E extends Entity>(entityToClone: E): E {
		const entity = createEntity() as E;

		update(() => {
			for (const componentString of Object.keys(typedecsState.components)) {
				const component = componentString as Component;
				const componentState = getOpt(entityToClone, component);
				if (componentState !== undefined) {
					set(entity, component, componentState);
				}
			}
		});

		return entity;
	}

	return {
		get,
		getOpt,
		set,
		del,
		patch,
		update,
		cloneEntity,
	};
}
