import type { TypedEntity } from '~/types';
import type { ComponentKey, ComponentMap } from '~/types/component';
import { useDefineMethods } from '~/utils/methods';

type DefineTypedEntityProps<
	C extends ComponentMap,
	R extends ComponentKey<C>[],
	O extends ComponentKey<C>[]
> = {
	required: R;
	optional?: O;
};

export function defineModule<C extends ComponentMap>() {
	const defineMethods = useDefineMethods<C>();

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
