import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
} from '~/types/component';
import type { Entity } from '~/types/entity';
import type { ComponentStateChangeHandler } from '~/types/handlers';
import { useDefineMethods } from '~/utils/methods';

export function handlerManagerModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	/**
	 * Handlers should be responsible for applying changes to the ECS data to some UI state.
	 * Listeners/systems will call these handlers and will expect them to update the UI state
	 * as necessary based on the current state and the last state the handler managed.
	 * Instead of checking the UI state to determine the current state (which has performance
	 * implications), the handlers will keep a copy of the last state they acted upon to
	 * keep track of the current UI state.
	 */
	return defineMethods({
		createHandlerManager: function <
			E extends Entity,
			R extends Record<string, unknown> = Record<never, never>
		>() {
			const handlers: ComponentStateChangeHandler<M, ComponentKey<M>, E, R>[] =
				[];

			type ExecuteHandlerProps = {
				entity: E;
				extras: R;
				componentKeys?: ComponentKey<M>[];
			};

			/**
			 * Execute the handlers in the order they were defined.
			 */
			const executeHandlers = ({
				entity,
				extras,
				componentKeys,
			}: ExecuteHandlerProps) => {
				for (const handler of handlers) {
					// If the handler isn't responsible for the component, then skip it.
					if (
						componentKeys !== undefined &&
						!componentKeys.includes(handler.componentKey)
					) {
						continue;
					}

					// Check if the component state changed
					const currentComponentState = this.get(
						entity as Entity,
						handler.componentKey
					);

					// If a change in the components was detected, trigger the callback
					if (currentComponentState !== handler.oldComponentState) {
						const currentComponentState = this.get(
							entity as Entity,
							handler.componentKey
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
			};

			const createHandler = <K extends ComponentKey<M>>(
				component: K | ComponentFromKey<M, K>,
				callback: ComponentStateChangeHandler<M, K, E, R>['callback']
			) => {
				const componentKey = this.getComponentKey(component);
				handlers.push({
					componentKey,
					callback,
					oldComponentState: undefined,
				});
			};

			type RegisterHandlerListenersProps = {
				execute?: boolean;
				extras: R;
			};
			const registerHandlerListeners = (
				props: RegisterHandlerListenersProps
			) => {
				const componentKeyToHandlers = {} as Record<
					ComponentKey<M>,
					ComponentStateChangeHandler<M, ComponentKey<M>, E, R>[]
				>;

				const { registerComponentStateListener } =
					this.createComponentStateListenerManager(
						({ component, entity, oldComponentState }) => {
							if (componentKeyToHandlers[component] !== undefined) {
								for (const handler of componentKeyToHandlers[component]) {
									handler.callback({
										extras: props.extras,
										newComponentState: this.get(entity, component),
										oldComponentState,
										entity: entity as E,
									});
								}
							}
						}
					);

				const uniqueComponents = new Set<ComponentKey<M>>();
				for (const handler of handlers) {
					const componentKey = this.getComponentKey(handler.componentKey);
					(componentKeyToHandlers[componentKey] ??= []).push(handler);
					uniqueComponents.add(componentKey);
				}
				for (const component of uniqueComponents) {
					registerComponentStateListener(component);
				}
			};

			return {
				executeHandlers,
				createHandler,
				registerHandlerListeners,
			};
		},
	});
}
