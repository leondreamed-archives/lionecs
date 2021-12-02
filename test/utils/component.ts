import { defComponent } from '~/create-lionecs';

import type { ActionType } from '~/types/action';

import type { ActionEntity } from '../entities/action';
import type { ElementEntity } from '../entities/dom';

export const actionBase = defComponent<{
	id: string;
	isActive: boolean;
	type: ActionType;
}>().setName('actionBase');
export type ActionBase = typeof actionBase;

export const actions = defComponent<ActionEntity[]>().setName('actions');
export type Actions = typeof actions;

export const actionPathElement = defComponent<
	ElementEntity<SVGPathElement> | undefined
>().setName('actionPathElement');
export type ActionPathElement = typeof actionPathElement;

export const color = defComponent<string>().setName('color');
export type Color = typeof color;

export const pattern = defComponent<string>().setName('pattern');
export type Pattern = typeof color;

export const path = defComponent<string>().setName('path');
export type Path = typeof path;
