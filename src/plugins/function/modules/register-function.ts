import type { InternalLionecs } from '~/types/lionecs';
import type { ComponentBase, ComponentState } from '~/types/state';

export function registerFunctionModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	function registerFunction(this: InternalLionecs<C, S>) {
		throw new Error('not implemented');
	}

	return {
		registerFunction,
	};
}
