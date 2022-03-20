import * as componentDefinitions from './component-defs/index.js';
import { defsToComponents } from '~/utils/component.js';

export const Component = defsToComponents(componentDefinitions);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Component = typeof Component;
