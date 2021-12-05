import type { Component, ComponentMap, KeyOfComponent } from '~/index';
import type { BaseDefineTypedEntity, BaseTypedEntity } from '~/types';

import type { TComponentMap } from './component';

export type DefineTypedEntity<
	R extends Component<string, unknown>,
	O extends Component<string, unknown> | undefined = undefined
> = BaseDefineTypedEntity<TComponentMap, R, O>;

export type TypedEntity<
	R extends Component<string, unknown>,
	O extends Component<string, unknown> | undefined = undefined
> = BaseTypedEntity<
	ComponentMap,
	KeyOfComponent<R>,
	O extends Component<string, unknown> ? KeyOfComponent<O> : undefined
>;
