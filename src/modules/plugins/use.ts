import type { Lionecs } from '~/types/lionecs';
import type { LionecsPlugin } from '~/types/plugins';
import type {
	ComponentBase,
	ComponentState,
	LionecsExtras,
} from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function usePluginModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<C, S>();

	return defineMethods({
		use: function <X extends LionecsExtras, A extends LionecsExtras>(
			this: Lionecs<C, S, X>,
			plugin: LionecsPlugin<C, S, A>
		): Lionecs<C, S, A> {
			return plugin(this as any);
		},
	});
}
