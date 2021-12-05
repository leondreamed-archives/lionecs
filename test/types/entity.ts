import type { Component, ComponentMap, KeyOfComponent } from '~/index';
import type { BaseDefineTypedEntity, BaseTypedEntity } from '~/types';

import type { TComponentMap } from './component';

export type DefineTypedEntity<
	R extends Component<string, unknown>,
	O extends Component<string, unknown> = Component<'__empty', never>
> = BaseDefineTypedEntity<TComponentMap, R, O>;

export type TypedEntity<
	R extends Component<string, unknown>,
	O extends Component<string, unknown> = Component<'__empty', never>
> = BaseTypedEntity<ComponentMap, KeyOfComponent<R>, KeyOfComponent<O>>;
