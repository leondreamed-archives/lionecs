import { nanoid } from 'nanoid';

import type { ComponentMap } from '~/types/index.js';
import { useDefineMethods } from '~/utils/methods';

import type {
	CreateElementPropertyProps,
	ElementProperty,
	InternalElementPluginExtras,
} from '../types';

export function createElementModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M, InternalElementPluginExtras<M>>();

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
