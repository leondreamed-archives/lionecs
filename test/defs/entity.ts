import { Component } from './component.js';
import { useDefineEntities } from '~/exports.js';

const defineEntities = useDefineEntities<typeof Component>();

const entities = defineEntities({
	player: {
		required: [Component.health, Component.inventory, Component.name] as const,
	},
	enemy: {
		required: [Component.health, Component.damage] as const,
	},
	weapon: {
		required: [
			Component.inventoryItem,
			Component.name,
			Component.damage,
		] as const,
	},
});

export type PlayerEntity = typeof entities.player;
export type EnemyEntity = typeof entities.enemy;
export type WeaponEntity = typeof entities.weapon;
