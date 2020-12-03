import type { TabContentProps } from './types';
import type { DropMenu } from '/@/components/Dropdown';

import { computed, unref, reactive } from 'vue';
import { TabContentEnum, MenuEventEnum } from './types';
import { tabStore } from '/@/store/modules/tab';
import router from '/@/router';
import { RouteLocationNormalized } from 'vue-router';
import { useTabs } from '/@/hooks/web/useTabs';
import { useI18n } from '/@/hooks/web/useI18n';
import { useHeaderSetting } from '/@/hooks/setting/useHeaderSetting';
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
import { useMultipleTabSetting } from '/@/hooks/setting/useMultipleTabSetting';

const { t } = useI18n();

export function useTabDropdown(tabContentProps: TabContentProps) {
  const state = reactive({
    current: null as Nullable<RouteLocationNormalized>,
    currentIndex: 0,
  });

  const { currentRoute } = router;

  const { getShowMenu, setMenuSetting } = useMenuSetting();
  const { getShowHeader, setHeaderSetting } = useHeaderSetting();
  const { getShowQuick } = useMultipleTabSetting();

  const isTabs = computed(() =>
    !unref(getShowQuick) ? true : tabContentProps.type === TabContentEnum.TAB_TYPE
  );

  const getCurrentTab = computed(
    (): RouteLocationNormalized => {
      return unref(isTabs) ? tabContentProps.tabItem : unref(currentRoute);
    }
  );

  const getIsScale = computed(() => {
    return !unref(getShowMenu) && !unref(getShowHeader);
  });

  /**
   * @description: drop-down list
   */
  const getDropMenuList = computed(() => {
    if (!unref(getCurrentTab)) return;
    const { meta } = unref(getCurrentTab);
    const { path } = unref(currentRoute);

    // Refresh button
    const curItem = state.current;
    const index = state.currentIndex;
    const refreshDisabled = curItem ? curItem.path !== path : true;
    // Close left
    const closeLeftDisabled = index === 0;

    const disabled = tabStore.getTabsState.length === 1;

    // Close right
    const closeRightDisabled =
      index === tabStore.getTabsState.length - 1 && tabStore.getLastDragEndIndexState >= 0;
    const dropMenuList: DropMenu[] = [
      {
        icon: 'ant-design:reload-outlined',
        event: MenuEventEnum.REFRESH_PAGE,
        text: t('layout.multipleTab.redo'),
        disabled: refreshDisabled,
      },
      {
        icon: 'ant-design:close-outlined',
        event: MenuEventEnum.CLOSE_CURRENT,
        text: t('layout.multipleTab.close'),
        disabled: meta?.affix || disabled,
        divider: true,
      },
      {
        icon: 'ant-design:pic-left-outlined',
        event: MenuEventEnum.CLOSE_LEFT,
        text: t('layout.multipleTab.closeLeft'),
        disabled: closeLeftDisabled,
        divider: false,
      },
      {
        icon: 'ant-design:pic-right-outlined',
        event: MenuEventEnum.CLOSE_RIGHT,
        text: t('layout.multipleTab.closeRight'),
        disabled: closeRightDisabled,
        divider: true,
      },
      {
        icon: 'ant-design:pic-center-outlined',
        event: MenuEventEnum.CLOSE_OTHER,
        text: t('layout.multipleTab.closeOther'),
        disabled: disabled,
      },
      {
        icon: 'ant-design:line-outlined',
        event: MenuEventEnum.CLOSE_ALL,
        text: t('layout.multipleTab.closeAll'),
        disabled: disabled,
      },
    ];

    if (!unref(isTabs)) {
      const isScale = unref(getIsScale);
      dropMenuList.unshift({
        icon: isScale ? 'codicon:screen-normal' : 'codicon:screen-full',
        event: MenuEventEnum.SCALE,
        text: isScale ? t('layout.multipleTab.putAway') : t('layout.multipleTab.unfold'),
        disabled: false,
      });
    }

    return dropMenuList;
  });

  const getTrigger = computed(() => {
    return unref(isTabs) ? ['contextmenu'] : ['click'];
  });

  function handleContextMenu(tabItem: RouteLocationNormalized) {
    return (e: Event) => {
      if (!tabItem) return;
      e?.preventDefault();
      const index = tabStore.getTabsState.findIndex((tab) => tab.path === tabItem.path);
      state.current = tabItem;
      state.currentIndex = index;
    };
  }

  function scaleScreen() {
    const isScale = !unref(getShowMenu) && !unref(getShowHeader);
    setMenuSetting({
      show: isScale,
    });
    setHeaderSetting({
      show: isScale,
    });
  }

  // Handle right click event
  function handleMenuEvent(menu: DropMenu): void {
    const { refreshPage, closeAll, closeCurrent, closeLeft, closeOther, closeRight } = useTabs();
    const { event } = menu;
    switch (event) {
      case MenuEventEnum.SCALE:
        scaleScreen();
        break;
      case MenuEventEnum.REFRESH_PAGE:
        // refresh page
        refreshPage();
        break;
      // Close current
      case MenuEventEnum.CLOSE_CURRENT:
        closeCurrent();
        break;
      // Close left
      case MenuEventEnum.CLOSE_LEFT:
        closeLeft();
        break;
      // Close right
      case MenuEventEnum.CLOSE_RIGHT:
        closeRight();
        break;
      // Close other
      case MenuEventEnum.CLOSE_OTHER:
        closeOther();
        break;
      // Close all
      case MenuEventEnum.CLOSE_ALL:
        closeAll();
        break;
    }
  }
  return { getDropMenuList, handleMenuEvent, handleContextMenu, getTrigger, isTabs };
}
