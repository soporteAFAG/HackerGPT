import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ToolID } from '@/types/tool';
import { OpenAIModelID } from '@/types/openai';
import { usePremiumStatusContext } from '@/hooks/PremiumStatusContext';

import HomeContext from '@/pages/api/home/home.context';

import PluginStoreModal from './PluginStore';
import { usePluginContext } from '@/hooks/PluginProvider';

import { Plugin } from '@/types/plugin';

export const availablePlugins: Plugin[] = [
  {
    id: 0,
    name: 'None',
    selectorName: 'None',
    value: 'none',
    categories: ['Uncategorized'],
    isInstalled: false,
    isPremium: false,
  },
  {
    id: 1,
    name: 'Nuclei',
    selectorName: 'Nuclei: Discover Vulnerabilities',
    value: ToolID.NUCLEI,
    icon: 'https://avatars.githubusercontent.com/u/50994705',
    description: 'Fast and customisable vulnerability scanner',
    categories: ['New', 'Popular'],
    githubRepoUrl: 'https://github.com/projectdiscovery/nuclei',
    isInstalled: false,
    isPremium: true,
  },
  {
    id: 2,
    name: 'Subfinder',
    selectorName: 'Subfinder: Discover Subdomains',
    value: ToolID.SUBFINDER,
    icon: 'https://avatars.githubusercontent.com/u/50994705',
    description:
      'A robust discovery tool for passive enumeration on valid subdomains',
    categories: ['Free', 'Popular'],
    githubRepoUrl: 'https://github.com/projectdiscovery/subfinder',
    isInstalled: false,
    isPremium: false,
  },
  {
    id: 3,
    name: 'Katana',
    selectorName: 'Katana: Crawl Websites',
    value: ToolID.KATANA,
    icon: 'https://avatars.githubusercontent.com/u/50994705',
    description:
      'A web crawling framework designed to navigate and parse for hidden details',
    categories: ['New', 'Popular'],
    githubRepoUrl: 'https://github.com/projectdiscovery/katana',
    isInstalled: false,
    isPremium: true,
  },
  {
    id: 4,
    name: 'HttpX',
    selectorName: 'HttpX: Web Analysis',
    value: ToolID.HTTPX,
    icon: 'https://avatars.githubusercontent.com/u/50994705',
    description:
      'An HTTP toolkit that probes services, web servers, and other valuable metadata',
    categories: ['New', 'Popular'],
    githubRepoUrl: 'https://github.com/projectdiscovery/httpx',
    isInstalled: false,
    isPremium: true,
  },
  {
    id: 5,
    name: 'Naabu',
    selectorName: 'Naabu: Discover Ports',
    value: ToolID.NAABU,
    icon: 'https://avatars.githubusercontent.com/u/50994705',
    description:
      'A fast port scanner designed to scan large networks at high speed',
    categories: ['New', 'Popular'],
    githubRepoUrl: 'https://github.com/projectdiscovery/naabu',
    isInstalled: false,
    isPremium: true,
  },
  {
    id: 6,
    name: 'GAU',
    selectorName: 'GAU: Url Enumeration',
    value: ToolID.GAU,
    icon: 'https://avatars.githubusercontent.com/u/19563282',
    description:
      "Fetches known URLs from AlienVault's Open Threat Exchange, the Wayback Machine, Common Crawl, and URLScan.",
    categories: ['Free'],
    githubRepoUrl: 'https://github.com/lc/gau',
    isInstalled: false,
    isPremium: false,
  },
  {
    id: 7,
    name: 'AlterX',
    selectorName: 'AlterX: Subdomain Wordlist Generator',
    value: ToolID.ALTERX,
    icon: 'https://avatars.githubusercontent.com/u/50994705',
    description: 'Fast and customizable subdomain wordlist generator',
    categories: ['Free'],
    githubRepoUrl: 'https://github.com/projectdiscovery/alterx',
    isInstalled: false,
    isPremium: false,
  },
  {
    id: 99,
    name: 'Plugins Store',
    selectorName: 'Plugins Store',
    value: 'plugins_store',
    categories: ['Uncategorized'],
    isInstalled: false,
    isPremium: false,
  },
];

