import type { AppRouteRecordRaw } from '/@/router/types';

import { computed, toRaw, unref } from 'vue';
import { useRouter } from 'vue-router';
import router from '/@/router';

import { tabStore } from '/@/store/modules/tab';

import { unique } from '/@/utils';

import { useMultipleTabSetting } from '/@/hooks/setting/useMultipleTabSetting';

export function useFrameKeepAlive() {
  const { currentRoute } = useRouter();
  const { getShowMultipleTab } = useMultipleTabSetting();

  const getFramePages = computed(() => {
    const ret =
      getAllFramePages((toRaw(router.getRoutes()) as unknown) as AppRouteRecordRaw[]) || [];
    return ret;
  });

  const getOpenTabList = computed((): string[] => {
    return tabStore.getTabsState.reduce((prev: string[], next) => {
      if (next.meta && Reflect.has(next.meta, 'frameSrc')) {
        prev.push(next.name as string);
      }
      return prev;
    }, []);
  });

  function getAllFramePages(routes: AppRouteRecordRaw[]): AppRouteRecordRaw[] {
    let res: AppRouteRecordRaw[] = [];
    for (const route of routes) {
      const { meta: { frameSrc } = {}, children } = route;
      if (frameSrc) {
        res.push(route);
      }
      if (children && children.length) {
        res.push(...getAllFramePages(children));
      }
    }
    res = unique(res, 'name');
    return res;
  }

  function showIframe(item: AppRouteRecordRaw) {
    return item.name === unref(currentRoute).name;
  }

  function hasRenderFrame(name: string) {
    if (!unref(getShowMultipleTab)) {
      return true;
    }
    return unref(getOpenTabList).includes(name);
  }
  return { hasRenderFrame, getFramePages, showIframe, getAllFramePages };
}
