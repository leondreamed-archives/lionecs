import type { Lionecs } from '~/types/lionecs';
import type { LionecsPlugin } from '~/types/plugins';
import type {
	ComponentBase,
	ComponentState,
	LionecsExtras,
} from '~/types/state';

export function usePluginModule<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends LionecsExtras
>() {
	function use<A extends LionecsExtras>(
		this: Lionecs<C, S, X>,
		plugin: LionecsPlugin<C, S, X, A>
	) {
		return plugin(this);
	}

	return { use };
}
