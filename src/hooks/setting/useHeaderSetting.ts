import type { HeaderSetting } from '/@/types/config';

import { computed, unref } from 'vue';

import { appStore } from '/@/store/modules/app';

import { useMultipleTabSetting } from '/@/hooks/setting/useMultipleTabSetting';
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { useFullContent } from '/@/hooks/web/useFullContent';

import { MenuModeEnum } from '/@/enums/menuEnum';

const { getFullContent } = useFullContent();
const { getShowMultipleTab } = useMultipleTabSetting();
const {
  getMenuMode,
  getSplit,
  getShowHeaderTrigger,
  getIsSidebarType,
  getIsTopMenu,
} = useMenuSetting();
const { getShowBreadCrumb, getShowLogo } = useRootSetting();

const getShowMixHeaderRef = computed(() => !unref(getIsSidebarType) && unref(getShowHeader));

const getShowFullHeaderRef = computed(() => {
  return (
    !unref(getFullContent) &&
    unref(getShowMixHeaderRef) &&
    unref(getShowHeader) &&
    !unref(getIsTopMenu)
  );
});

const getShowInsetHeaderRef = computed(() => {
  const need = !unref(getFullContent) && unref(getShowHeader);
  return (need && !unref(getShowMixHeaderRef)) || (need && unref(getIsTopMenu));
});

// Get header configuration
const getHeaderSetting = computed(() => appStore.getProjectConfig.headerSetting);

const getShowDoc = computed(() => unref(getHeaderSetting).showDoc);

const getHeaderTheme = computed(() => unref(getHeaderSetting).theme);

const getShowHeader = computed(() => unref(getHeaderSetting).show);

const getFixed = computed(() => unref(getHeaderSetting).fixed);

const getHeaderBgColor = computed(() => unref(getHeaderSetting).bgColor);

const getShowRedo = computed(() => unref(getHeaderSetting).showRedo && unref(getShowMultipleTab));

const getUseLockPage = computed(() => unref(getHeaderSetting).useLockPage);

const getShowFullScreen = computed(() => unref(getHeaderSetting).showFullScreen);

const getShowNotice = computed(() => unref(getHeaderSetting).showNotice);

const getUnFixedAndFull = computed(() => !unref(getFixed) && !unref(getShowFullHeaderRef));

const getShowBread = computed(() => {
  return (
    unref(getMenuMode) !== MenuModeEnum.HORIZONTAL && unref(getShowBreadCrumb) && !unref(getSplit)
  );
});

const getShowHeaderLogo = computed(() => {
  return unref(getShowLogo) && !unref(getIsSidebarType);
});

const getShowContent = computed(() => {
  return unref(getShowBread) || unref(getShowHeaderTrigger);
});

// Set header configuration
function setHeaderSetting(headerSetting: Partial<HeaderSetting>): void {
  appStore.commitProjectConfigState({ headerSetting });
}

export function useHeaderSetting() {
  return {
    setHeaderSetting,

    getHeaderSetting,

    getShowDoc,
    getHeaderTheme,
    getShowRedo,
    getUseLockPage,
    getShowFullScreen,
    getShowNotice,
    getShowBread,
    getShowContent,
    getShowHeaderLogo,
    getShowHeader,
    getFixed,
    getShowMixHeaderRef,
    getShowFullHeaderRef,
    getShowInsetHeaderRef,
    getUnFixedAndFull,
    getHeaderBgColor,
  };
}
