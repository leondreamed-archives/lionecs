import type {
	ComponentBase,
	ComponentState,
	InternalLionecs,
	LionecsExtras,
} from '../types';

export function useDefineMethods<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras = LionecsExtras
>() {
	return function defineMethods<M>(
		methods: M & ThisType<InternalLionecs<C, S, X> & X>
	) {
		// Removing the `this` type from the function
		return methods as unknown as M;
	};
}
