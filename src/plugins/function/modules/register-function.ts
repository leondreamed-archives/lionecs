import type { ComponentBase, ComponentState } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function registerFunctionModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

	const { registerFunction } = defineMethods({
		registerFunction: function () {
			throw new Error('not implemented');
		},
	});

	return {
		registerFunction,
	};
}
