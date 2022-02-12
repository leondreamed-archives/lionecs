import type { ComponentMap } from '~/types/component.js';
import type { Lionecs } from '~/types/lionecs.js';
import type { LionecsPlugin } from '~/types/plugins.js';
import type { LionecsExtras } from '~/types/state.js';
import { useDefineMethods } from '~/utils/methods.js';

export function usePluginModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		use<X extends LionecsExtras, A extends LionecsExtras>(
			this: Lionecs<M, X>,
			plugin: LionecsPlugin<M, A>
		): Lionecs<M, A> {
			return plugin(this as any);
		},
	});
}
