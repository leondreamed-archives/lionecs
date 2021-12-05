import { createLionecs } from '~/index';

import * as componentsMap from '../defs/component';

export const ecs = createLionecs({
	components: componentsMap,
});
