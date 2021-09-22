import { nanoid } from "nanoid";
import { Entity, EntityMap, TypedEntity } from "~/types/entity";
import { Lionecs } from "~/types/lionecs";
import { ComponentBase, ComponentKey, ComponentState } from "~/types/state";

export function getEntityMap<
  C extends ComponentBase,
  S extends ComponentState<C>,
  K extends ComponentKey<C>
>(this: Lionecs<C, S>, componentKey: K): EntityMap<C, S, K> {
  return this.state.components[componentKey];
}

type CreateEntityComponentsProp<
  C extends ComponentBase,
  S extends ComponentState<C>,
  E extends Entity
> = E extends TypedEntity<C, infer Req, infer Opt>
  ? { [K in Req]: S[K] } & (Opt extends ComponentKey<C>
      ? { [K in Opt]: S[K] }
      : Record<string, never>)
  : { [K in ComponentKey<C>]?: S[K] };

type CreateEntityProps<
  C extends ComponentBase,
  S extends ComponentState<C>,
  E extends Entity
> = {
  components: CreateEntityComponentsProp<C, S, E>;
};

export function createEntity<
  C extends ComponentBase,
  S extends ComponentState<C>,
  E extends Entity
>(this: Lionecs<C, S>, props?: CreateEntityProps<C, S, E>): Entity {
  const entity = nanoid();

  if (props !== undefined) {
    this.update(() => {
      for (const [componentName, componentValue] of Object.entries(
        props.components
      )) {
        this.set(entity, componentName as ComponentKey<C>, componentValue);
      }
    });
  }

  return entity;
}

export function cloneEntity<
  C extends ComponentBase,
  S extends ComponentState<C>,
  E extends Entity
>(this: Lionecs<C, S>, entityToClone: E): E {
  const entity = this.createEntity() as E;

  this.update(() => {
    for (const componentString of Object.keys(this.state.components)) {
      const component = componentString as ComponentKey<C>;
      const componentState = this.getOpt(
        entityToClone,
        component as keyof ComponentBase
      );
      if (componentState !== undefined) {
        this.set(entity, component, componentState);
      }
    }
  });

  return entity;
}
