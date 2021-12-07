import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
} from '~/types/component';
import type { ComponentStateListener } from '~/types/context';
import type {} from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function componentStateListenersModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		removeComponentStateListener <
			K extends ComponentKey<M>,
			R extends Record<string, unknown> | undefined = undefined
		>({
			component,
			listener,
		}: {
			component: K | ComponentFromKey<M, K>;
			listener: ComponentStateListener<M, K, R>;
		}) {
			const componentKey = this.getComponentKey(component);
			const index =
				this._componentListenerContexts
					.get(componentKey)
					?.findIndex((e) => e.listener as any === listener) ?? -1;

			if (index !== -1) {
				this._componentListenerContexts.get(componentKey)!.splice(index, 1);
			}
		},
		addComponentStateListener <
			K extends ComponentKey<M>,
			R extends Record<string, unknown> | undefined = undefined
		>({
			component,
			listener,
			extras,
		}: {
			component: K | ComponentFromKey<M, K>;
			listener: ComponentStateListener<M, K, R>;
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
		createComponentStateListenerManager <
			K extends ComponentKey<M>,
			R extends Record<string, unknown> | undefined = undefined
		>(listener: ComponentStateListener<M, K, R>) {
			const listeners = new Map<
				ComponentKey<M>,
				ComponentStateListener<M, K, R>
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
