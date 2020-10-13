import contextMenuVue from './src/index';
import { isClient } from '/@/utils/is';
import { Options, Props } from './src/types';
import { createVNode, render } from 'vue';
const menuManager: {
  doms: Element[];
  resolve: Fn;
} = {
  doms: [],
  resolve: () => {},
};
export const createContextMenu = function (options: Options) {
  const { event } = options || {};
  try {
    event.preventDefault();
  } catch (e) {
    console.log(e);
  }

  if (!isClient) return;
  return new Promise((resolve) => {
    const container = document.createElement('div');
    const propsData: Partial<Props> = {};
    if (options.styles !== undefined) propsData.styles = options.styles;
    if (options.items !== undefined) propsData.items = options.items;
    if (options.event !== undefined) {
      propsData.customEvent = event;
      propsData.axis = { x: event.clientX, y: event.clientY };
    }
    const vm = createVNode(contextMenuVue, propsData);
    render(vm, container);
    const bodyClick = function () {
      menuManager.resolve('');
    };
    menuManager.doms.push(container);
    const remove = function () {
      menuManager.doms.forEach((dom: Element) => {
        try {
          document.body.removeChild(dom);
        } catch (error) {}
      });
      document.body.removeEventListener('click', bodyClick);
      document.body.removeEventListener('scroll', bodyClick);
    };
    menuManager.resolve = function (...arg: any) {
      resolve(arg[0]);
      remove();
    };
    remove();
    document.body.appendChild(container);
    document.body.addEventListener('click', bodyClick);
    document.body.addEventListener('scroll', bodyClick);
  });
};
export const unMountedContextMenu = function () {
  if (menuManager) {
    menuManager.resolve('');
    menuManager.doms = [];
  }
};

export * from './src/types';
