import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
	TypeOfComponent,
} from './component';
import type { Entity } from './entity';

export type ComponentStateChangeHandler<
	C extends ComponentMap,
	K extends ComponentKey<C>,
	E extends Entity,
	R extends Record<string, unknown>
> = {
	oldComponentState: TypeOfComponent<C[K]> | undefined;
	component: ComponentFromKey<C, K>;
	callback(props: {
		entity: E;
		extras: R;
		oldComponentState: TypeOfComponent<C[K]> | undefined;
		newComponentState: TypeOfComponent<C[K]> | undefined;
	}): void;
};
