import type {
	Component,
	Entity,
	RegisterModuleContext,
	TypedecsState,
} from './types';

type OptionalExtras<X extends Record<string, unknown> | undefined> =
	X extends Record<string, unknown> ? { extras: X } : { extras?: X };

export type ComponentStateListener<
	C extends Component,
	X extends Record<string, unknown> | undefined = undefined
> = (
	props: {
		component: C;
		oldState: TypedecsState;
		entities: Entity[];
	} & OptionalExtras<X>
) => void;

export type EntityStateListener<
	E extends Entity,
	X extends Record<string, unknown> | undefined = undefined
> = (
	props: {
		entity: E;
		oldState: TypedecsState;
		components: Component[];
	} & OptionalExtras<X>
) => void;

export type EntityStateListenerContext<
	E extends Entity,
	X extends Record<string, unknown> | undefined = undefined
> = {
	listener: EntityStateListener<E, X>;
	extras: X;
};

export type ComponentStateListenerContext<
	C extends Component,
	X extends Record<string, unknown> | undefined = undefined
> = {
	listener: ComponentStateListener<C, X>;
	extras: X;
};

export function registerListenersModule({
	entityListenerContexts,
	componentListenerContexts,
}: RegisterModuleContext) {
	// eslint-disable-next-line @typescript-eslint/ban-types
	const listenersModuleFunctions = {} as Record<string, Function>;

	listenersModuleFunctions.addEntityStateListener = addEntityStateListener;
	function addEntityStateListener<
		E extends Entity,
		X extends Record<string, unknown> | undefined = undefined
	>({
		entity,
		listener,
		extras,
	}: {
		entity: E;
		listener: EntityStateListener<E, X>;
		extras?: X;
	}) {
		if (!entityListenerContexts.has(entity)) {
			entityListenerContexts.set(entity, []);
		}

		entityListenerContexts.get(entity)!.push({
			listener,
			extras,
		});
	}

	listenersModuleFunctions.addComponentStateListener =
		addComponentStateListener;
	function addComponentStateListener<
		C extends Component,
		X extends Record<string, unknown> | undefined = undefined
	>({
		component,
		listener,
		extras,
	}: {
		component: C;
		listener: ComponentStateListener<C, X>;
		extras?: X;
	}) {
		if (!componentListenerContexts.has(component)) {
			componentListenerContexts.set(component, []);
		}

		componentListenerContexts.get(component)!.push({
			listener,
			extras,
		});
	}

	listenersModuleFunctions.removeEntityStateListener =
		removeEntityStateListener;
	function removeEntityStateListener<
		E extends Entity,
		X extends Record<string, unknown> | undefined = undefined
	>({
		entity,
		listener,
	}: {
		entity: Entity;
		listener: EntityStateListener<E, X>;
	}) {
		const index =
			entityListenerContexts
				.get(entity)
				?.findIndex((e) => e.listener === listener) ?? -1;

		if (index !== -1) {
			entityListenerContexts.get(entity)!.splice(index, 1);
		}
	}

	listenersModuleFunctions.removeComponentStateListener =
		removeComponentStateListener;
	function removeComponentStateListener<
		C extends Component,
		X extends Record<string, unknown> | undefined = undefined
	>({
		component,
		listener,
	}: {
		component: C;
		listener: ComponentStateListener<C, X>;
	}) {
		const index =
			componentListenerContexts
				.get(component)
				?.findIndex((e) => e.listener === listener) ?? -1;

		if (index !== -1) {
			componentListenerContexts.get(component)!.splice(index, 1);
		}
	}

	listenersModuleFunctions.createEntityStateListenerManager =
		createEntityStateListenerManager;
	function createEntityStateListenerManager<
		E extends Entity,
		X extends Record<string, unknown> | undefined = undefined
	>(listener: EntityStateListener<E, X>) {
		const listeners = new Map<Entity, EntityStateListener<E, X>>();

		function registerEntityStateListener(entity: E, extras?: X) {
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

	listenersModuleFunctions.createComponentStateListenerManager =
		createComponentStateListenerManager;
	function createComponentStateListenerManager<
		C extends Component,
		X extends Record<string, unknown> | undefined = undefined
	>(listener: ComponentStateListener<C, X>) {
		const listeners = new Map<Component, ComponentStateListener<C, X>>();

		function registerComponentStateListener(component: C) {
			if (!listeners.has(component)) {
				addComponentStateListener({ component, listener });
				listeners.set(component, listener);
			}
		}

		function deleteComponentStateListener(component: C) {
			removeComponentStateListener({ component, listener });
			listeners.delete(component);
		}

		return { registerComponentStateListener, deleteComponentStateListener };
	}

	return listenersModuleFunctions;
}
