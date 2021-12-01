import type { ComponentKey, ComponentMap, ComponentType } from './component';
import type { Entity, EntityMap } from './entity';

export type LionecsState<C extends ComponentMap> = {
	components: {
		[K in ComponentKey<C>]: EntityMap<C, K>;
	};
};

export type ComponentContext<C extends ComponentMap> = {
	component: C;
};

export type LionecsExtras<
	X extends Record<string, unknown> = Record<never, never>
> = X;

export type ComponentStateType<C extends ComponentMap, T> = T extends keyof C
	? C[T]
	: never;

export type ComponentStateTypes<
	C extends ComponentMap,
	Tuple extends readonly [...any[]]
> = {
	[Index in keyof Tuple]: ComponentStateType<C, Tuple[Index]> | undefined;
} & { length: Tuple['length'] };

export enum StateUpdateType {
	set = 'set',
	del = 'del',
}

export type StateUpdate<C extends ComponentMap, K extends ComponentKey<C>> =
	| {
			type: StateUpdateType.set;
			entity: Entity;
			component: K;
			oldComponentState: ComponentType<C[K]> | undefined;
			newComponentState: ComponentType<C[K]>;
	  }
	| {
			type: StateUpdateType.del;
			entity: Entity;
			component: K;
	  };
