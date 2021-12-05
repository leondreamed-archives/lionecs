import type {
	EnemyEntity,
	PlayerEntity,
	WeaponEntity,
} from '~test/defs/entity';
import type { TypedEntity } from '~test/types/entity';
import { createEcs } from '~test/utils/ecs';

import * as Component from '../defs/component';

test('creates', () => {
	const ecs = createEcs();

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
				primary: 'gun',
				secondary: 'hello',
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
		const damage = ecs.get(attacker, Component.damage);
		const prevHealth = ecs.get(defender, Component.health);
		ecs.set(defender, Component.health, )
	}
});
