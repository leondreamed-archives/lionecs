import type { Entity } from '~/exports.js';
import { defComponent } from '~/exports.js';

export const name = defComponent<string>().name('name');
export type Name = typeof name;

export const health = defComponent<number>().name('health');
export type Health = typeof health;

export const inventory =
	defComponent<{ primary: Entity | null; secondary: Entity | null }>().name(
		'inventory'
	);
export type Inventory = typeof inventory;

export const inventoryItem = defComponent<true>().name('inventoryItem');
export type InventoryItem = typeof inventoryItem;

export const damage = defComponent<number>().name('damage');
export type Damage = typeof damage;
