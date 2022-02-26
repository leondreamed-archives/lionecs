import { Component } from './component.js';
import { useDefineEntities } from '~/exports.js';

const defineEntities = useDefineEntities<Component>();

// eslint-disable-next-line @typescript-eslint/naming-convention
const GameEntity = defineEntities({
	player: [Component.health, Component.inventory, Component.name],
	enemy: [Component.health, Component.damage],
	weapon: [Component.inventoryItem, Component.name, Component.damage],
});

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type GameEntity = typeof GameEntity;
