import type { Entity } from '~/exports.js';
import { defComponent } from '~/exports.js';

export const inventory = defComponent<{
	primary: Entity | undefined;
	secondary: Entity | undefined;
}>().name('inventory');
export const inventoryItem = defComponent<true>().name('inventoryItem');