const PluginSelector = () => {
  const { t } = useTranslation('tool');
  const {
    state: { selectedToolId, selectedConversation },
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const { isPremium } = usePremiumStatusContext();
  const { state: pluginState, dispatch: pluginDispatch } = usePluginContext();
  const [isPluginStoreOpen, setIsPluginStoreOpen] = useState(false);

  const MAX_PLUGINS = 7;
  const defaultPluginIds = [0, 99];

  useEffect(() => {
    if (selectedConversation?.model.id) {
      homeDispatch({
        type: 'SET_SELECTED_TOOL_ID',
        payload: null,
      });
    }
  }, [selectedConversation?.model.id, homeDispatch]);

  const toolOnChange = (toolId: string | null) => {
    if (toolId === 'none') {
      homeDispatch({
        type: 'SET_SELECTED_TOOL_ID',
        payload: null,
      });
      return;
    }

    if (toolId === ToolID.WEBSEARCH) {
      alert(
        t('Please disable Search Web plugin before selecting another tool.'),
      );
      return;
    }

    if (
      toolId !== ToolID.SUBFINDER &&
      toolId !== ToolID.ALTERX &&
      toolId !== ToolID.GAU &&
      toolId !== 'plugins_store' &&
      selectedConversation?.model.id !== OpenAIModelID.GPT_4
    ) {
      alert(t('This tool is only available with the GPT-4 model.'));
      return;
    }

    if (toolId === 'plugins_store') {
      setIsPluginStoreOpen(true);
    } else {
      homeDispatch({
        type: 'SET_SELECTED_TOOL_ID',
        payload: toolId,
      });
    }
  };

  const installPlugin = (plugin: Plugin) => {
    if (pluginState.installedPlugins.some((p) => p.id === plugin.id)) {
      alert('This plugin is already installed.');
      return;
    }

    if (pluginState.installedPlugins.length >= MAX_PLUGINS) {
      alert('You can only install up to ' + MAX_PLUGINS + ' plugins.');
      return;
    }

    pluginDispatch({
      type: 'INSTALL_PLUGIN',
      payload: { ...plugin, isInstalled: true },
    });
  };

  const uninstallPlugin = (pluginId: number) => {
    if (!pluginState.installedPlugins.some((p) => p.id === pluginId)) {
      alert('This plugin is not installed.');
      return;
    }

    pluginDispatch({
      type: 'UNINSTALL_PLUGIN',
      payload: pluginId,
    });
  };

  // Update the availablePlugins array to include the isInstalled property
  const updatedAvailablePlugins = availablePlugins.map((plugin) => {
    const isInstalled = pluginState.installedPlugins.some(
      (p) => p.id === plugin.id,
    );
    return { ...plugin, isInstalled };
  });

  const selectorPlugins = updatedAvailablePlugins.filter(
    (plugin) => plugin.isInstalled || defaultPluginIds.includes(plugin.id),
  );

  return (
    <div className="flex flex-row items-center justify-between md:justify-start">
      <label className="mr-2 text-left text-sm text-neutral-700 dark:text-neutral-300">
        {t('Plugins')}
      </label>
      <div className="relative w-fit rounded-lg border border-neutral-200 bg-transparent pr-1 text-neutral-900 focus:outline-none dark:border-neutral-500 dark:text-white">
        <select
          className="cursor-pointer bg-transparent p-2 focus:outline-none"
          value={selectedToolId || 'none'}
          onChange={(e) => toolOnChange(e.target.value)}
        >
          {selectorPlugins.map((tool, key) => (
            <option
              key={key}
              value={tool.value}
              disabled={tool.isPremium && !isPremium}
              className="flex font-sans disabled:text-neutral-500 dark:bg-[#343541] dark:text-white"
            >
              {tool.selectorName}
            </option>
          ))}
        </select>
      </div>
      <PluginStoreModal
        isOpen={isPluginStoreOpen}
        setIsOpen={setIsPluginStoreOpen}
        pluginsData={updatedAvailablePlugins}
        installPlugin={installPlugin}
        uninstallPlugin={uninstallPlugin}
      />
    </div>
  );
};

export default PluginSelector;
