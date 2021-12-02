export interface Component<K extends string, _T extends unknown> {
	__key: K;
}

export type ComponentFromKey<
	C extends ComponentMap,
	K extends ComponentKey<C> | string
> = K extends ComponentKey<C>
	? K extends string
		? Component<K, TypeOfComponent<C[K]>>
		: never
	: K extends string
	? Component<K, unknown>
	: never;

export type ComponentMap = Record<string, Component<string, unknown>>;

export type ComponentKey<C extends ComponentMap> = keyof C;

export type TypeOfComponent<C extends Component<string, unknown>> =
	C extends Component<infer _K, infer T> ? Readonly<T> : unknown;

export type KeyOfComponent<C extends Component<string, unknown>> =
	C extends Component<infer K, infer _T> ? Readonly<K> : string;
