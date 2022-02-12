import type { Component, ComponentMap, KeyOfComponent } from '~/exports.js';
import type { BaseDefineTypedEntity, BaseTypedEntity } from '~/types/index.js';

import type { TComponentMap } from './component.js';

export type DefineTypedEntity<
	R extends Component<string, unknown>,
	O extends Component<string, unknown> | never = never
> = BaseDefineTypedEntity<TComponentMap, R, O>;

export type TypedEntity<
	R extends Component<string, unknown>,
	O extends Component<string, unknown> | never = never
> = BaseTypedEntity<ComponentMap, KeyOfComponent<R>, KeyOfComponent<O>>;
