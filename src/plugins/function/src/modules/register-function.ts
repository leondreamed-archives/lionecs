import type { ComponentMap } from '~/types';
import { useDefineMethods } from '~/utils/methods';

export function registerFunctionModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	const { registerFunction } = defineMethods({
		registerFunction() {
			// eslint-disable-next-line no-warning-comments
			// TODO
			throw new Error('not implemented');
		},
	});

	return {
		registerFunction,
	};
}
