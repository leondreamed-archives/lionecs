import { defsToComponents } from '~/utils/component.js';
import * as componentDefinitions from './component-defs/index.js';

export const Component = defsToComponents(componentDefinitions);
export type Component = typeof Component;
