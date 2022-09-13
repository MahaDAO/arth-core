import { useEffect, useReducer } from "react";

import { ARTHStoreState } from "@mahadao/arth-base";

import { equals } from "../utils/equals";
import { useARTHStore } from "./useARTHStore";

export const useARTHSelector = <S, T>(select: (state: ARTHStoreState<T>) => S): S => {
  const store = useARTHStore<T>();
  const [, rerender] = useReducer(() => ({}), {});

  useEffect(
    () =>
      store.subscribe(({ newState, oldState }) => {
        if (!equals(select(newState), select(oldState))) {
          rerender();
        }
      }),
    [store, select]
  );

  return select(store.state);
};
