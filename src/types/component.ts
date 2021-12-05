export interface Component<K extends string, _T> {
	__key: K;
}

export type ComponentFromKey<
	M extends ComponentMap,
	K extends ComponentKey<M>
> = Component<K, TypeOfComponent<M[K]>>;

export type ComponentMap = Record<string, Component<string, unknown>>;

export type ComponentKey<M extends ComponentMap> = keyof M & string;

export type TypeOfComponent<C extends Component<string, unknown>> =
	C extends Component<infer _K, infer T> ? T : unknown;

export type KeyOfComponent<C extends Component<string, unknown>> =
	C extends Component<infer K, infer _T> ? K : string;
