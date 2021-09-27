import type { Lionecs } from '~/types/lionecs';
import type { ComponentBase, ComponentState } from '~/types/state';

type ElementId = string & {
	__elementId: true;
};

export interface Lionecs<
	C extends ComponentBase,
	S extends ComponentState<C>,
	X extends Record<string, unknown> = Record<string, unknown>
> extends ElementMethods<C, S> {
	elements: Set<Element>;
}

export function elementPlugin<
	C extends ComponentBase,
	S extends ComponentState<C>
>(ecs: Lionecs<C, S>) {
	ecs.createElement;
}
