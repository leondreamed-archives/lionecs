import type { PlayerEntity} from '~test/defs/entity';
import { WeaponEntity } from '~test/defs/entity';
import { createEcs } from '~test/utils/ecs';

test('creates', () => {
	const ecs = createEcs();

	ecs.createEntity<PlayerEntity>({
		components: {
			health: 100,
			inventory: {
				primary: 'gun',
				secondary: 'hello',
			},
			name: 'Leon',
		},
	});
});
