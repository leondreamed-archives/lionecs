import { InternalLionecs } from '~/types/lionecs';
import type {
	ComponentBase,
	ComponentKey,
	ComponentState,
} from '~/types/state';

export function selectModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	type SelectProps<KS extends ComponentKey<C>[]> = {
		components: KS;
	};
	function select<KS extends ComponentKey<C>[]>(
		this: InternalLionecs<C, S>,
		{ components }: SelectProps<KS>
	) {
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
	}

	return {
		select,
	};
}
