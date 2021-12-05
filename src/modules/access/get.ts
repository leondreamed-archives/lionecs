import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
	TypeOfComponent,
} from '~/types/component';
import type { BaseTypedEntityComponents, Entity } from '~/types/entity';
import type { InternalLionecs } from '~/types/lionecs';
import type { LionecsState } from '~/types/state';
import { isComponent } from '~/utils/component';
import { useDefineMethods } from '~/utils/methods';

export function getModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	type GetOptions = {
		optional?: boolean;
	};

	// get(state, entity, component, options)
	function get<
		E extends Entity,
		K extends E extends BaseTypedEntityComponents<M, infer Req, infer Opt>
			? Opt extends ComponentKey<M>
				? Req | Opt
				: Req
			: ComponentKey<M>,
		O extends E extends BaseTypedEntityComponents<M, infer _Req, infer Opt>
			? M extends keyof Opt
				? { optional: true }
				: { optional: false }
			: GetOptions
	>(
		state: LionecsState<M>,
		entity: E,
		component: K | ComponentFromKey<M, K>,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? TypeOfComponent<M[K]> | undefined
			: TypeOfComponent<M[K]>
		: TypeOfComponent<M[K]> | undefined;

	// get(entity, component, options)
	function get<
		E extends Entity,
		K extends E extends BaseTypedEntityComponents<M, infer Req, infer Opt>
			? Opt extends ComponentKey<M>
				? Req | Opt
				: Req
			: ComponentKey<M>,
		O extends E extends BaseTypedEntityComponents<M, infer _Req, infer Opt>
			? M extends keyof Opt
				? { optional: true }
				: { optional: false }
			: GetOptions
	>(
		entity: E,
		component: K | ComponentFromKey<M, K>,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? TypeOfComponent<M[K]> | undefined
			: TypeOfComponent<M[K]>
		: TypeOfComponent<M[K]> | undefined;

	function get<K extends ComponentKey<M>>(
		this: InternalLionecs<M>,
		...args: unknown[]
	): TypeOfComponent<M[K]> {
		// get(entity, component, options)
		if (typeof args[0] === 'string') {
			const [entity, component, options] = args as [
				Entity,
				K | ComponentFromKey<M, K>,
				GetOptions | undefined
			];
			const optional = options?.optional ?? true;
			const componentKey = this.getComponentKey(component);

			const componentState = this.state.components[componentKey][entity];

			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as TypeOfComponent<M[K]>;
		}
		// get(state, entity, component, options)
		else {
			const [state, entity, component, options] = args as [
				LionecsState<M>,
				Entity,
				K | ComponentFromKey<M, K>,
				GetOptions | undefined
			];
			const componentKey = this.getComponentKey(component);
			const optional = options?.optional ?? true;

			const componentState = state.components[componentKey][entity];

			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as TypeOfComponent<M[K]>;
		}
	}

	function getOpt<K extends ComponentKey<M>>(
		state: LionecsState<M>,
		entity: Entity,
		component: K | ComponentFromKey<M, K>
	): TypeOfComponent<M[K]> | undefined;

	function getOpt<K extends ComponentKey<M>>(
		entity: Entity,
		component: K | ComponentFromKey<M, K>
	): TypeOfComponent<M[K]> | undefined;

	function getOpt<K extends ComponentKey<M>>(
		this: InternalLionecs<M>,
		...args: unknown[]
	): TypeOfComponent<M[K]> | undefined {
		// getOpt(state, entity, component)
		if (args.length === 3) {
			const [state, entity, component] = args as [
				LionecsState<M>,
				Entity,
				K | ComponentFromKey<M, K>
			];
			const componentKey = this.getComponentKey(component);
			return state.components[componentKey][entity] as TypeOfComponent<M[K]>;
		} else {
			const [entity, component] = args as [Entity, K | ComponentFromKey<M, K>];
			const componentKey = this.getComponentKey(component);
			return this.state.components[componentKey][entity] as TypeOfComponent<
				M[K]
			>;
		}
	}

	return defineMethods({
		get,
		getOpt,
		getComponentKey: function <K extends ComponentKey<M>>(
			component: K | ComponentFromKey<M, K>
		): K {
			return (isComponent(component) ? component.__key : component) as K;
		},
	});
}
