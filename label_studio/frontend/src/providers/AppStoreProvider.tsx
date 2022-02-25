import React from 'react';

type Store = {
  project: unknown,   // 这里存放的就是 GET:api/projects/projectId 获取的项目信息
}
type Context = {
  store: Store,
  update: (data: Partial<Store>) => void,
}

const AppStoreContext = React.createContext<Context>({} as Context);
AppStoreContext.displayName = 'AppStoreContext';

export const AppStoreProvider: React.FunctionComponent = ({children}) => {
  const [store, setStore] = React.useState({} as Store);

  const update = React.useCallback((newData: Partial<Store>) => {
    setStore({...store, ...(newData ?? {})});
  }, [store]);

  const contextValue = React.useMemo(() => ({
    store,
    update,
  }), [store, update]);

  return (
    <AppStoreContext.Provider value={contextValue}>
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = () => {
  return React.useContext(AppStoreContext);
};
