import rfdc from 'rfdc';

import * as lionecsModules from './modules';
import type { Component, ComponentKey, ComponentMap } from './types/component';
import type { EntityMap } from './types/entity';
import type { InternalLionecsState, Lionecs } from './types/lionecs';
import type { InternalLionecsProperties } from './types/properties';
import type { LionecsExtras, LionecsState } from './types/state';

type CreateLionecsProps<M extends ComponentMap> = {
	components: M;
};

const clone = rfdc();
const lionecsModulesObj = { ...lionecsModules };
const lionecsProperties = {} as InternalLionecsProperties<any>;
for (const module of Object.values(lionecsModulesObj)) {
	for (const [fn, value] of Object.entries(module<any>())) {
		lionecsProperties[fn as keyof InternalLionecsProperties<any>] = value;
	}
}

export function createLionecs<M extends ComponentMap, X extends LionecsExtras>({
	components: componentsMap,
}: CreateLionecsProps<M>) {
	const components = {} as Record<string, EntityMap<M, ComponentKey<M>>>;
	for (const component of Object.keys(componentsMap)) {
		components[component] = {};
	}

	const internalState: InternalLionecsState<M> = {
		state: { components } as LionecsState<M>,
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
	) as unknown as Lionecs<M, X> & X;

	return lionecs;
}

export function defComponent<T>() {
	return {
		setName: function <K extends string>(key: K): Component<K, T> {
			return { __key: key };
		},
	};
}
