import { TypedEntity } from '~/exports.js';
import { Component } from '~test/defs/component.js';
import type {
	EnemyEntity,
	PlayerEntity,
	WeaponEntity,
} from '~test/defs/entity.js';
import { createEcs } from '~test/utils/ecs.js';

test('creates', () => {
	const ecs = createEcs();
	const p = ecs.useProxy();

	const sword = ecs.entity<WeaponEntity>({
		damage: 10,
		inventoryItem: true,
		name: 'MySword',
	});

	const enemy = ecs.entity<EnemyEntity>({
		damage: 5,
		health: 50,
	});

	const player = ecs.entity<PlayerEntity>({
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

	expect(p(player).health).toBe(95);

	attack({ attacker: sword, defender: enemy });

	expect(p(enemy).health).toBe(40);

	function swapInventoryItems(entity: TypedEntity<Component['inventory']>) {
		const inventory = p(entity).inventory;
		[inventory.primary, inventory.secondary] = [
			inventory.secondary,
			inventory.primary,
		];
	}

	swapInventoryItems(player);

	expect(p(player).inventory.primary).toBe(null);
	expect(p(player).inventory.secondary).toBe(sword);
});
