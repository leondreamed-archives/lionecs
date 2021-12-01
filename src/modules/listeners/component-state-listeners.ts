import type { ComponentKey, ComponentMap } from '~/types/component';
import type { ComponentStateListener } from '~/types/context';
import type {} from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function componentStateListenersModule<C extends ComponentMap>() {
	const defineMethods = useDefineMethods<C>();

	return defineMethods({
		removeComponentStateListener: function <
			K extends ComponentKey<C>,
			R extends Record<string, unknown> | undefined = undefined
		>({
			component,
			listener,
		}: {
			component: K;
			listener: ComponentStateListener<C, K, R>;
		}) {
			const index =
				this._componentListenerContexts
					.get(component)
					?.findIndex((e) => e.listener === listener) ?? -1;

			if (index !== -1) {
				this._componentListenerContexts.get(component)!.splice(index, 1);
			}
		},
		addComponentStateListener: function <
			K extends ComponentKey<C>,
			R extends Record<string, unknown> | undefined = undefined
		>({
			component,
			listener,
			extras,
		}: {
			component: K;
			listener: ComponentStateListener<C, K, R>;
			extras?: R;
		}) {
			if (!this._componentListenerContexts.has(component)) {
				this._componentListenerContexts.set(component, []);
			}

			this._componentListenerContexts.get(component)!.push({
				listener: listener as any,
				extras,
			});
		},
		createComponentStateListenerManager: function <
			K extends ComponentKey<C>,
			R extends Record<string, unknown> | undefined = undefined
		>(listener: ComponentStateListener<C, K, R>) {
			const listeners = new Map<
				ComponentKey<C>,
				ComponentStateListener<C, K, R>
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
		},
	});
}
