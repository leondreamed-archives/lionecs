import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
} from '~/types/component';
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
			component: K | ComponentFromKey<C, K>;
			listener: ComponentStateListener<C, K, R>;
		}) {
			const componentKey = this.getComponentKey(component);
			const index =
				this._componentListenerContexts
					.get(componentKey)
					?.findIndex((e) => e.listener === listener) ?? -1;

			if (index !== -1) {
				this._componentListenerContexts.get(componentKey)!.splice(index, 1);
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
			component: K | ComponentFromKey<C, K>;
			listener: ComponentStateListener<C, K, R>;
			extras?: R;
		}) {
			const componentKey = this.getComponentKey(component);
			if (!this._componentListenerContexts.has(componentKey)) {
				this._componentListenerContexts.set(componentKey, []);
			}

			this._componentListenerContexts.get(componentKey)!.push({
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
