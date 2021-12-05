import type { EnemyEntity, PlayerEntity, WeaponEntity } from '~test/defs/entity';
import { createEcs } from '~test/utils/ecs';

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

	function attack({ attacker, defender }: { attacker: Damage}) {
		ecs.set(enemy, )
	}
});
