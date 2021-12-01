import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
	TypedEntity,
} from '~/types';
import { useDefineMethods } from '~/utils/methods';

type DefineTypedEntityProps<
	C extends ComponentBase,
	R extends ComponentKey<C>[],
	O extends ComponentKey<C>[]
> = {
	required: R;
	optional: O;
};

type ComponentType<N extends string, _T extends unknown> = {
	name: N;
};

export function defineModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

	return defineMethods({
		defineTypedEntity: function <
			R extends ComponentKey<C>[],
			O extends ComponentKey<C>[]
		>(
			_props: DefineTypedEntityProps<C, R, O>
		): TypedEntity<C, R[number], O[number]> {
			return undefined as any;
		},
		defineComponent: function <N extends string, T extends unknown>(
			name: N
		): ComponentType<N, T> {
			return {
				name,
			};
		},
	});
}
/*
	C extends ComponentBase,
	R extends ComponentKey<C>,
	O extends ComponentKey<C> | '__empty' = '__empty'
> = Entity & {
	__required: {
		[K in R]: true;
	};
	__optional: {
		[K in O]: true;
	};
};
*/
