import { nanoid } from 'nanoid';

import type { Lionecs } from '~/types/lionecs';
import type { ComponentBase, ComponentState } from '~/types/state';

import type { ElementExtras, ElementProperty } from '../types';

export function createElementModule<
	C extends ComponentBase,
	S extends ComponentState<C>
>() {
	type CreateElementPropertyProps = {
		tag: string;
		namespace?: string;
		creationOptions?: ElementCreationOptions;
	};

	function createElementProperty(
		this: Lionecs<C, S, ElementExtras<C, S>>,
		{ tag, namespace, creationOptions }: CreateElementPropertyProps
	): ElementProperty {
		let element: Element;
		if (namespace !== undefined) {
			element = document.createElementNS(namespace, tag, creationOptions);
		} else {
			element = document.createElement(tag, creationOptions);
		}

		const elementId = nanoid() as ElementProperty;
		element.setAttribute('id', elementId);
		elementId.__elementId = true;

		this.elements.set(elementId, element);
		return elementId;
	}
	return { createElementProperty };
}
