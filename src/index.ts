import type { EntityMap } from "./types/entity";
import { Lionecs } from "./types/lionecs";
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
} from "./types/state";
import * as lionecsMethods from "./methods";

type CreateLionecsProps<C extends ComponentBase> = {
	components: C[];
};
export function createLionecs<
	C extends ComponentBase,
	S extends ComponentState<C>
>({ components: componentsList }: CreateLionecsProps<C>) {
	const components = {} as Record<string, EntityMap<C, S, ComponentKey<C>>>;
	for (const component of Object.keys(componentsList)) {
		components[component] = {};
	}

	const lionecs: Lionecs<C, S> = Object.create({
		...lionecsMethods,
		state: {
			components: components as Lionecs<C, S>["state"]["components"],
			entities: {},
		},
		entityListenerContexts: new Map(),
		componentListenerContexts: new Map(),
		activeUpdateCallCount: 0,
		activeUpdates: [],
		untriggeredListeners: new Map(),
		areListenersBeingTriggered: false,
	});

	/* Handlers */
	return lionecs;
}

export type {
	ComponentStateListener,
	ComponentStateListenerContext,
	EntityStateListener,
	EntityStateListenerContext,
	StateListener,
} from "./types/context";
export type { Entity, EntityMap, TypedEntity } from "./types/entity";
export type {
	MultiComponentStateChangeHandler,
	SingleComponentStateChangeHandler,
} from "./types/handlers";
export type { Lionecs } from "./types/lionecs";
export type {
	ComponentBase,
	ComponentContext,
	ComponentKey,
	ComponentState,
	LionecsState,
	StateUpdate,
	StateUpdateType,
} from "./types/state";
