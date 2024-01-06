import React, { createContext, useReducer, useContext, useEffect } from 'react';

enum ActionTypes {
  INSTALL_PLUGIN = 'INSTALL_PLUGIN',
  UNINSTALL_PLUGIN = 'UNINSTALL_PLUGIN',
}

type Plugin = {
  id: number;
  name: string;
  selectorName: string;
  value: any;
  icon?: string;
  description?: string;
  categories: string[];
  isInstalled: boolean;
  isPremium: boolean;
};

const initialState = {
  installedPlugins: [] as Plugin[],
};

const PluginContext = createContext<{
  state: typeof initialState;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null,
});

const pluginReducer = (
  state: { installedPlugins: any[] },
  action: { type: any; payload: { id: any } },
) => {
  switch (action.type) {
    case ActionTypes.INSTALL_PLUGIN:
      if (!state.installedPlugins.some((p) => p.id === action.payload.id)) {
        const updatedPlugins = [...state.installedPlugins, action.payload];
        localStorage.setItem(
          'installedPlugins',
          JSON.stringify(updatedPlugins),
        );
        return { ...state, installedPlugins: updatedPlugins };
      }
      return state;
    case ActionTypes.UNINSTALL_PLUGIN:
      const updatedPlugins = state.installedPlugins.filter(
        (p) => p.id !== action.payload,
      );
      localStorage.setItem('installedPlugins', JSON.stringify(updatedPlugins));
      return { ...state, installedPlugins: updatedPlugins };
    default:
      return state;
  }
};

export const PluginProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(pluginReducer, initialState);

  useEffect(() => {
    const localData = localStorage.getItem('installedPlugins');
    let installedPlugins = localData ? JSON.parse(localData) : [];

    // Check if Subfinder is already installed
    const subfinderPlugin = {
      id: 2,
      name: 'Subfinder',
      value: 'subfinder',
      isInstalled: true,
      isPremium: false,
    };

    const isSubfinderInstalled = installedPlugins.some(
      (plugin: Plugin) => plugin.id === subfinderPlugin.id,
    );

    if (!isSubfinderInstalled) {
      // If Subfinder is not installed, add it to the installed plugins
      installedPlugins.push(subfinderPlugin);
      localStorage.setItem(
        'installedPlugins',
        JSON.stringify(installedPlugins),
      );
    }

    // Dispatch an action to update the state with the installed plugins
    installedPlugins.forEach((plugin: Plugin) => {
      dispatch({ type: ActionTypes.INSTALL_PLUGIN, payload: plugin });
    });
  }, []);

  return (
    <PluginContext.Provider value={{ state, dispatch }}>
      {children}
    </PluginContext.Provider>
  );
};

export const usePluginContext = () => useContext(PluginContext);
