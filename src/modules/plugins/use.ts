import type { ComponentMap } from '~/types/component';
import type { Lionecs } from '~/types/lionecs';
import type { LionecsPlugin } from '~/types/plugins';
import type { LionecsExtras } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

export function usePluginModule<C extends ComponentMap>() {
	const defineMethods = useDefineMethods<C>();

	return defineMethods({
		use: function <X extends LionecsExtras, A extends LionecsExtras>(
			this: Lionecs<C, X>,
			plugin: LionecsPlugin<C, A>
		): Lionecs<C, A> {
			return plugin(this as any);
		},
	});
}
