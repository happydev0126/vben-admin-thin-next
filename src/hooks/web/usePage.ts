import { appStore } from '/@/store/modules/app';
import type { RouteLocationRaw } from 'vue-router';

import { useRouter } from 'vue-router';
import { PageEnum } from '/@/enums/pageEnum';
import { isString } from '/@/utils/is';
import { unref } from 'vue';

export type RouteLocationRawEx = Omit<RouteLocationRaw, 'path'> & { path: PageEnum };

function handleError(e: Error) {
  console.error(e);
  // 101是为了 大于 打开时候设置的100延时防止闪动
  setTimeout(() => {
    appStore.commitPageLoadingState(false);
  }, 101);
}

// page switch
export function useGo() {
  const { push, replace } = useRouter();
  function go(opt: PageEnum | RouteLocationRawEx | string = PageEnum.BASE_HOME, isReplace = false) {
    if (!opt) return;
    if (isString(opt)) {
      isReplace ? replace(opt).catch(handleError) : push(opt).catch(handleError);
    } else {
      const o = opt as RouteLocationRaw;
      isReplace ? replace(o).catch(handleError) : push(o).catch(handleError);
    }
  }
  return go;
}

/**
 * @description: redo current page
 */
export const useRedo = () => {
  const { push, currentRoute } = useRouter();
  const { query, params } = currentRoute.value;
  function redo() {
    push({
      path: '/redirect' + unref(currentRoute).fullPath,
      query,
      params,
    });
  }
  return redo;
};
