import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
} from '~/types/component.js';
import type { Entity } from '~/types/entity.js';
import type { ComponentStateChangeHandler } from '~/types/handlers.js';
import { useDefineMethods } from '~/utils/methods.js';

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
			const handlers: Array<
				ComponentStateChangeHandler<M, ComponentKey<M>, E, R>
			> = [];

			let areHandlersActivated = false;
			let handlerExtras: R | undefined;

			/**
			 * Registers a handler (but doesn't activate it)
			 */
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

				if (areHandlersActivated) {
					// Loop through all the entities with a certain component
					this.query({
						required: [componentKey],
					}).each((entity) => {
						callback({
							entity: entity as Entity as E,
							extras: handlerExtras!,
							newComponentState: this.get(entity, componentKey),
							oldComponentState: undefined,
						});
					});
				}
			};

			type RegisterHandlerListenersProps = {
				extras: R;
			};
			const activateHandlers = (props: RegisterHandlerListenersProps) => {
				handlerExtras = props.extras;

				const componentKeyToHandlers = {} as Record<
					ComponentKey<M>,
					Array<ComponentStateChangeHandler<M, ComponentKey<M>, E, R>>
				>;

				const { registerComponentStateListener } =
					this.createComponentStateListenerManager(
						({ component, entity, oldComponentState }) => {
							if (componentKeyToHandlers[component] !== undefined) {
								for (const handler of componentKeyToHandlers[component]!) {
									handler.callback({
										extras: props.extras,
										newComponentState: this.get(entity, component),
										oldComponentState,
										entity: entity as unknown as E,
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

				areHandlersActivated = true;
			};

			return {
				createHandler,
				activateHandlers,
			};
		},
	});
}
