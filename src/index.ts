import { registerAccessModule } from './access';
import { registerHandlersModule } from './handlers';
import type {
	ComponentStateListenerContext,
	EntityStateListenerContext,
} from './listeners';
import { registerListenersModule } from './listeners';
import type {
	Component,
	Entity,
	RegisterModuleContext,
	TypedecsState,
} from './types';

export function createTypedecs() {
	/**
	 * An object that represents the typedecs state.
	 */
	const typedecsState = {
		components: {},
		entities: {},
	} as TypedecsState;

	/**
	 * A map where the keys are entities and the value is an array of all the entity
	 * listener contexts.
	 */
	const entityListenerContexts = new Map<
		Entity,
		EntityStateListenerContext<any, any>[]
	>();

	/**
	 * A map where the keys are components and the value is an array of all the component
	 * listener contexts.
	 */
	const componentListenerContexts = new Map<
		Component,
		ComponentStateListenerContext<any, any>[]
	>();

	const registerModuleContext: RegisterModuleContext = {
		typedecsState,
		entityListenerContexts,
		componentListenerContexts,
		handlersModule: undefined as any,
		listenersModule: undefined as any,
		accessModule: undefined as any,
	};

	registerModuleContext.handlersModule = registerHandlersModule(
		registerModuleContext
	);

	registerModuleContext.listenersModule = registerListenersModule(
		registerModuleContext
	);

	registerModuleContext.accessModule = registerAccessModule(
		registerModuleContext
	);

	return {
		...registerModuleContext.accessModule,
		...registerModuleContext.handlersModule,
		...registerModuleContext.componentListenerContexts,
		state: typedecsState,
	};
}
