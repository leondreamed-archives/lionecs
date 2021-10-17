import type { ComponentBase, ComponentState, InternalLionecs } from '../types';

export function createMethodsDefiner<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	return function defineMethods<M>(
		methods: M & ThisType<InternalLionecs<C, S>>
	) {
		return methods as unknown as M & ThisType<InternalLionecs<C, S>>;
	};
}
