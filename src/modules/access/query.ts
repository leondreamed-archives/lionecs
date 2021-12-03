import type { ComponentFromKey, ComponentKey, ComponentMap } from '~/types/component';
import { useDefineMethods } from '~/utils/methods';

type Query<M extends ComponentMap> = {

}

export function queryModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		/**
		 * Creates a query that matches entities based on their components. The
		 * query is lazy and only iterates through the components when another function
		 * is activated with the query.
		 */
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
