import type { ComponentStateListener } from '~/types/context';
import type { Lionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
} from '~/types/state';

export function componentStateListenersModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	function removeComponentStateListener<
		K extends ComponentKey<C>,
		R extends Record<string, unknown> | undefined = undefined
	>(
		this: Lionecs<C, S>,
		{
			component,
			listener,
		}: {
			component: K;
			listener: ComponentStateListener<C, S, K, R>;
		}
	) {
		const index =
			this.componentListenerContexts
				.get(component)
				?.findIndex((e) => e.listener === listener) ?? -1;

		if (index !== -1) {
			this.componentListenerContexts.get(component)!.splice(index, 1);
		}
	}

	function addComponentStateListener<
		K extends ComponentKey<C>,
		R extends Record<string, unknown> | undefined = undefined
	>(
		this: Lionecs<C, S>,
		{
			component,
			listener,
			extras,
		}: {
			component: K;
			listener: ComponentStateListener<C, S, K, R>;
			extras?: R;
		}
	) {
		if (!this.componentListenerContexts.has(component)) {
			this.componentListenerContexts.set(component, []);
		}

		this.componentListenerContexts.get(component)!.push({
			listener: listener as any,
			extras,
		});
	}

	function createComponentStateListenerManager<
		K extends ComponentKey<C>,
		R extends Record<string, unknown> | undefined = undefined
	>(this: Lionecs<C, S>, listener: ComponentStateListener<C, S, K, R>) {
		const listeners = new Map<
			ComponentKey<C>,
			ComponentStateListener<C, S, K, R>
		>();

		const registerComponentStateListener = (component: K) => {
			if (!listeners.has(component)) {
				this.addComponentStateListener({ component, listener });
				listeners.set(component, listener);
			}
		};

		const deleteComponentStateListener = (component: K) => {
			this.removeComponentStateListener({ component, listener });
			listeners.delete(component);
		};

		return { registerComponentStateListener, deleteComponentStateListener };
	}

	return {
		addComponentStateListener,
		removeComponentStateListener,
		createComponentStateListenerManager,
	};
}
