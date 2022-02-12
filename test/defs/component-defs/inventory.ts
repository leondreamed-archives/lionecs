import { defComponent, Entity } from '~/exports.js';

export const inventory =
	defComponent<{ primary: Entity | null; secondary: Entity | null }>().name(
		'inventory'
	);
export const inventoryItem = defComponent<true>().name('inventoryItem');
