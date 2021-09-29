import type { Entity } from '~/types/entity';
import type {
	MultiComponentStateChangeHandler,
	SingleComponentStateChangeHandler,
} from '~/types/handlers';
import type { Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	LionecsExtras,
} from '~/types/state';

export function handlerManagerModule<
	C extends ComponentBase,
	S extends ComponentState<C>,
	_X extends LionecsExtras
>() {
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
	>(this: Lionecs<C, S>) {
		const handlers: (
			| SingleComponentStateChangeHandler<C, S, ComponentKey<C>, E, R>
			| MultiComponentStateChangeHandler<C, S, readonly ComponentKey<C>[], E, R>
		)[] = [];

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
					const currentComponentState = this.get(
						entity as Entity,
						component as keyof ComponentBase
					);

					if (currentComponentState !== oldComponentStates[componentIndex]) {
						didComponentsChange = true;
						break;
					}
				}

				// If a change in the components was detected, trigger the callback
				if (didComponentsChange) {
					if (isMultiComponentHandler) {
						const currentComponentStates = handlerComponents.map((component) =>
							this.get(entity as Entity, component as keyof ComponentBase)
						);

						handler.callback({
							newComponentStates: currentComponentStates,
							oldComponentStates,
							entity,
							extras,
						});

						handler.oldComponentStates = currentComponentStates;
					} else {
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
			}
		};

		const createMultiComponentHandler = <K extends readonly ComponentKey<C>[]>(
			components: K,
			callback: MultiComponentStateChangeHandler<C, S, K, E, R>['callback']
		) => {
			handlers.push({
				components,
				callback,
				oldComponentStates: components.map(() => undefined),
			});
		};

		const createSingleComponentHandler = <K extends ComponentKey<C>>(
			component: K,
			callback: SingleComponentStateChangeHandler<C, S, K, E, R>['callback']
		) => {
			handlers.push({
				component,
				callback,
				oldComponentState: undefined,
			});
		};

		const createHandler = <
			K extends ComponentKey<C> | readonly ComponentKey<C>[]
		>(
			componentOrComponents: K,
			callback: K extends ComponentKey<C>
				? SingleComponentStateChangeHandler<C, S, K, E, R>['callback']
				: K extends readonly ComponentKey<C>[]
				? MultiComponentStateChangeHandler<C, S, K, E, R>['callback']
				: never
		) => {
			if (typeof componentOrComponents === 'string') {
				createSingleComponentHandler(
					componentOrComponents,
					callback as SingleComponentStateChangeHandler<
						C,
						S,
						ComponentKey<C>,
						E,
						R
					>['callback']
				);
			} else {
				createMultiComponentHandler(
					componentOrComponents as readonly ComponentKey<C>[],
					callback as MultiComponentStateChangeHandler<
						C,
						S,
						ComponentKey<C>[],
						E,
						R
					>['callback']
				);
			}
		};

		return {
			executeHandlers,
			createHandler,
		};
	}

	return {
		createHandlerManager,
	};
}
