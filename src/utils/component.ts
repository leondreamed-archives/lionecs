import type { Component } from '~/types/component.js';

export function isComponent<N extends string, T>(
	component: any
): component is Component<N, T> {
	return (
		component !== null && typeof component === 'object' && '__key' in component
	);
}

export function defComponent<T>() {
	return {
		setName<K extends string>(key: K): Component<K, T> {
			return { __key: key };
		},
	};
}

/**
 * A tag is a component with the type as "true"
 */
export function defTag() {
	return {
		setName<K extends string>(key: K): Component<K, true> {
			return { __key: key };
		},
	};
}
