import type { Entity } from '~/index';
import { defComponent } from '~/index';

export const name = defComponent<string>().setName('name');
export type Name = typeof name;

export const health = defComponent<number[]>().setName('health');
export type Health = typeof health;

export const inventory =
	defComponent<{ primary: Entity; secondary: Entity }>().setName('inventory');
export type Inventory = typeof inventory;

export const damage = defComponent<number>().setName('damage');
export type Damage = typeof damage;