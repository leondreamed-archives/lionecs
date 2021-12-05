import { BaseTypedEntity } from '~/types';
import type { DefineTypedEntity } from '~test/types/entity';

import type * as Component from './component';

export type PlayerEntity = DefineTypedEntity<
	Component.Health | Component.Inventory | Component.Name
>;

export type EnemyEntity = DefineTypedEntity<
	Component.Health | Component.Damage
>;

export type WeaponEntity = DefineTypedEntity<
	Component.InventoryItem | Component.Name | Component.Damage
>;

type A = PlayerEntity extends BaseTypedEntity<typeof Component, infer R, infer O> ? [R, O] : undefined;

