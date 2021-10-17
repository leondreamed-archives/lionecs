import rfdc from 'rfdc';

import * as lionecsModules from './modules';
import type { EntityMap } from './types/entity';
import type {
	InternalLionecs,
	InternalLionecsState,
	Lionecs,
} from './types/lionecs';
import type { InternalLionecsProperties } from './types/properties';
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

const clone = rfdc();
const lionecsModulesObj = { ...lionecsModules };
const lionecsProperties = {} as InternalLionecsProperties<any, any>;
for (const module of Object.values(lionecsModulesObj)) {
	for (const [fn, value] of Object.entries(module<any, any>())) {
		lionecsProperties[fn as keyof InternalLionecsProperties<any, any>] = value;
	}
}

export function createLionecs<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras
>({ components: componentsList }: CreateLionecsProps<C>) {
	const components = {} as Record<string, EntityMap<C, S, ComponentKey<C>>>;
	for (const component of Object.keys(componentsList)) {
		components[component] = {};
	}

	const internalState: InternalLionecsState<C, S> = {
		state: { components } as LionecsState<C, S>,
		_entityListenerContexts: new Map(),
		_componentListenerContexts: new Map(),
		_activeUpdateCallCount: 0,
		_activeUpdates: [],
		_untriggeredListeners: new Map(),
		_areListenersBeingTriggered: false,
	};

	const lionecs = Object.assign(
		clone(lionecsProperties),
		internalState
	) as InternalLionecs<C, S, X>;

	return lionecs as unknown as Lionecs<C, S, X>;
}

// TODO: get the following code to not throw any type error
const ecs = createLionecs({} as any);
ecs.createEntityStateListenerManager<string, Record<string, unknown>>(() => {
	/* empty */
});
