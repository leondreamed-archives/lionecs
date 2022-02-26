import { Component } from '../defs/component.js';
import { createLionecs } from '~/exports.js';

export function createEcs() {
	const ecs = createLionecs({
		components: Component,
	});

	return ecs;
}
