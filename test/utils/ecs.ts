import { createLionecs } from '~/exports.js';

import * as componentsMap from '../defs/component';

export function createEcs() {
	const ecs = createLionecs({
		components: componentsMap,
	});

	return ecs;
}
