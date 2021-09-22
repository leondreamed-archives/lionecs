import { Entity, TypedEntity } from "~/types/entity";
import { Lionecs } from "~/types/lionecs";
import {
  ComponentBase,
  ComponentKey,
  ComponentState,
  LionecsState,
} from "~/types/state";

type GetOptions = {
  optional?: boolean;
};

// get(state, entity, component, options)
export function get<
  C extends ComponentBase,
  S extends ComponentState<C>,
  E extends Entity,
  K extends E extends TypedEntity<infer Req, infer Opt>
    ?
        | TypedEntity<Req, Opt>["__requiredComponents"]
        | TypedEntity<Req, Opt>["__optionalComponents"]
    : ComponentKey<C>,
  O extends E extends TypedEntity<infer Req, infer Opt>
    ? C extends TypedEntity<Req, Opt>["__optionalComponents"]
      ? { optional: true }
      : { optional: false }
    : GetOptions
>(
  state: LionecsState<C, S>,
  entity: E,
  component: K,
  options?: O
): O extends GetOptions
  ? O["optional"] extends true
    ? S[K] | undefined
    : S[K]
  : S[K] | undefined;

// get(entity, component, options)
export function get<
  C extends ComponentBase,
  S extends ComponentState<C>,
  E extends Entity,
  K extends E extends TypedEntity<infer Req, infer Opt>
    ?
        | TypedEntity<Req, Opt>["__requiredComponents"]
        | TypedEntity<Req, Opt>["__optionalComponents"]
    : ComponentKey<C>,
  O extends E extends TypedEntity<infer Req, infer Opt>
    ? C extends TypedEntity<Req, Opt>["__optionalComponents"]
      ? { optional: true }
      : { optional: false }
    : GetOptions
>(
  entity: E,
  component: K,
  options?: O
): O extends GetOptions
  ? O["optional"] extends true
    ? S[K] | undefined
    : S[K]
  : S[K] | undefined;

export function get<
  C extends ComponentBase,
  S extends ComponentState<C>,
  K extends ComponentKey<C>
>(this: Lionecs<C, S>, ...args: unknown[]): S[K] {
  // get(entity, component, options)
  if (typeof args[0] === "string") {
    const [entity, component, options] = args as [
      Entity,
      K,
      GetOptions | undefined
    ];
    const optional = options?.optional ?? true;

    const componentState = this.state.components[component][entity];

    if (!optional && componentState === undefined) {
      throw new Error(
        `State not found for component ${component} on entity ${entity}.`
      );
    }

    return componentState as S[K];
  }
  // get(state, entity, component, options)
  else {
    const [state, entity, component, options] = args as [
      LionecsState<C, S>,
      Entity,
      K,
      GetOptions | undefined
    ];
    const optional = options?.optional ?? true;

    const componentState = state.components[component][entity];
    if (!optional && componentState === undefined) {
      throw new Error(
        `State not found for component ${component} on entity ${entity}.`
      );
    }

    return componentState as S[K];
  }
}

export function getOpt<
  C extends ComponentBase,
  S extends ComponentState<C>,
  K extends ComponentKey<C>
>(state: LionecsState<C, S>, entity: Entity, component: K): S[K] | undefined;

export function getOpt<
  C extends ComponentBase,
  S extends ComponentState<C>,
  K extends ComponentKey<C>
>(entity: Entity, component: K): S[K] | undefined;

export function getOpt<
  C extends ComponentBase,
  S extends ComponentState<C>,
  K extends ComponentKey<C>
>(this: Lionecs<C, S>, ...args: unknown[]): S[K] | undefined {
  // getOpt(state, entity, component)
  if (args.length === 3) {
    const [state, entity, component] = args as [LionecsState<C, S>, Entity, K];
    return state.components[component][entity] as S[K];
  } else {
    const [entity, component] = args as [Entity, K];
    return this.state.components[component][entity] as S[K];
  }
}
