import { nanoid } from 'nanoid';

import type { ComponentBase, ComponentState } from '~/types/state';
import { useDefineMethods } from '~/utils/methods';

import type {
	CreateElementPropertyProps,
	ElementProperty,
	InternalElementPluginExtras,
} from '../types';

export function createElementModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	const defineMethods = useDefineMethods<
		C,
		S,
		InternalElementPluginExtras<C, S>
	>();

	return defineMethods({
		createElementProperty({
			tag,
			namespace,
			creationOptions,
		}: CreateElementPropertyProps): ElementProperty {
			let element: Element;
			if (namespace !== undefined) {
				element = document.createElementNS(namespace, tag, creationOptions);
			} else {
				element = document.createElement(tag, creationOptions);
			}

			const elementId = nanoid();
			const elementProperty = { elementId };
			if (this.element._options.setIdAttribute) {
				element.setAttribute('id', elementId);
			}

			this.element.elements.set(elementId, element);
			return elementProperty;
		},
	});
}
