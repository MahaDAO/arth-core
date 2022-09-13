import { useContext } from "react";

import { ARTHStore } from "@mahadao/arth-base";

import { ARTHStoreContext } from "../components/ARTHStoreProvider";

export const useARTHStore = <T>(): ARTHStore<T> => {
  const store = useContext(ARTHStoreContext);

  if (!store) {
    throw new Error("You must provide a ARTHStore via ARTHStoreProvider");
  }

  return store as ARTHStore<T>;
};
