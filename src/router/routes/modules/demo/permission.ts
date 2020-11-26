import type { AppRouteModule } from '/@/router/types';

import { PAGE_LAYOUT_COMPONENT } from '/@/router/constant';
import { RoleEnum } from '/@/enums/roleEnum';

const permission: AppRouteModule = {
  layout: {
    path: '/permission',
    name: 'Permission',
    component: PAGE_LAYOUT_COMPONENT,
    redirect: '/permission/front/page',
    meta: {
      icon: 'carbon:user-role',
      title: 'routes.demo.permission.permission',
    },
  },

  routes: [
    {
      path: '/front',
      name: 'PermissionFrontDemo',
      meta: {
        title: 'routes.demo.permission.front',
      },
      children: [
        {
          path: 'page',
          name: 'FrontPageAuth',
          component: () => import('/@/views/demo/permission/front/index.vue'),
          meta: {
            title: 'routes.demo.permission.frontPage',
          },
        },
        {
          path: 'btn',
          name: 'FrontBtnAuth',
          component: () => import('/@/views/demo/permission/front/Btn.vue'),
          meta: {
            title: 'routes.demo.permission.frontBtn',
          },
        },
        {
          path: 'auth-pageA',
          name: 'FrontAuthPageA',
          component: () => import('/@/views/demo/permission/front/AuthPageA.vue'),
          meta: {
            title: 'routes.demo.permission.frontTestA',
            roles: [RoleEnum.SUPER],
          },
        },
        {
          path: 'auth-pageB',
          name: 'FrontAuthPageB',
          component: () => import('/@/views/demo/permission/front/AuthPageB.vue'),
          meta: {
            title: 'routes.demo.permission.frontTestB',
            roles: [RoleEnum.TEST],
          },
        },
      ],
    },
    {
      path: '/back',
      name: 'PermissionBackDemo',
      meta: {
        title: 'routes.demo.permission.back',
      },
      children: [
        {
          path: 'page',
          name: 'BackAuthPage',
          component: () => import('/@/views/demo/permission/back/index.vue'),
          meta: {
            title: 'routes.demo.permission.backPage',
          },
        },
        {
          path: 'btn',
          name: 'BackAuthBtn',
          component: () => import('/@/views/demo/permission/back/Btn.vue'),
          meta: {
            title: 'routes.demo.permission.backBtn',
          },
        },
      ],
    },
  ],
};

export default permission;
