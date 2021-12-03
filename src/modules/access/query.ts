import type {
	ComponentFromKey,
	ComponentKey,
	ComponentMap,
} from '~/types/component';
import { useDefineMethods } from '~/utils/methods';

type ComponentKeyOrComponent<
	M extends ComponentMap,
	KS extends ComponentKey<M>[]
> = {
	// Can either be an array of component keys or an array
	// of components
	[K in keyof KS]: KS[K] | (K extends number ? ComponentFromKey<M, KS[K]> : never)
};

type Query<M extends ComponentMap, KS extends ComponentKey<M>[]> = {
	components: ComponentKeyOrComponent<M, KS>;
};

export function queryModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();
	return defineMethods({
		/**
		 * Creates a query that matches entities based on their components. The
		 * query is lazy and only iterates through the components when another function
		 * is activated with the query.
		 */
		createQuery: function <KS extends ComponentKey<M>[]>(query: Query<M, KS>) {
			const componentKeys = query.components.map((c) =>
				this.getComponentKey(c)
			);

			return {
				componentKeys,
			};
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
