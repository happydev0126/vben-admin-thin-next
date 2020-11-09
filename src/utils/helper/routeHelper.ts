import type { AppRouteModule, AppRouteRecordRaw } from '/@/router/types';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

import { appStore } from '/@/store/modules/app';
import { tabStore } from '/@/store/modules/tab';
import { createRouter, createWebHashHistory } from 'vue-router';
import { toRaw } from 'vue';
import { PAGE_LAYOUT_COMPONENT } from '/@/router/constant';
// import { isDevMode } from '/@/utils/env';
import dynamicImport from './dynamicImport';
import { omit } from 'lodash-es';

let currentTo: RouteLocationNormalized | null = null;

export function getCurrentTo() {
  return currentTo;
}

export function setCurrentTo(to: RouteLocationNormalized) {
  currentTo = to;
}
// 转化路由模块
// 将多级转成2层。keepAlive问题
export function genRouteModule(moduleList: AppRouteModule[]) {
  const ret: AppRouteRecordRaw[] = [];
  for (const routeMod of moduleList) {
    let routes = [];
    let layout: AppRouteRecordRaw | undefined;
    if (Reflect.has(routeMod, 'routes')) {
      routes = routeMod.routes as any;
      layout = routeMod.layout;
    } else if (Reflect.has(routeMod, 'path')) {
      layout = omit(routeMod, 'children') as any;
      routes = routeMod.children || [];
    }

    const router = createRouter({ routes, history: createWebHashHistory() });

    const flatList = (toRaw(router.getRoutes()).filter(
      (item) => item.children.length === 0
    ) as unknown) as AppRouteRecordRaw[];
    flatList.forEach((item) => {
      item.path = `${layout ? layout.path : ''}${item.path}`;
    });
    if (layout) {
      layout.children = flatList;
      ret.push(layout);
    } else {
      ret.push(...flatList);
    }
  }
  return ret as RouteRecordRaw[];
}

// 动态引入
function asyncImportRoute(routes: AppRouteRecordRaw[] | undefined) {
  if (!routes) return;
  routes.forEach((item) => {
    const { component } = item;
    const { children } = item;
    if (component) {
      item.component = dynamicImport(component);
    }

    children && asyncImportRoute(children);
  });
}

// 将后台对象转成路由对象
export function transformObjToRoute(routeList: AppRouteModule[]) {
  routeList.forEach((route) => {
    asyncImportRoute(Reflect.has(route, 'routes') ? route.routes : route.children || []);
    if (route.layout) {
      route.layout.component =
        route.layout.component === 'PAGE_LAYOUT' ? PAGE_LAYOUT_COMPONENT : '';
    } else {
      route.component = route.component === 'PAGE_LAYOUT' ? PAGE_LAYOUT_COMPONENT : '';
      const _layout = omit(route, 'children') as any;
      route.layout = _layout;
    }
  });
  return routeList;
}

//
export function getIsOpenTab(toPath: string) {
  const { openKeepAlive, multiTabsSetting: { show } = {} } = appStore.getProjectConfig;

  if (show && openKeepAlive) {
    const tabList = tabStore.getTabsState;
    return tabList.some((tab) => tab.path === toPath);
  }
  return false;
}

export function getParams(data: any = {}) {
  const { params = {} } = data;
  let ret = '';
  Object.keys(params).forEach((key) => {
    const p = params[key];
    ret += `/${p}`;
  });
  return ret;
}
