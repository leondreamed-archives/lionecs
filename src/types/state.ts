import type { Entity, EntityMap } from "./entity";

export type LionecsState<
	C extends ComponentBase,
	S extends ComponentState<C>
> = {
	components: {
		[K in ComponentKey<C>]: EntityMap<C, S, K>;
	};
	entities: Record<string, Entity[]>;
};

export type ComponentBase = {
	[id: string]: string;
	[nu: number]: string;
};

export type ComponentContext<
	Component extends ComponentBase,
	ComponentState extends Record<keyof Component, any>
> = {
	component: Component;
	componentState: ComponentState;
};

export type ComponentState<C extends ComponentBase> = Record<keyof C, any>;

export type ComponentKey<C extends ComponentBase> = keyof C;

export type ComponentStateType<
	C extends ComponentBase,
	S extends Record<keyof C, any>,
	T
> = T extends keyof S ? S[T] : never;

export type ComponentStateTypes<
	C extends ComponentBase,
	S extends ComponentState<C>,
	Tuple extends readonly [...any[]]
> = {
	[Index in keyof Tuple]: ComponentStateType<C, S, Tuple[Index]> | undefined;
} & { length: Tuple["length"] };

export enum StateUpdateType {
	set = "set",
	del = "del",
}

export type StateUpdate<
	C extends ComponentBase,
	S extends ComponentState<C>,
	K extends ComponentKey<C>
> =
	| {
			type: StateUpdateType.set;
			entity: Entity;
			component: K;
			oldComponentState: S[K] | undefined;
			newComponentState: S[K];
	  }
	| {
			type: StateUpdateType.del;
			entity: Entity;
			component: K;
	  };
