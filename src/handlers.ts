import type {
	Component,
	ComponentState,
	Entity,
	RegisterModuleContext,
} from './types';

type ComponentStateType<T> = T extends keyof ComponentState
	? ComponentState[T]
	: never;
type ComponentStateTypes<Tuple extends readonly [...any[]]> = {
	[Index in keyof Tuple]: ComponentStateType<Tuple[Index]> | undefined;
} & { length: Tuple['length'] };

type MultiComponentStateChangeHandler<
	C extends readonly Component[],
	E extends Entity,
	X extends Record<string, unknown>
> = {
	oldComponentStates: ComponentStateTypes<C>;
	components: C;
	callback(props: {
		entity: E;
		extras: X;
		oldComponentStates: ComponentStateTypes<C>;
		newComponentStates: ComponentStateTypes<C>;
	}): void;
};

type SingleComponentStateChangeHandler<
	C extends Component,
	E extends Entity,
	X extends Record<string, unknown>
> = {
	oldComponentState: ComponentState[C] | undefined;
	component: C;
	callback(props: {
		entity: E;
		extras: X;
		oldComponentState: ComponentState[C] | undefined;
		newComponentState: ComponentState[C] | undefined;
	}): void;
};

export function registerHandlersModule({
	accessModule,
}: RegisterModuleContext) {
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
		X extends Record<string, unknown> = Record<never, never>
	>() {
		const handlers: (
			| SingleComponentStateChangeHandler<Component, E, X>
			| MultiComponentStateChangeHandler<readonly Component[], E, X>
		)[] = [];

		type ExecuteHandlerProps = {
			entity: E;
			extras: X;
			components?: Component[];
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
					const currentComponentState = accessModule.get(
						entity as Entity,
						component
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
							accessModule.get(entity as Entity, component)
						);

						handler.callback({
							newComponentStates: currentComponentStates,
							oldComponentStates,
							entity,
							extras,
						});

						handler.oldComponentStates = currentComponentStates;
					} else {
						const currentComponentState = accessModule.get(
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

		function createMultiComponentHandler<C extends readonly Component[]>(
			components: C,
			callback: MultiComponentStateChangeHandler<C, E, X>['callback']
		) {
			handlers.push({
				components,
				callback,
				oldComponentStates: components.map(() => undefined),
			});
		}

		function createSingleComponentHandler<C extends Component>(
			component: C,
			callback: SingleComponentStateChangeHandler<C, E, X>['callback']
		) {
			handlers.push({
				component,
				callback,
				oldComponentState: undefined,
			});
		}

		function createHandler<C extends Component | readonly Component[]>(
			componentOrComponents: C,
			callback: C extends Component
				? SingleComponentStateChangeHandler<C, E, X>['callback']
				: C extends readonly Component[]
				? MultiComponentStateChangeHandler<C, E, X>['callback']
				: never
		) {
			if (typeof componentOrComponents === 'string') {
				createSingleComponentHandler(
					componentOrComponents,
					callback as SingleComponentStateChangeHandler<
						Component,
						E,
						X
					>['callback']
				);
			} else {
				createMultiComponentHandler(
					componentOrComponents,
					callback as MultiComponentStateChangeHandler<
						readonly Component[],
						E,
						X
					>['callback']
				);
			}
		}

		return {
			createHandler,
			executeHandlers,
		};
	}

	return {
		createHandlerManager,
	};
}
