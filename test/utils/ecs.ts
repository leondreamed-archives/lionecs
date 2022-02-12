import { createLionecs } from '~/exports.js';

import { Component } from '../defs/component.js';

export function createEcs() {
	const ecs = createLionecs({
		components: Component,
	});

	return ecs;
}
