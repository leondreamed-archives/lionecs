# LionECS

## Installation

Install LionECS from npm using your favourite package manager (I recommend [pnpm](https://pnpm.io/)):

```bash
pnpm add lionecs
```

## Usage

```typescript
// components.ts

import type { Entity } from 'lionecs';
import { defComponent, defsToComponents } from 'lionecs';

export const Component = defsToComponents({
  name: defComponent<string>().name('name'),
  health: defComponent<number>().name('health'),
  inventory: defComponent<{ primary: Entity | null; secondary: Entity | null }>().name(
    'inventory'
  ),
  inventoryItem: defComponent<true>().name('inventoryItem'),
  damage: defComponent<number>().name('damage'),
});

// Avoids specifying `typeof Component` at every "type site" (the type equivalent of a call site)
export type Component = typeof Component;
```

```typescript
// entities.ts

import { Component } from './components.js';
import { useDefineEntities } from 'lionecs';

const defineEntities = useDefineEntities<typeof Component>();

const GameEntity = defineEntities({
  player: [Component.health, Component.inventory, Component.name],
  enemy: [Component.health, Component.damage],
  weapon: [Component.inventoryItem, Component.name, Component.damage],
});

export type GameEntity = typeof GameEntity;
```

```typescript
import { createLionecs } from 'lionecs';
import { Component } from './components.js';
import type { TypedEntity } from 'lionecs';
import type { GameEntity } from './entities.js';

const ecs = createLionecs({ components: Component });
const p = ecs.useProxy();

// TypeScript IntelliSense works here!
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
  // TypeScript IntelliSense also works here!
  p(defender).health -= p(attacker).damage;
}

attack({ attacker: enemy, defender: player });

console.log(ecs.get(player, Component.health)); // Outputs: 95

attack({ attacker: sword, defender: enemy });

// Equivalent to ecs.get(enemy, Component.health)
console.log(p(enemy).health); // Outputs: 40

function swapInventoryItems(entity: TypedEntity<Component['inventory']>) {
  const inventory = p(entity).inventory;
  [inventory.primary, inventory.secondary] = [inventory.secondary, inventory.primary];
}

swapInventoryItems(player);

console.log(p(player).inventory.primary); // Outputs: null
console.log(p(player).inventory.secondary === sword); // Outputs: true
```
