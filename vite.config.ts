import { resolve } from 'path';

import type { UserConfig, Plugin as VitePlugin } from 'vite';

import visualizer from 'rollup-plugin-visualizer';
import { modifyVars } from './build/config/glob/lessModifyVars';
import { setupBasicEnv } from './build/config/vite/env';
import { createProxy } from './build/config/vite/proxy';
import { createMockServer } from 'vite-plugin-mock';
import PurgeIcons from 'vite-plugin-purge-icons';
import { isDevFn, isReportMode, isProdFn, loadEnv } from './build/utils';

setupBasicEnv();
const { VITE_USE_MOCK, VITE_PORT, VITE_PUBLIC_PATH, VITE_PROXY } = loadEnv();

function pathResolve(dir: string) {
  return resolve(__dirname, '.', dir);
}

const rollupPlugins: any[] = [];
const vitePlugins: VitePlugin[] = [];

(() => {
  if (isReportMode() && isProdFn()) {
    // report
    rollupPlugins.push(
      visualizer({ filename: './node_modules/.cache/stats.html', open: true }) as Plugin
    );
  }
  if (isDevFn() && VITE_USE_MOCK) {
    // open mock
    vitePlugins.push(
      createMockServer({
        ignore: /^\_/,
        mockPath: 'mock',
      })
    );
  }
})();

const viteConfig: UserConfig = {
  /**
   * 端口号
   * @default '3000'
   */
  port: VITE_PORT,
  /**
   * 服务地址
   * @default 'localhost'
   */
  hostname: 'localhost',
  /**
   * 运行自动打开浏览器·
   * @default 'false'
   */
  open: false,
  /**
   * 压缩代码
   *  boolean | 'terser' | 'esbuild'
   * @default 'terser'
   */
  minify: isDevFn() ? false : 'terser',
  /**
   * 基本公共路径
   * @default '/'
   */
  base: VITE_PUBLIC_PATH,

  /**
   * 打包输入路径
   * @default 'dist'
   */
  outDir: 'dist',
  /**
   * @default 'false'
   */
  sourcemap: false,
  /**
   * 资源输出路径
   * @default '_assets'
   */
  assetsDir: '_assets',
  /**
   * 静态资源小于该大小将会内联，默认4096kb
   * @default '4096'
   */
  assetsInlineLimit: 4096,
  /**
   * esbuild转换目标。
   * @default 'es2019'
   */
  esbuildTarget: 'es2019',
  silent: false,
  // 别名
  alias: {
    '/@/': pathResolve('src'),
  },
  // define: {
  //   __ENV__: 'value',
  // },
  // css预处理
  cssPreprocessOptions: {
    less: {
      modifyVars: modifyVars,
      javascriptEnabled: true,
    },
  },
  // 配置Dep优化行为
  // 会使用 rollup 对 包重新编译，将编译成符合 esm 模块规范的新的包放入 node_modules 下的 .
  optimizeDeps: {
    include: [
      'echarts',
      'echarts/map/js/china',
      'ant-design-vue/es/locale/zh_CN',
      '@ant-design/icons-vue',
      'moment/locale/zh-cn',
    ],
  },
  // 本地跨域代理
  proxy: createProxy(VITE_PROXY),

  plugins: [PurgeIcons(), ...vitePlugins],
  rollupOutputOptions: {},
  rollupInputOptions: {
    plugins: rollupPlugins,
  },
};

export default viteConfig;
