import { createLionecs } from '~/exports.js';

import * as componentsMap from '../defs/component.js';

export function createEcs() {
	const ecs = createLionecs({
		components: componentsMap,
	});

	return ecs;
}
