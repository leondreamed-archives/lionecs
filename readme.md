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

export const name = defComponent<string>().setName('name');
export type Name = typeof name;

export const health = defComponent<number>().setName('health');
export type Health = typeof health;

export const inventory =
  defComponent<{ primary: Entity | null; secondary: Entity | null }>().setName(
    'inventory'
  );
export type Inventory = typeof inventory;

export const inventoryItem = defComponent<true>().setName('inventoryItem');
export type InventoryItem = typeof inventoryItem;

export const damage = defComponent<number>().setName('damage');
export type Damage = typeof damage;
```

types.ts

```typescript
// Unfortunate boilerplate due to TypeScript generics limitations

export type DefineTypedEntity<
  R extends Component<string, unknown>,
  O extends Component<string, unknown> | never = never
> = BaseDefineTypedEntity<typeof Component, R, O>;

export type TypedEntity<
  R extends Component<string, unknown>,
  O extends Component<string, unknown> | never = never
> = BaseTypedEntity<ComponentMap, KeyOfComponent<R>, KeyOfComponent<O>>;
```

entities.ts

```typescript
import type * as Component from './component';
import type { DefineTypedEntity } from './types';

export type PlayerEntity = DefineTypedEntity<
  Component.Health | Component.Inventory | Component.Name
>;

export type EnemyEntity = DefineTypedEntity<
  Component.Health | Component.Damage
>;

export type WeaponEntity = DefineTypedEntity<
  Component.InventoryItem | Component.Name | Component.Damage
>;
```

index.ts

```typescript
import { createLionecs } from 'lionecs';
import * as Component from './components';
import { TypedEntity } from './types';

const ecs = createLionecs({ components: Component });
const p = ecs.p.bind(ecs);

// TypeScript IntelliSense works here!
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
