import type { ComponentKey, ComponentMap, TypeOfComponent } from './component';
import type { Entity, EntityMap } from './entity';

export type LionecsState<M extends ComponentMap> = {
	components: {
		[K in ComponentKey<M>]: EntityMap<M, K>;
	};
};

export type ComponentContext<M extends ComponentMap> = {
	component: M;
};

export type LionecsExtras<
	X extends Record<string, unknown> = Record<never, never>
> = X;

export type ComponentStateType<M extends ComponentMap, T> = T extends keyof M
	? M[T]
	: never;

export enum StateUpdateType {
	set = 'set',
	del = 'del',
}

export type StateUpdate<M extends ComponentMap, K extends ComponentKey<M>> =
	| {
			type: StateUpdateType.set;
			entity: Entity;
			componentKey: K;
			oldComponentState: TypeOfComponent<M[K]> | undefined;
			newComponentState: TypeOfComponent<M[K]>;
	  }
	| {
			type: StateUpdateType.del;
			entity: Entity;
			componentKey: K;
	  };
