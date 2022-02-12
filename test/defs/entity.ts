import { Component } from './component.js';
import { useDefineEntities } from '~/exports.js';

const defineEntities = useDefineEntities<typeof Component>();

const GameEntity = defineEntities({
	player: [Component.health, Component.inventory, Component.name],
	enemy: [Component.health, Component.damage],
	weapon: [Component.inventoryItem, Component.name, Component.damage],
});

export type GameEntity = typeof GameEntity;
