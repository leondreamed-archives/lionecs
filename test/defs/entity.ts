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

