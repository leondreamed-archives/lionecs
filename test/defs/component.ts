import type { Entity } from '~/exports.js';
import { defComponent } from '~/exports.js';

export const name = defComponent<string>().setName('name');
export type Name = typeof name;

export const health = defComponent<number>().setName('health');
export type Health = typeof health;

export const inventory =
	defComponent<{ primary: Entity | null; secondary: Entity | null }>().setName(
		'inventory'
	);
export type Inventory = typeof inventory;

export const inventoryItem = defComponent<true>().setName('inventoryItem');
export type InventoryItem = typeof inventoryItem;

export const damage = defComponent<number>().setName('damage');
export type Damage = typeof damage;
