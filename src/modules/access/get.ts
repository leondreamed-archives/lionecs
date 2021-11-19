import type { Entity, TypedEntity } from '~/types/entity';
import type { InternalLionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	LionecsState,
} from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function getModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

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
		state: LionecsState<C, S>,
		entity: E,
		component: K,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? S[K] | undefined
			: S[K]
		: S[K] | undefined;

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
			? S[K] | undefined
			: S[K]
		: S[K] | undefined;

	function get<K extends ComponentKey<C>>(
		this: InternalLionecs<C, S>,
		...args: unknown[]
	): S[K] {
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

			return componentState as S[K];
		}
		// get(state, entity, component, options)
		else {
			const [state, entity, component, options] = args as [
				LionecsState<C, S>,
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

			return componentState as S[K];
		}
	}

	function getOpt<K extends ComponentKey<C>>(
		state: LionecsState<C, S>,
		entity: Entity,
		component: K
	): S[K] | undefined;

	function getOpt<K extends ComponentKey<C>>(
		entity: Entity,
		component: K
	): S[K] | undefined;

	function getOpt<K extends ComponentKey<C>>(
		this: InternalLionecs<C, S>,
		...args: unknown[]
	): S[K] | undefined {
		// getOpt(state, entity, component)
		if (args.length === 3) {
			const [state, entity, component] = args as [
				LionecsState<C, S>,
				Entity,
				K
			];
			return state.components[component][entity] as S[K];
		} else {
			const [entity, component] = args as [Entity, K];
			return this.state.components[component][entity] as S[K];
		}
	}

	return {
		...defineMethods({ get }),
		...defineMethods({ getOpt }),
	};
}
