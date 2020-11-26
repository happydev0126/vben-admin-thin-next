import type { AppRouteModule } from '/@/router/types';

import { PAGE_LAYOUT_COMPONENT } from '/@/router/constant';

const dashboard: AppRouteModule = {
  layout: {
    path: '/dashboard',
    name: 'Dashboard',
    component: PAGE_LAYOUT_COMPONENT,
    redirect: '/dashboard/workbench',
    meta: {
      icon: 'ant-design:home-outlined',
      title: 'routes.dashboard.dashboard',
    },
  },

  routes: [
    {
      path: '/welcome',
      name: 'Welcome',
      component: () => import('/@/views/dashboard/welcome/index.vue'),
      meta: {
        title: 'routes.dashboard.welcome',
      },
    },
    {
      path: '/workbench',
      name: 'Workbench',
      component: () => import('/@/views/dashboard/workbench/index.vue'),
      meta: {
        title: 'routes.dashboard.workbench',
        affix: true,
      },
    },
    {
      path: '/analysis',
      name: 'Analysis',
      component: () => import('/@/views/dashboard/analysis/index.vue'),
      meta: {
        title: 'routes.dashboard.analysis',
      },
    },
  ],
};

export default dashboard;
