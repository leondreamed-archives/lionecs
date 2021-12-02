import type { ComponentMap } from '~/types/component';
import type { Lionecs } from '~/types/lionecs';
import type { LionecsPlugin } from '~/types/plugins';
import type { LionecsExtras } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function usePluginModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		use: function <X extends LionecsExtras, A extends LionecsExtras>(
			this: Lionecs<M, X>,
			plugin: LionecsPlugin<M, A>
		): Lionecs<M, A> {
			return plugin(this as any);
		},
	});
}
