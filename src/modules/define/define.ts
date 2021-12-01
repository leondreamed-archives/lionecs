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
	optional?: O;
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
	});
}
