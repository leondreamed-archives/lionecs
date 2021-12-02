import type { ComponentKey, ComponentMap } from '~/types/component';
import { useDefineMethods } from '~/utils/methods';

export function selectModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	type SelectProps<KS extends ComponentKey<M>[]> = {
		components: KS;
	};

	return defineMethods({
		select<KS extends ComponentKey<M>[]>({ components }: SelectProps<KS>) {
			// Loop through every entity, and check if they exist in the other components
		},
	});
}
