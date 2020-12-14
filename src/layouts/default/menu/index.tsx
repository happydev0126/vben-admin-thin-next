import './index.less';

import { PropType, toRef } from 'vue';

import { computed, defineComponent, unref } from 'vue';
import { BasicMenu } from '/@/components/Menu';
import { AppLogo } from '/@/components/Application';

import { MenuModeEnum, MenuSplitTyeEnum } from '/@/enums/menuEnum';

import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
import { ScrollContainer } from '/@/components/Container';

import { useGo } from '/@/hooks/web/usePage';
import { useSplitMenu } from './useLayoutMenu';
import { openWindow } from '/@/utils';
import { propTypes } from '/@/utils/propTypes';
import { isUrl } from '/@/utils/is';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { CSSProperties } from 'vue';

export default defineComponent({
  name: 'LayoutMenu',
  props: {
    theme: propTypes.oneOf(['light', 'dark']),

    splitType: {
      type: Number as PropType<MenuSplitTyeEnum>,
      default: MenuSplitTyeEnum.NONE,
    },

    isHorizontal: propTypes.bool,
    // menu Mode
    menuMode: {
      type: [String] as PropType<Nullable<MenuModeEnum>>,
      default: '',
    },
  },
  setup(props) {
    const go = useGo();

    const {
      getMenuMode,
      getMenuType,
      getCollapsedShowTitle,
      getMenuTheme,
      getCollapsed,
      getAccordion,
      getIsSidebarType,
    } = useMenuSetting();
    const { getShowLogo } = useRootSetting();

    const { menusRef } = useSplitMenu(toRef(props, 'splitType'));

    const getComputedMenuMode = computed(() => props.menuMode || unref(getMenuMode));

    const getComputedMenuTheme = computed(() => props.theme || unref(getMenuTheme));

    const getIsShowLogo = computed(() => unref(getShowLogo) && unref(getIsSidebarType));

    const getUseScroll = computed(() => {
      return unref(getIsSidebarType) || props.splitType === MenuSplitTyeEnum.LEFT;
    });

    const getWrapperStyle = computed(
      (): CSSProperties => {
        return {
          height: `calc(100% - ${unref(getIsShowLogo) ? '48px' : '0px'})`,
        };
      }
    );
    /**
     * click menu
     * @param menu
     */

    function handleMenuClick(path: string) {
      go(path);
    }

    /**
     * before click menu
     * @param menu
     */
    async function beforeMenuClickFn(path: string) {
      if (!isUrl(path)) {
        return true;
      }
      openWindow(path);
      return false;
    }

    function renderHeader() {
      if (!unref(getIsShowLogo)) return null;

      return (
        <AppLogo
          showTitle={!unref(getCollapsed)}
          class={[`layout-menu__logo`, unref(getComputedMenuTheme)]}
          theme={unref(getComputedMenuTheme)}
        />
      );
    }

    function renderMenu() {
      return (
        <BasicMenu
          beforeClickFn={beforeMenuClickFn}
          isHorizontal={props.isHorizontal}
          type={unref(getMenuType)}
          mode={unref(getComputedMenuMode)}
          collapsedShowTitle={unref(getCollapsedShowTitle)}
          theme={unref(getComputedMenuTheme)}
          items={unref(menusRef)}
          accordion={unref(getAccordion)}
          onMenuClick={handleMenuClick}
          showLogo={unref(getIsShowLogo)}
        />
      );
    }

    return () => {
      return (
        <>
          {renderHeader()}
          {unref(getUseScroll) ? (
            <ScrollContainer style={unref(getWrapperStyle)}>{() => renderMenu()}</ScrollContainer>
          ) : (
            renderMenu()
          )}
          ;
        </>
      );
    };
  },
});
