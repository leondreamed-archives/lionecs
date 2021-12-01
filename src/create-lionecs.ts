import rfdc from 'rfdc';

import * as lionecsModules from './modules';
import type { Component, ComponentKey, ComponentMap } from './types/component';
import type { EntityMap } from './types/entity';
import type { InternalLionecsState, Lionecs } from './types/lionecs';
import type { InternalLionecsProperties } from './types/properties';
import type { LionecsExtras, LionecsState } from './types/state';

type CreateLionecsProps<C extends ComponentMap> = {
	components: C;
};

const clone = rfdc();
const lionecsModulesObj = { ...lionecsModules };
const lionecsProperties = {} as InternalLionecsProperties<any>;
for (const module of Object.values(lionecsModulesObj)) {
	for (const [fn, value] of Object.entries(module<any>())) {
		lionecsProperties[fn as keyof InternalLionecsProperties<any>] = value;
	}
}

export function createLionecs<C extends ComponentMap, X extends LionecsExtras>({
	components: componentsMap,
}: CreateLionecsProps<C>) {
	const components = {} as Record<string, EntityMap<C, ComponentKey<C>>>;
	for (const component of Object.keys(componentsMap)) {
		components[component] = {};
	}

	const internalState: InternalLionecsState<C> = {
		state: { components } as LionecsState<C>,
		_entityListenerContexts: new Map(),
		_componentListenerContexts: new Map(),
		_activeUpdateCallCount: 0,
		_activeUpdates: [],
		_untriggeredListenerCalls: new Set(),
		_areListenersBeingTriggered: false,
	};

	const lionecs = Object.assign(
		clone(lionecsProperties),
		internalState
	) as unknown as Lionecs<C, X> & X;

	return lionecs;
}

export function defComponent<T extends unknown>() {
	return {
		setName: function <N extends string>(name: N): Component<N, T> {
			return { name };
		},
	};
}
