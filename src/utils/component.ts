import type {
	Component,
	ComponentDefinition,
	ComponentMap,
} from '~/types/component.js';

export function isComponent<N extends string, T>(
	component: any
): component is Component<ComponentMap, N, T> {
	return (
		component !== null && typeof component === 'object' && '__key' in component
	);
}

export function defComponent<T>() {
	return {
		name<K extends string>(key: K): ComponentDefinition<K, T> {
			return { __key: key };
		},
	};
}

/**
 * A tag is a component with the type as "true"
 */
export function defTag() {
	return {
		name<K extends string>(key: K): ComponentDefinition<K, true> {
			return { __key: key };
		},
	};
}

export type ComponentMapFromDefs<ComponentDefs> = {
	[ComponentDef in keyof ComponentDefs]: ComponentDefs[ComponentDef] extends ComponentDefinition<
		infer Key,
		infer Type
	>
		? Component<ComponentMapFromDefs<ComponentDefs>, Key, Type>
		: never;
};

export function defsToComponents<
	ComponentDefs extends Record<string, ComponentDefinition<string, unknown>>
>(defs: ComponentDefs): ComponentMapFromDefs<ComponentDefs> {
	return defs as any;
}
