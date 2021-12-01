export interface Component<N extends string, _T extends unknown> {
	name: N;
}

export type ComponentType<C extends Component<string, unknown>> =
	C extends Component<infer _N, infer T> ? T : never;
