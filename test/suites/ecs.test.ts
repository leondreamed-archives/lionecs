import type {
	EnemyEntity,
	PlayerEntity,
	WeaponEntity,
} from '~test/defs/entity';
import type { TypedEntity } from '~test/types/entity';
import { createEcs } from '~test/utils/ecs';

import type * as Component from '../defs/component';

test('creates', () => {
	const ecs = createEcs();
	const p = ecs.p.bind(ecs);

	const sword = ecs.createEntity<WeaponEntity>({
		components: {
			damage: 10,
			inventoryItem: true,
			name: 'MySword',
		},
	});

	const enemy = ecs.createEntity<EnemyEntity>({
		components: {
			damage: 5,
			health: 50,
		},
	});

	const player = ecs.createEntity<PlayerEntity>({
		components: {
			health: 100,
			inventory: {
				primary: sword,
				secondary: null,
			},
			name: 'Leon',
		},
	});

	function attack({
		attacker,
		defender,
	}: {
		attacker: TypedEntity<Component.Damage>;
		defender: TypedEntity<Component.Health>;
	}) {
		p(defender).health -= p(attacker).damage;
	}

	attack({ attacker: enemy, defender: player });

	expect(p(player).health).toBe(95);

	attack({ attacker: sword, defender: enemy });

	expect(p(enemy).health).toBe(40);

	function swapInventoryItems(entity: TypedEntity<Component.Inventory>) {
		const primaryItem = p(entity).inventory.primary;
		p(entity).inventory.primary = p(entity).inventory.secondary;
		p(entity).inventory.secondary = primaryItem;
	}

	swapInventoryItems(player);

	expect(p(player).inventory.primary).toBe(null);
	expect(p(player).inventory.secondary).toBe(sword);
});
