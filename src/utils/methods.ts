import type { ComponentMap } from '~/types/component';

import type { InternalLionecs, LionecsExtras } from '../types';

export function useDefineMethods<
	C extends ComponentMap,
	X extends LionecsExtras = LionecsExtras
>() {
	return function defineMethods<M>(
		methods: M & ThisType<InternalLionecs<C, X> & X>
	) {
		// Removing the `this` type from the function
		return methods as unknown as M;
	};
}
