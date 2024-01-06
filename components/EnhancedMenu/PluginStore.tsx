import { Dialog, Transition, Tab } from '@headlessui/react';
import React, { useState, useEffect, Fragment } from 'react';
import { XCircleIcon, SearchIcon, XIcon } from '@heroicons/react/outline';

import { IconCloudDownload } from '@tabler/icons-react';

import { Plugin } from '@/types/plugin';
import { usePluginContext } from '@/hooks/PluginProvider';

function getPluginsPerPage() {
  const width = window.innerWidth;
  if (width < 768) return 2;
  if (width >= 768 && width < 1024) return 4;
  return 6;
}

interface PluginStoreModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  pluginsData: Plugin[];
  installPlugin: any;
  uninstallPlugin: any;
}

function PluginStoreModal({
  isOpen,
  setIsOpen,
  pluginsData,
  installPlugin,
  uninstallPlugin,
}: PluginStoreModalProps) {
  const { state, dispatch } = usePluginContext();
  const categories = ['Free', 'Popular', 'New', 'All', 'Installed'];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Free');
  const [currentPage, setCurrentPage] = useState(1);
  const [pluginsPerPage, setPluginsPerPage] = useState(getPluginsPerPage());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (isOpen) {
      setSelectedCategory('Free');
      setCurrentPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    function handleResize() {
      setPluginsPerPage(getPluginsPerPage());
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const excludedPluginIds = [0, 99];

  const filteredPlugins = pluginsData
    .filter((plugin) => !excludedPluginIds.includes(plugin.id))
    .filter((plugin) => {
      const matchesSearch = plugin.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' ||
        plugin.categories.includes(selectedCategory);
      const isInstalledCategory = selectedCategory === 'Installed';

      if (isInstalledCategory) {
        return plugin.isInstalled;
      }

      return matchesSearch && matchesCategory;
    });

  const pageCount = Math.ceil(filteredPlugins.length / pluginsPerPage);
  const currentPagePlugins = filteredPlugins.slice(
    (currentPage - 1) * pluginsPerPage,
    currentPage * pluginsPerPage,
  );

  const handlePreviousPage = () =>
    setCurrentPage(currentPage > 1 ? currentPage - 1 : currentPage);
  const handleNextPage = () =>
    setCurrentPage(currentPage < pageCount ? currentPage + 1 : currentPage);

  const isMobile = windowWidth < 768;

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-hgpt-dark-gray p-6 text-left align-middle shadow-xl transition-all sm:max-w-lg md:max-w-3xl lg:max-w-5xl">
                  <Dialog.Title
                    as="h3"
                    className="flex justify-between text-lg font-medium leading-6 text-white"
                  >
                    Plugin store
                    <button
                      onClick={closeModal}
                      className="text-gray-300 hover:text-gray-500"
                    >
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </Dialog.Title>

                  <hr className="my-4 border-gray-300" />

                  <div className="mt-2">
                    {/* Search and Category Selection */}
                    <div
                      className={`mb-4 ${
                        isMobile
                          ? 'flex flex-col items-center space-y-2'
                          : 'flex items-center'
                      }`}
                    >
                      <Tab.Group>
                        <Tab.List
                          className={`mr-2 flex ${
                            isMobile ? 'space-x-1' : 'space-x-2'
                          } rounded-xl bg-hgpt-dark-gray p-1`}
                        >
                          {categories.map((category) => (
                            <Tab
                              key={category}
                              className={({ selected }) =>
                                `rounded-lg border border-hgpt-light-gray px-3 py-2 text-sm font-medium ${
                                  selected
                                    ? 'bg-gray-200 shadow'
                                    : 'bg-hgpt-medium-gray text-white hover:bg-hgpt-medium-gray/[0.40] hover:text-white'
                                }`
                              }
                              onClick={() => setSelectedCategory(category)}
                            >
                              {category}
                            </Tab>
                          ))}
                        </Tab.List>
                      </Tab.Group>

                      {/* Search Bar */}
                      <div
                        className={`relative ${
                          isMobile ? 'w-50 mt-2' : 'w-60'
                        }`}
                      >
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <SearchIcon
                            className="h-5 w-5 text-gray-500"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          type="search"
                          placeholder="Search plugins"
                          className="block w-full rounded-lg py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Plugin List */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {currentPagePlugins.map((plugin) => (
                        <div
                          key={plugin.id}
                          className="rounded-lg border border-hgpt-light-gray bg-hgpt-dark-gray p-4 shadow "
                        >
                          {/* Flex container for image and name/button */}
                          <div className="flex items-center">
                            {/* Image container */}
                            <div className="mr-4 h-20 w-20 flex-shrink-0">
                              <img
                                src={plugin.icon}
                                alt={plugin.name}
                                className="h-full w-full rounded object-cover"
                              />
                            </div>

                            {/* Container for name and install button */}
                            <div className="flex flex-col justify-between">
                              <h4 className="text-md mb-2 text-white">
                                {plugin.name}
                              </h4>
                              <button
                                className={`mt-auto inline-flex items-center justify-center rounded px-4 py-2 text-sm ${
                                  plugin.isInstalled
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                                onClick={() =>
                                  plugin.isInstalled
                                    ? uninstallPlugin(plugin.id)
                                    : installPlugin(plugin)
                                }
                              >
                                {plugin.isInstalled ? (
                                  <>
                                    Uninstall
                                    <XCircleIcon
                                      className="ml-2 h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </>
                                ) : (
                                  <>
                                    Install
                                    <IconCloudDownload
                                      className="ml-2 h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          {/* Description and Premium badge */}
                          <p className="mt-4 text-sm text-white/80">
                            {plugin.description}
                          </p>
                          {plugin.isPremium && (
                            <span className="mt-2 inline-block rounded bg-yellow-200 px-2 py-1 text-xs font-semibold text-yellow-700">
                              Plus
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Pagination Controls */}
                    <div
                      className={`mt-4 flex items-center ${
                        isMobile ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="mr-4 rounded bg-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-300">
                        Page {currentPage} of {pageCount}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === pageCount}
                        className="ml-4 rounded bg-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default PluginStoreModal;
