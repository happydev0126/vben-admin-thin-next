import type { Menu } from '/@/router/types';
import type { Ref } from 'vue';

import { watch, unref, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import { MenuSplitTyeEnum } from '/@/enums/menuEnum';
import { useThrottle } from '/@/hooks/core/useThrottle';
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';

import {
  getChildrenMenus,
  getCurrentParentPath,
  getFlatChildrenMenus,
  getFlatMenus,
  getMenus,
  getShallowMenus,
} from '/@/router/menus';
import { permissionStore } from '/@/store/modules/permission';

export function useSplitMenu(splitType: Ref<MenuSplitTyeEnum>) {
  // Menu array
  const menusRef = ref<Menu[]>([]);
  // flat menu array
  const flatMenusRef = ref<Menu[]>([]);

  const { currentRoute } = useRouter();

  const { setMenuSetting, getIsHorizontal, getSplit } = useMenuSetting();

  const [throttleHandleSplitLeftMenu] = useThrottle(handleSplitLeftMenu, 50);

  const splitNotLeft = computed(
    () => unref(splitType) !== MenuSplitTyeEnum.LEFT && !unref(getIsHorizontal)
  );

  const splitLeft = computed(() => !unref(getSplit) || unref(splitType) !== MenuSplitTyeEnum.LEFT);

  const spiltTop = computed(() => unref(splitType) === MenuSplitTyeEnum.TOP);

  const normalType = computed(() => {
    return unref(splitType) === MenuSplitTyeEnum.NONE || !unref(getSplit);
  });

  watch(
    [() => unref(currentRoute).path, () => unref(splitType)],
    async ([path]: [string, MenuSplitTyeEnum]) => {
      if (unref(splitNotLeft)) return;

      const parentPath = await getCurrentParentPath(path);
      parentPath && throttleHandleSplitLeftMenu(parentPath);
    },
    {
      immediate: true,
    }
  );

  // Menu changes
  watch(
    [() => permissionStore.getLastBuildMenuTimeState, () => permissionStore.getBackMenuListState],
    () => {
      genMenus();
    },
    {
      immediate: true,
    }
  );

  // split Menu changes
  watch([() => getSplit.value], () => {
    if (unref(splitNotLeft)) return;
    genMenus();
  });

  // Handle left menu split
  async function handleSplitLeftMenu(parentPath: string) {
    if (unref(splitLeft)) return;

    // spilt mode left
    const children = await getChildrenMenus(parentPath);
    if (!children) {
      setMenuSetting({ hidden: false });
      flatMenusRef.value = [];
      menusRef.value = [];
      return;
    }

    const flatChildren = await getFlatChildrenMenus(children);
    setMenuSetting({ hidden: true });
    flatMenusRef.value = flatChildren;
    menusRef.value = children;
  }

  // get menus
  async function genMenus() {
    // normal mode
    if (unref(normalType)) {
      flatMenusRef.value = await getFlatMenus();
      menusRef.value = await getMenus();
      return;
    }

    // split-top
    if (unref(spiltTop)) {
      const shallowMenus = await getShallowMenus();

      flatMenusRef.value = shallowMenus;
      menusRef.value = shallowMenus;
      return;
    }
  }
  return { flatMenusRef, menusRef };
}
