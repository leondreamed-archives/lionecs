import { Component } from './component.js';
import { useDefineEntities } from '~/exports.js';

const defineEntities = useDefineEntities<typeof Component>();

const entities = defineEntities({
	player: [Component.health, Component.inventory, Component.name],
	enemy: [Component.health, Component.damage],
	weapon: [Component.inventoryItem, Component.name, Component.damage],
});

export type PlayerEntity = typeof entities.player;
export type EnemyEntity = typeof entities.enemy;
export type WeaponEntity = typeof entities.weapon;
