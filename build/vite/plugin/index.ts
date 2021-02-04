import type { Plugin } from 'vite';

import PurgeIcons from 'vite-plugin-purge-icons';

// @ts-ignore
import pkg from '../../../package.json';
import { ViteEnv } from '../../utils';
import { configHtmlPlugin } from './html';
import { configPwaConfig } from './pwa';
import { configMockPlugin } from './mock';
import { configGzipPlugin } from './gzip';
import { configStyleImportPlugin } from './styleImport';
import { configVisualizerConfig } from './visualizer';
import { configThemePlugin } from './theme';
import { configImageminPlugin } from './imagemin';

// gen vite plugins
export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const vitePlugins: (Plugin | Plugin[])[] = [];

  // vite-plugin-html
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild));

  // vite-plugin-mock
  vitePlugins.push(configMockPlugin(viteEnv, isBuild));

  // vite-plugin-purge-icons
  vitePlugins.push(PurgeIcons());

  // vite-plugin-style-import
  vitePlugins.push(configStyleImportPlugin());

  // rollup-plugin-visualizer
  vitePlugins.push(configVisualizerConfig());

  //vite-plugin-theme
  vitePlugins.push(configThemePlugin());

  if (isBuild) {
    //vite-plugin-imagemin
    viteEnv.VITE_USE_IMAGEMIN && vitePlugins.push(configImageminPlugin());

    // rollup-plugin-gzip
    vitePlugins.push(configGzipPlugin(isBuild));

    // vite-plugin-pwa
    vitePlugins.push(configPwaConfig(viteEnv));
  }

  return vitePlugins;
}
