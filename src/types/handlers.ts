import type { ComponentKey, ComponentMap, TypeOfComponent } from './component';
import type { Entity } from './entity';

export type ComponentStateChangeHandler<
	M extends ComponentMap,
	K extends ComponentKey<M>,
	E extends Entity,
	R extends Record<string, unknown>
> = {
	oldComponentState: TypeOfComponent<M[K]> | undefined;
	componentKey: K;
	callback(props: {
		entity: E;
		extras: R;
		oldComponentState: TypeOfComponent<M[K]> | undefined;
		newComponentState: TypeOfComponent<M[K]> | undefined;
	}): void;
};
