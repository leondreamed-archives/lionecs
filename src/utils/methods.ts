import type { InternalLionecs, LionecsExtras } from '../types/index.js';
import type { ComponentMap } from '~/types/component.js';

export function useDefineMethods<
	M extends ComponentMap,
	X extends LionecsExtras = LionecsExtras
>() {
	// eslint-disable-next-line func-names
	return function defineMethods<F>(
		methods: F & ThisType<InternalLionecs<M, X> & X>
	) {
		// Removing the `this` type from the function
		return methods as unknown as F;
	};
}
