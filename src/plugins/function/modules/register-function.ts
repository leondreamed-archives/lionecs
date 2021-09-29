import type { ComponentBase, ComponentState } from '~/types/state';

export function registerFunctionModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	function registerFunction() {

	}

	return {
		registerFunction,
	};
}
