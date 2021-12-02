import type { Component } from '~/types/component';

export function isComponent<N extends string, T>(
	component: any
): component is Component<N, T> {
	return (
		component !== null && typeof component === 'object' && '__key' in component
	);
}

export function defComponent<T>() {
	return {
		setName: function <K extends string>(key: K): Component<K, T> {
			return { __key: key };
		},
	};
}
