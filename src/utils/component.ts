import type { Component } from '~/types/component';

export function isComponent<N extends string, T>(
	component: any
): component is Component<N, T> {
	return (
		component !== null && typeof component === 'object' && '__name' in component
	);
}