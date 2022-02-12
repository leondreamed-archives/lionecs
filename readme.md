# LionECS

## Installation

Install LionECS from npm using your favourite package manager (I recommend [pnpm](https://pnpm.io/)):

```shell script
pnpm add lionecs
```

## Usage

components.ts

```typescript
import type { Entity } from 'lionecs';
import { defComponent } from 'lionecs';

export const name = defComponent<string>().name('name');
export type Name = typeof name;

export const health = defComponent<number>().name('health');
export type Health = typeof health;

export const inventory =
  defComponent<{ primary: Entity | null; secondary: Entity | null }>().name(
    'inventory'
  );
export type Inventory = typeof inventory;

export const inventoryItem = defComponent<true>().name('inventoryItem');
export type InventoryItem = typeof inventoryItem;

export const damage = defComponent<number>().name('damage');
export type Damage = typeof damage;
```

entities.ts

```typescript
import * as Component from './component.js';
import { useDefineEntities } from 'lionecs';

const defineEntities = useDefineEntities<typeof Component>();

const entities = defineEntities<{
  player: [Component.Health | Component.Inventory | Component.Name];
  enemy: [Component.Health | Component.Damage];
  weapon: [Component.InventoryItem | Component.Name | Component.Damage];
}>();

export type PlayerEntity = typeof entities.player;
export type EnemyEntity = typeof entities.enemy;
export type WeaponEntity = typeof entities.weapon;
```

index.ts

```typescript
import { createLionecs } from 'lionecs';
import * as Component from './components';
import { TypedEntity } from './types';

const ecs = createLionecs({ components: Component });
const p = ecs.p.bind(ecs);

// TypeScript IntelliSense works here!
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
  attacker: TypedEntity<Component.Damage>;
  defender: TypedEntity<Component.Health>;
}) {
  // TypeScript IntelliSense also works here!
  p(defender).health -= p(attacker).damage;
}

attack({ attacker: enemy, defender: player });

// Equivalent to ecs.get(player, Component.health)
console.log(p(player).health); // Outputs: 95

attack({ attacker: sword, defender: enemy });

console.log(p(enemy).health); // Outputs: 40

function swapInventoryItems(entity: TypedEntity<Component.Inventory>) {
  const inventory = p(entity).inventory;
  [inventory.primary, inventory.secondary] = [inventory.secondary, inventory.primary];
}

swapInventoryItems(player);

console.log(p(player).inventory.primary); // Outputs: null
console.log(p(player).inventory.secondary === sword); // Outputs: true
```
