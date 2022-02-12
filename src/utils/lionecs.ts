import { createInstance, retrieveModuleProperties } from 'lion-architecture';

import * as lionecsModules from '../modules/index.js';
import type { ComponentKey, ComponentMap } from '../types/component.js';
import type { EntityMap } from '../types/entity.js';
import type { InternalLionecsState, Lionecs } from '../types/lionecs.js';
import type { InternalLionecsProperties } from '../types/properties.js';
import type { LionecsExtras, LionecsState } from '../types/state.js';

type CreateLionecsProps<M extends ComponentMap> = {
	components: M;
};

const lionecsProperties = retrieveModuleProperties(
	lionecsModules
) as InternalLionecsProperties<any>;

export function createLionecs<M extends ComponentMap, X extends LionecsExtras>({
	components: componentsMap,
}: CreateLionecsProps<M>) {
	const components = {} as Record<string, EntityMap<M, ComponentKey<M>>>;
	for (const component of Object.keys(componentsMap)) {
		components[component] = {};
	}

	const internalState: InternalLionecsState<M> = {
		state: { components } as LionecsState<M>,
		_componentKeys: Object.keys(components),
		_entityListenerContexts: new Map(),
		_componentListenerContexts: new Map(),
		_activeUpdateCallCount: 0,
		_activeUpdates: [],
		_untriggeredListenerCalls: new Set(),
		_areListenersBeingTriggered: false,
	};

	// prettier-ignore
	const lionecs = createInstance(
		lionecsProperties,
		internalState,
	) as Lionecs<M, X> & X;

	return lionecs;
}
