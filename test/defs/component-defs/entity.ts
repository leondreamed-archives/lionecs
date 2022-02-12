import { defComponent } from '~/exports.js';

export const name = defComponent<string>().name('name');
export const health = defComponent<number>().name('health');
export const damage = defComponent<number>().name('damage');
