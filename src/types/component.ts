// By containing the ComponentMap inside this component type, we can remove the boilerplate
// of re-passing the ComponentMap every time we need to reference a component
export interface Component<_M extends ComponentMap, Key extends string, _Type> {
	__key: Key;
}

export interface ComponentDefinition<Key extends string, _Type> {
	__key: Key;
}

export type ComponentFromKey<
	M extends ComponentMap,
	K extends ComponentKey<M>
> = Component<M, K, TypeOfComponent<M[K]>>;

export type ComponentMap = Record<
	string,
	Component<ComponentMap, string, unknown>
>;

export type ComponentKey<M extends ComponentMap> = keyof M & string;

export type TypeOfComponent<
	C extends Component<ComponentMap, string, unknown>
> = C extends Component<infer _M, infer _K, infer T> ? T : unknown;

export type KeyOfComponent<C extends Component<ComponentMap, string, unknown>> =
	C extends Component<infer _M, infer K, infer _T> ? K : string;
