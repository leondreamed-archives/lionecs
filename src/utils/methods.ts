import type {
	ComponentBase,
	ComponentState,
	InternalLionecs,
	LionecsExtras,
} from '../types';

export function createMethodsDefiner<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras = LionecsExtras
>() {
	return function defineMethods<M>(
		methods: M & ThisType<InternalLionecs<C, S, X> & X>
	) {
		return methods as unknown as M & ThisType<InternalLionecs<C, S, X> & X>;
	};
}
