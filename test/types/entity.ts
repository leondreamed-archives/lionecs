import type { Component } from '~/index';
import type { BaseDefineTypedEntity } from '~/types';

import type { TComponentMap } from './component';

export type DefineTypedEntity<
	R extends Component<string, unknown>,
	O extends Component<string, unknown> = Component<'__empty', never>
> = BaseDefineTypedEntity<TComponentMap, R, O>;
