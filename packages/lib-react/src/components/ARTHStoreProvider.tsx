import { ARTHStore } from "@mahadao/arth-base";
import React, { createContext, useEffect, useState } from "react";

export const ARTHStoreContext = createContext<ARTHStore | undefined>(undefined);

type ARTHStoreProviderProps = {
  store: ARTHStore;
  loader?: React.ReactNode;
};

export const ARTHStoreProvider: React.FC<ARTHStoreProviderProps> = ({
  store,
  loader,
  children
}) => {
  const [loadedStore, setLoadedStore] = useState<ARTHStore>();

  useEffect(() => {
    store.onLoaded = () => setLoadedStore(store);
    const stop = store.start();

    return () => {
      store.onLoaded = undefined;
      setLoadedStore(undefined);
      stop();
    };
  }, [store]);

  if (!loadedStore) {
    return <>{loader}</>;
  }

  return <ARTHStoreContext.Provider value={loadedStore}>{children}</ARTHStoreContext.Provider>;
};
