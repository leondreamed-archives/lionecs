import type { Entity } from '~/types/entity';
import type { ComponentStateChangeHandler } from '~/types/handlers';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
} from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function handlerManagerModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

	/**
	 * Handlers should be responsible for applying changes to the ECS data to some UI state.
	 * Listeners/systems will call these handlers and will expect them to update the UI state
	 * as necessary based on the current state and the last state the handler managed.
	 * Instead of checking the UI state to determine the current state (which has performance
	 * implications), the handlers will keep a copy of the last state they acted upon to
	 * keep track of the current UI state.
	 */
	const { createHandlerManager } = defineMethods({
		createHandlerManager: function <
			E extends Entity,
			R extends Record<string, unknown> = Record<never, never>
		>() {
			const handlers: ComponentStateChangeHandler<
				C,
				S,
				ComponentKey<C>,
				E,
				R
			>[] = [];

			type ExecuteHandlerProps = {
				entity: E;
				extras: R;
				components?: ComponentKey<C>[];
			};

			/**
			 * Execute the handlers in the order they were defined.
			 */
			const executeHandlers = ({
				entity,
				extras,
				components,
			}: ExecuteHandlerProps) => {
				for (const handler of handlers) {
					// If the handler isn't responsible for the component, then skip it.
					if (
						components !== undefined &&
						!components.includes(handler.component)
					) {
						continue;
					}

					// Check if the component state changed
					const currentComponentState = this.get(
						entity as Entity,
						handler.component as keyof ComponentBase
					);

					// If a change in the components was detected, trigger the callback
					if (currentComponentState !== handler.oldComponentState) {
						const currentComponentState = this.get(
							entity as Entity,
							handler.component as keyof ComponentBase
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

			const createHandler = <K extends ComponentKey<C>>(
				component: K,
				callback: ComponentStateChangeHandler<C, S, K, E, R>['callback']
			) => {
				handlers.push({
					component,
					callback,
					oldComponentState: undefined,
				});
			};

			type RegisterHandlerListenersProps = {
				extras: R;
			};
			const registerHandlerListeners = (
				props: RegisterHandlerListenersProps
			) => {
				const componentToHandlers = {} as Record<
					ComponentKey<C>,
					ComponentStateChangeHandler<C, S, ComponentKey<C>, E, R>[]
				>;

				const { registerComponentStateListener } =
					this.createComponentStateListenerManager(
						({ component, entity, oldComponentState }) => {
							if (componentToHandlers[component] !== undefined) {
								for (const handler of componentToHandlers[component]) {
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

				const uniqueComponents = new Set<ComponentKey<C>>();
				for (const handler of handlers) {
					(componentToHandlers[handler.component] ??= []).push(handler);
					uniqueComponents.add(handler.component);
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

	return {
		createHandlerManager,
	};
}
