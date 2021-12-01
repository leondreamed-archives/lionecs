import type {
	ComponentKey,
	ComponentMap,
	ComponentType,
} from '~/types/component';
import type { Entity, TypedEntity } from '~/types/entity';
import type { InternalLionecs } from '~/types/lionecs';
import type { LionecsState } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function getModule<C extends ComponentMap>() {
	const defineMethods = useDefineMethods<C>();

	type GetOptions = {
		optional?: boolean;
	};

	// get(state, entity, component, options)
	function get<
		E extends Entity,
		K extends E extends TypedEntity<infer Req, infer Opt>
			?
					| keyof TypedEntity<Req, Opt>['__required']
					| keyof TypedEntity<Req, Opt>['__optional']
			: ComponentKey<C>,
		O extends E extends TypedEntity<infer Req, infer Opt>
			? C extends keyof TypedEntity<Req, Opt>['__optional']
				? { optional: true }
				: { optional: false }
			: GetOptions
	>(
		state: LionecsState<C>,
		entity: E,
		component: K,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? ComponentType<C[K]> | undefined
			: ComponentType<C[K]>
		: ComponentType<C[K]> | undefined;

	// get(entity, component, options)
	function get<
		E extends Entity,
		K extends E extends TypedEntity<infer Req, infer Opt>
			?
					| keyof TypedEntity<Req, Opt>['__required']
					| keyof TypedEntity<Req, Opt>['__optional']
			: ComponentKey<C>,
		O extends E extends TypedEntity<infer Req, infer Opt>
			? C extends keyof TypedEntity<Req, Opt>['__optional']
				? { optional: true }
				: { optional: false }
			: GetOptions
	>(
		entity: E,
		component: K,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? ComponentType<C[K]> | undefined
			: ComponentType<C[K]>
		: ComponentType<C[K]> | undefined;

	function get<K extends ComponentKey<C>>(
		this: InternalLionecs<C>,
		...args: unknown[]
	): ComponentType<C[K]> {
		// get(entity, component, options)
		if (typeof args[0] === 'string') {
			const [entity, component, options] = args as [
				Entity,
				K,
				GetOptions | undefined
			];
			const optional = options?.optional ?? true;

			const componentState = this.state.components[component][entity];

			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as ComponentType<C[K]>;
		}
		// get(state, entity, component, options)
		else {
			const [state, entity, component, options] = args as [
				LionecsState<C>,
				Entity,
				K,
				GetOptions | undefined
			];
			const optional = options?.optional ?? true;

			const componentState = state.components[component][entity];
			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as ComponentType<C[K]>;
		}
	}

	function getOpt<K extends ComponentKey<C>>(
		state: LionecsState<C>,
		entity: Entity,
		component: K
	): ComponentType<C[K]> | undefined;

	function getOpt<K extends ComponentKey<C>>(
		entity: Entity,
		component: K
	): ComponentType<C[K]> | undefined;

	function getOpt<K extends ComponentKey<C>>(
		this: InternalLionecs<C>,
		...args: unknown[]
	): ComponentType<C[K]> | undefined {
		// getOpt(state, entity, component)
		if (args.length === 3) {
			const [state, entity, component] = args as [LionecsState<C>, Entity, K];
			return state.components[component][entity] as ComponentType<C[K]>;
		} else {
			const [entity, component] = args as [Entity, K];
			return this.state.components[component][entity] as ComponentType<C[K]>;
		}
	}

	return defineMethods({ get, getOpt });
}
