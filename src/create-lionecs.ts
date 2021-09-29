import * as lionecsModules from './modules';
import type { EntityMap } from './types/entity';
import type { Lionecs } from './types/lionecs';
import type { LionecsMethods } from './types/methods';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	LionecsExtras,
	LionecsState,
} from './types/state';

type CreateLionecsProps<C extends ComponentBase> = {
	components: C[];
};

export function createLionecs<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras = LionecsExtras
>({ components: componentsList }: CreateLionecsProps<C>) {
	const components = {} as Record<string, EntityMap<C, S, ComponentKey<C>>>;
	for (const component of Object.keys(componentsList)) {
		components[component] = {};
	}

	const lionecsModulesObj = { ...lionecsModules };
	const lionecsMethods = {} as LionecsMethods<C, S, X>;
	for (const module of Object.values(lionecsModulesObj)) {
		for (const [fn, value] of Object.entries(module<C, S, X>())) {
			lionecsMethods[fn as keyof LionecsMethods<C, S, X>] = value;
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
	};

	return lionecs;
}
