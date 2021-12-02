export interface Component<_N extends string, _T extends unknown> {}

export type ComponentMap = Record<string, Component<string, unknown>>;

export type ComponentKey<C extends ComponentMap> = keyof C;

export type ComponentType<C extends Component<string, unknown>> =
	C extends Component<infer _N, infer T> ? T : unknown;

export type ComponentName<C extends Component<string, unknown>> =
	C extends Component<infer N, infer _T> ? N : string;
