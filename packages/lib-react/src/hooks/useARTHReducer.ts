import { useCallback, useEffect, useReducer, useRef } from "react";

import { ARTHStoreState } from "@mahadao/arth-base";

import { equals } from "../utils/equals";
import { useARTHStore } from "./useARTHStore";

export type ARTHStoreUpdate<T = unknown> = {
  type: "updateStore";
  newState: ARTHStoreState<T>;
  oldState: ARTHStoreState<T>;
  stateChange: Partial<ARTHStoreState<T>>;
};

export const useARTHReducer = <S, A, T>(
  reduce: (state: S, action: A | ARTHStoreUpdate<T>) => S,
  init: (storeState: ARTHStoreState<T>) => S
): [S, (action: A | ARTHStoreUpdate<T>) => void] => {
  const store = useARTHStore<T>();
  const oldStore = useRef(store);
  const state = useRef(init(store.state));
  const [, rerender] = useReducer(() => ({}), {});

  const dispatch = useCallback(
    (action: A | ARTHStoreUpdate<T>) => {
      const newState = reduce(state.current, action);

      if (!equals(newState, state.current)) {
        state.current = newState;
        rerender();
      }
    },
    [reduce]
  );

  useEffect(
    () => store.subscribe(params => dispatch({ type: "updateStore", ...params })),
    [store, dispatch]
  );

  if (oldStore.current !== store) {
    state.current = init(store.state);
    oldStore.current = store;
  }

  return [state.current, dispatch];
};
