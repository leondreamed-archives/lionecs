import type { registerAccessModule } from './access';
import type { registerHandlersModule } from './handlers';
import type {
	ComponentStateListenerContext,
	EntityStateListenerContext,
	registerListenersModule,
} from './listeners';

export enum Component {
	_ = '',
}
export type ComponentState = Record<Component, any>;

export type Entity = string;
export type EntityMap<C extends Component> = Record<
	Entity,
	Readonly<ComponentState[C]>
>;

export type TypedEntity<
	R extends Component,
	O extends Component | undefined = undefined
> = Entity & {
	__requiredComponents: R;
	__optionalComponents: O;
};

export type LionecsState = {
	components: {
		[K in Component]: EntityMap<K>;
	};
	entities: Record<string, Entity[]>;
};

export type RegisterModuleContext = {
	lionecsState: LionecsState;
	entityListenerContexts: Map<Entity, EntityStateListenerContext<any, any>[]>;
	componentListenerContexts: Map<
		Component,
		ComponentStateListenerContext<any, any>[]
	>;
	handlersModule: ReturnType<typeof registerHandlersModule>;
	listenersModule: ReturnType<typeof registerListenersModule>;
	accessModule: ReturnType<typeof registerAccessModule>;
};
