import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
	TypeOfComponent,
} from '~/types/component';
import type { Entity, TypedEntity } from '~/types/entity';
import type { InternalLionecs } from '~/types/lionecs';
import type { LionecsState } from '~/types/state';
import { isComponent } from '~/utils/component';
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
		component: K | ComponentFromKey<C, K>,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? TypeOfComponent<C[K]> | undefined
			: TypeOfComponent<C[K]>
		: TypeOfComponent<C[K]> | undefined;

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
		component: K | ComponentFromKey<C, K>,
		options?: O
	): O extends GetOptions
		? O['optional'] extends true
			? TypeOfComponent<C[K]> | undefined
			: TypeOfComponent<C[K]>
		: TypeOfComponent<C[K]> | undefined;

	function get<K extends ComponentKey<C>>(
		this: InternalLionecs<C>,
		...args: unknown[]
	): TypeOfComponent<C[K]> {
		// get(entity, component, options)
		if (typeof args[0] === 'string') {
			const [entity, component, options] = args as [
				Entity,
				K | ComponentFromKey<C, K>,
				GetOptions | undefined
			];
			const optional = options?.optional ?? true;
			const componentKey = this.getComponentKey(component);

			const componentState = this.state.components[componentKey];

			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as TypeOfComponent<C[K]>;
		}
		// get(state, entity, component, options)
		else {
			const [state, entity, component, options] = args as [
				LionecsState<C>,
				Entity,
				K | ComponentFromKey<C, K>,
				GetOptions | undefined
			];
			const optional = options?.optional ?? true;

			const componentState = isComponent(component)
				? state.components[component.__key][entity]
				: state.components[component][entity];

			if (!optional && componentState === undefined) {
				throw new Error(
					`State not found for component ${component} on entity ${entity}.`
				);
			}

			return componentState as TypeOfComponent<C[K]>;
		}
	}

	function getOpt<K extends ComponentKey<C>>(
		state: LionecsState<C>,
		entity: Entity,
		component: K | ComponentFromKey<C, K>
	): TypeOfComponent<C[K]> | undefined;

	function getOpt<K extends ComponentKey<C>>(
		entity: Entity,
		component: K | ComponentFromKey<C, K>
	): TypeOfComponent<C[K]> | undefined;

	function getOpt<K extends ComponentKey<C>>(
		this: InternalLionecs<C>,
		...args: unknown[]
	): TypeOfComponent<C[K]> | undefined {
		// getOpt(state, entity, component)
		if (args.length === 3) {
			const [state, entity, component] = args as [
				LionecsState<C>,
				Entity,
				K | ComponentFromKey<C, K>
			];
			const componentKey = this.getComponentKey(component);
			return state.components[componentKey][entity] as TypeOfComponent<C[K]>;
		} else {
			const [entity, component] = args as [Entity, K | ComponentFromKey<C, K>];
			const componentKey = this.getComponentKey(component);
			return this.state.components[componentKey][entity] as TypeOfComponent<
				C[K]
			>;
		}
	}

	return defineMethods({
		get,
		getOpt,
		getComponentKey: function <K extends ComponentKey<C>>(
			component: K | ComponentFromKey<C, K>
		): K {
			return (isComponent(component) ? component.__key : component) as K;
		},
	});
}
