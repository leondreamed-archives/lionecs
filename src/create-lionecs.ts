import * as lionecsModules from './modules';
import type { EntityMap } from './types/entity';
import type { Lionecs } from './types/lionecs';
import type { LionecsMethods } from './types/methods';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	LionecsState,
} from './types/state';

type CreateLionecsProps<
	C extends ComponentBase,
	X extends Record<string, unknown>
> = {
	components: C[];
	extras: X;
};

export function createLionecs<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends Record<string, unknown> = Record<string, unknown>
>({ components: componentsList, extras }: CreateLionecsProps<C, X>) {
	const components = {} as Record<string, EntityMap<C, S, ComponentKey<C>>>;
	for (const component of Object.keys(componentsList)) {
		components[component] = {};
	}

	const lionecsModulesObj = { ...lionecsModules };
	const lionecsMethods = {} as LionecsMethods<C, S>;
	for (const module of Object.values(lionecsModulesObj)) {
		for (const [fn, value] of Object.entries(module<C, S>())) {
			lionecsMethods[fn as keyof LionecsMethods<C, S>] = value;
		}
	}

	const lionecs: Lionecs<C, S, X> = {
		...lionecsMethods,
		state: { components } as LionecsState<C, S, X>,
		entityListenerContexts: new Map(),
		componentListenerContexts: new Map(),
		activeUpdateCallCount: 0,
		activeUpdates: [],
		untriggeredListeners: new Map(),
		areListenersBeingTriggered: false,
		extras,
	};

	return lionecs;
}
