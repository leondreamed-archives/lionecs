import type { ComponentMap } from '~/types/component';

import type { InternalLionecs, LionecsExtras } from '../types';

export function useDefineMethods<
	M extends ComponentMap,
	X extends LionecsExtras = LionecsExtras
>() {
	return function defineMethods<F>(
		methods: F & ThisType<InternalLionecs<M, X> & X>
	) {
		// Removing the `this` type from the function
		return methods as unknown as F;
	};
}
