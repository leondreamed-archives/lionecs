import type { ComponentKey, ComponentMap, ComponentType } from './component';
import type { Entity } from './entity';

export type ComponentStateChangeHandler<
	C extends ComponentMap,
	K extends ComponentKey<C>,
	E extends Entity,
	R extends Record<string, unknown>
> = {
	oldComponentState: ComponentType<C[K]> | undefined;
	component: K;
	callback(props: {
		entity: E;
		extras: R;
		oldComponentState: ComponentType<C[K]> | undefined;
		newComponentState: ComponentType<C[K]> | undefined;
	}): void;
};
