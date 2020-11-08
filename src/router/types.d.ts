import type { RouteRecordRaw } from 'vue-router';
import { RoleEnum } from '/@/enums/roleEnum';
export interface RouteMeta {
  // title
  title: string;
  // Whether to ignore permissions
  ignoreAuth?: boolean;
  // role info
  roles?: RoleEnum[];
  // Whether not to cache
  ignoreKeepAlive?: boolean;
  // Is it fixed on tab
  affix?: boolean;
  // icon on tab
  icon?: string;
  // Jump address
  frameSrc?: string;
  // Outer link jump address
  externalLink?: string;

  // current page transition
  transitionName?: string;

  // Whether the route has been dynamically added
  hideBreadcrumb?: boolean;

  // disabled redirect
  disabledRedirect?: boolean;

  // close loading
  afterCloseLoading?: boolean;
  // Is it in the tab
  inTab?: boolean;
  // Carrying parameters
  carryParam?: boolean;
}

export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta'> {
  meta: RouteMeta;
  component?: any;
  components?: any;
  children?: AppRouteRecordRaw[];
  props?: any;
  fullPath?: string;
}

export interface Menu {
  name: string;

  icon?: string;

  path: string;

  disabled?: boolean;

  children?: Menu[];

  orderNo?: number;

  roles?: RoleEnum[];

  meta?: Partial<RouteMeta>;
}
export interface MenuModule {
  orderNo?: number;
  menu: Menu;
}

export interface AppRouteModule {
  layout?: AppRouteRecordRaw;
  routes?: AppRouteRecordRaw[];
  children?: AppRouteRecordRaw[];
  component?: any;
}
