import * as Component from './component.js';
import { useDefineEntities } from '~/exports.js';

const defineEntities = useDefineEntities<typeof Component>();

const entities = defineEntities<{
	player: [Component.Health | Component.Inventory | Component.Name];
	enemy: [Component.Health | Component.Damage];
	weapon: [Component.InventoryItem | Component.Name | Component.Damage];
}>();

export type PlayerEntity = typeof entities.player;
export type EnemyEntity = typeof entities.enemy;
export type WeaponEntity = typeof entities.weapon;
