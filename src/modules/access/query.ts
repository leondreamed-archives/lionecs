import type { ComponentFromKey, ComponentKey, ComponentMap } from '~/types/component';
import { useDefineMethods } from '~/utils/methods';

export function queryModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		createQuery: function <KS extends ComponentKey<M>[]>(
			components: KS | { [K in KS[number]]: ComponentFromKey<M, K> }
		) {
			/*
			let minComponentLen = 0;
			let minComponentIndex = 0;

			// Find the component with the lowest number of entries
			for (const [i, component] of keys.entries()) {
				const len = Object.keys(this.state.components[component]).length;
				if (len < minComponentLen) {
					minComponentLen = len;
					minComponentIndex = i;
				}
			}
			*/
		},
	});
}
