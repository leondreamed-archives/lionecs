import type { ComponentKey, ComponentMap } from '~/types/component';
import { useDefineMethods } from '~/utils/methods';

export function selectModule<C extends ComponentMap>() {
	const defineMethods = useDefineMethods<C>();

	type SelectProps<KS extends ComponentKey<C>[]> = {
		components: KS;
	};

	return defineMethods({
		select<KS extends ComponentKey<C>[]>({ components }: SelectProps<KS>) {
			let minComponentLen = 0;
			let minComponentIndex = 0;

			// Find the component with the lowest number of entries
			for (const [i, component] of components.entries()) {
				const len = Object.keys(this.state.components[component]).length;
				if (len < minComponentLen) {
					minComponentLen = len;
					minComponentIndex = i;
				}
			}

			// Loop through every entity, and check if they exist in the other components
		},
	});
}
