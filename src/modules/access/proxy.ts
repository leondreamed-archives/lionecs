import type { Entity } from '~/types/index.js';
import type { ComponentKey, ComponentMap } from '~/types/component.js';
import type { EntityProxy } from '~/types/proxy.js';
import { useDefineMethods } from '~/utils/methods.js';

export function proxyModule<M extends ComponentMap>() {
	const defineMethods = useDefineMethods<M>();

	return defineMethods({
		/**
		 * `p(entity)[component]` is equivalent to `ecs.get(entity, component)`
		 * `p(entity)[component] = value` is equivalent to `ecs.set(entity, component, value)`
		 * `p(entity)[component].key = value` is equivalent to `ecs.update(entity, component, (oldState) => {
		 *    oldState.key = value;
		 *  })`
		 */
		useProxy() {
			return <E extends Entity>(entity: E): EntityProxy<M, E> =>
				new Proxy(
					{},
					{
						get: (_target, key) => {
							const componentKey = key as ComponentKey<M>;
							const componentValue = this.getOpt(entity, componentKey);
							// If the underlying data structure is an object and not an entity, return a proxy
							if (
								typeof componentValue === 'object' &&
								componentValue !== null &&
								!('__key' in componentValue)
							) {
								const proxyHandler: ProxyHandler<
									Record<string, unknown> & { __keyArray: string[] }
								> = {
									get: (target, key) => {
										const innerComponentValue = target[key as string];
										// If the inner data structure is yet another object (and not an entity), return another proxy wrapping
										// the inner object
										if (
											innerComponentValue !== null &&
											typeof innerComponentValue === 'object' &&
											!('__key' in innerComponentValue)
										) {
											return new Proxy(
												{
													...innerComponentValue,
													__keyArray: [...target.__keyArray, key],
												},
												proxyHandler
											);
										} else {
											return innerComponentValue;
										}
									},
									set: (target, key, value) => {
										this.update(entity, componentKey, (oldComponentState) => {
											let objectToUpdate = oldComponentState as Record<
												string,
												any
											>;
											for (const objKey of target.__keyArray) {
												// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
												objectToUpdate = objectToUpdate[objKey];
											}

											// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
											objectToUpdate[key as string] = value;

											return oldComponentState;
										});
										return true;
									},
								};

								return new Proxy(
									{
										...(componentValue as Record<string, unknown>),
										__keyArray: [],
									},
									proxyHandler
								);
							} else {
								return componentValue;
							}
						},
						set: (_target, key, value) => {
							const component = key as ComponentKey<M>;
							this.set(entity, component, value);
							return true;
						},
					}
				) as EntityProxy<M, E>;
		},
	});
}
