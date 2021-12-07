import type { ComponentMap } from '~/types/component';
import type { EntityStateListener } from '~/types/context';
import type { Entity } from '~/types/entity';
import { useDefineMethods } from '~/utils/methods';

export function entityStateListenersModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		addEntityStateListener: function <
			E extends Entity,
			R extends Record<string, unknown> | undefined = undefined
		>({
			entity,
			listener,
			extras,
		}: {
			entity: E;
			listener: EntityStateListener<M, E, R>;
			extras?: R;
		}) {
			if (!this._entityListenerContexts.has(entity.__key)) {
				this._entityListenerContexts.set(entity.__key, []);
			}

			this._entityListenerContexts.get(entity.__key)!.push({
				listener: listener as any,
				extras,
			});
		},
		createEntityStateListenerManager: function <
			E extends Entity,
			R extends Record<string, unknown> | undefined = undefined
		>(listener: EntityStateListener<M, E, R>) {
			const listeners = new Map<Entity, EntityStateListener<M, E, R>>();

			const registerEntityStateListener = (entity: E, extras?: R) => {
				if (!listeners.has(entity)) {
					this.addEntityStateListener({ entity, listener, extras });
					listeners.set(entity, listener);
				}
			};

			const deleteEntityStateListener = (entity: E) => {
				this.removeEntityStateListener({ entity, listener });
				listeners.delete(entity);
			};

			return { registerEntityStateListener, deleteEntityStateListener };
		},
		removeEntityStateListener: function <
			E extends Entity,
			R extends Record<string, unknown> | undefined = undefined
		>({
			entity,
			listener,
		}: {
			entity: Entity;
			listener: EntityStateListener<M, E, R>;
		}) {
			const index =
				this._entityListenerContexts
					.get(entity.__key)
					?.findIndex((e) => e.listener === listener) ?? -1;

			if (index !== -1) {
				this._entityListenerContexts.get(entity.__key)!.splice(index, 1);
			}
		},
	});
}
