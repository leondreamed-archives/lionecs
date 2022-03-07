import { test, expect } from 'vitest'
import type { TypedEntity } from '~/exports.js';
import { Component } from '~test/defs/component.js';
import type { GameEntity } from '~test/defs/entity.js';
import { createEcs } from '~test/utils/ecs.js';

test('creates', () => {
	const ecs = createEcs();
	const p = ecs.useProxy();

	const sword = ecs.entity<GameEntity['weapon']>({
		damage: 10,
		inventoryItem: true,
		name: 'MySword',
	});

	const enemy = ecs.entity<GameEntity['enemy']>({
		damage: 5,
		health: 50,
	});

	const player = ecs.entity<GameEntity['player']>({
		health: 100,
		inventory: {
			primary: sword,
			secondary: null,
		},
		name: 'Leon',
	});

	function attack({
		attacker,
		defender,
	}: {
		attacker: TypedEntity<Component['damage']>;
		defender: TypedEntity<Component['health']>;
	}) {
		p(defender).health -= p(attacker).damage;
	}

	attack({ attacker: enemy, defender: player });

	expect(ecs.get(player, Component.health)).toBe(95);

	attack({ attacker: sword, defender: enemy });

	expect(p(enemy).health).toBe(40);

	function swapInventoryItems(entity: TypedEntity<Component['inventory']>) {
		const { inventory } = p(entity);
		[inventory.primary, inventory.secondary] = [
			inventory.secondary,
			inventory.primary,
		];
	}

	swapInventoryItems(player);

	expect(p(player).inventory.primary).toBe(null);
	expect(p(player).inventory.secondary).toBe(sword);
});
