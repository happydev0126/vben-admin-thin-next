import { defineComponent, computed, unref, ref } from 'vue';
import { BasicDrawer } from '/@/components/Drawer/index';
import { Divider, Switch, Tooltip, InputNumber, Select } from 'ant-design-vue';
import Button from '/@/components/Button/index.vue';
import {
  MenuModeEnum,
  MenuTypeEnum,
  MenuThemeEnum,
  TopMenuAlignEnum,
  TriggerEnum,
} from '/@/enums/menuEnum';
import { ContentEnum, RouterTransitionEnum } from '/@/enums/appEnum';
import { CopyOutlined, RedoOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { appStore } from '/@/store/modules/app';
import { userStore } from '/@/store/modules/user';
import { ProjectConfig } from '/@/types/config';

import { useMessage } from '/@/hooks/web/useMessage';
import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';

import defaultSetting from '/@/settings/projectSetting';

import mixImg from '/@/assets/images/layout/menu-mix.svg';
import sidebarImg from '/@/assets/images/layout/menu-sidebar.svg';
import menuTopImg from '/@/assets/images/layout/menu-top.svg';
import { updateColorWeak, updateGrayMode } from '/@/setup/theme';

const themeOptions = [
  {
    value: MenuThemeEnum.LIGHT,
    label: '亮色',
  },
  {
    value: MenuThemeEnum.DARK,
    label: '暗色',
  },
];
const contentModeOptions = [
  {
    value: ContentEnum.FULL,
    label: '流式',
  },
  {
    value: ContentEnum.FIXED,
    label: '定宽',
  },
];
const topMenuAlignOptions = [
  {
    value: TopMenuAlignEnum.CENTER,
    label: '居中',
  },
  {
    value: TopMenuAlignEnum.START,
    label: '居左',
  },
  {
    value: TopMenuAlignEnum.END,
    label: '居右',
  },
];

const menuTriggerOptions = [
  {
    value: TriggerEnum.NONE,
    label: '不显示',
  },
  {
    value: TriggerEnum.FOOTER,
    label: '底部',
  },
  {
    value: TriggerEnum.HEADER,
    label: '顶部',
  },
];

const routerTransitionOptions = [
  RouterTransitionEnum.ZOOM_FADE,
  RouterTransitionEnum.FADE,
  RouterTransitionEnum.ZOOM_OUT,
  RouterTransitionEnum.FADE_SIDE,
  RouterTransitionEnum.FADE_BOTTOM,
].map((item) => {
  return {
    label: item,
    value: item,
    key: item,
  };
});

interface SwitchOptions {
  config?: DeepPartial<ProjectConfig>;
  def?: any;
  disabled?: boolean;
  handler?: Fn;
}

interface SelectConfig {
  options?: SelectOptions;
  def?: any;
  disabled?: boolean;
  handler?: Fn;
}

export default defineComponent({
  name: 'SettingDrawer',
  setup(_, { attrs }) {
    const { createSuccessModal, createMessage } = useMessage();

    const getProjectConfigRef = computed(() => {
      return appStore.getProjectConfig;
    });

    const getIsHorizontalRef = computed(() => {
      return unref(getProjectConfigRef).menuSetting.mode === MenuModeEnum.HORIZONTAL;
    });

    const getShowHeaderRef = computed(() => {
      return unref(getProjectConfigRef).headerSetting.show;
    });

    const getShowMenuRef = computed(() => {
      return unref(getProjectConfigRef).menuSetting.show && !unref(getIsHorizontalRef);
    });

    const getShowTabsRef = computed(() => {
      return unref(getProjectConfigRef).multiTabsSetting.show;
    });

    function handleCopy() {
      const { isSuccessRef } = useCopyToClipboard(
        JSON.stringify(unref(getProjectConfigRef), null, 2)
      );
      unref(isSuccessRef) &&
        createSuccessModal({
          title: '操作成功',
          content: '复制成功,请到 src/settings/projectSetting.ts 中修改配置！',
        });
    }

    function renderSidebar() {
      const {
        headerSetting: { theme: headerTheme },
        menuSetting: { type, theme: menuTheme, split },
      } = unref(getProjectConfigRef);

      const typeList = ref([
        {
          title: '左侧菜单模式',
          mode: MenuModeEnum.INLINE,
          type: MenuTypeEnum.SIDEBAR,
          src: sidebarImg,
        },
        {
          title: '混合模式',
          mode: MenuModeEnum.INLINE,
          type: MenuTypeEnum.MIX,
          src: mixImg,
        },

        {
          title: '顶部菜单模式',
          mode: MenuModeEnum.HORIZONTAL,
          type: MenuTypeEnum.TOP_MENU,
          src: menuTopImg,
        },
      ]);
      return [
        <div class={`setting-drawer__siderbar`}>
          {unref(typeList).map((item) => {
            const { title, type: ItemType, mode, src } = item;
            return (
              <Tooltip title={title} placement="bottom" key={title}>
                {{
                  default: () => (
                    <div
                      onClick={baseHandler.bind(null, 'layout', {
                        mode: mode,
                        type: ItemType,
                        split: unref(getIsHorizontalRef) ? false : undefined,
                      })}
                    >
                      <CheckOutlined class={['check-icon', type === ItemType ? 'active' : '']} />
                      <img src={src} />
                    </div>
                  ),
                }}
              </Tooltip>
            );
          })}
        </div>,
        renderSwitchItem('分割菜单', {
          handler: (e) => {
            baseHandler('splitMenu', e);
          },
          def: split,
          disabled: !unref(getShowMenuRef) || type !== MenuTypeEnum.MIX,
        }),
        renderSelectItem('顶栏主题', {
          handler: (e) => {
            baseHandler('headerMenu', e);
          },
          def: headerTheme,
          options: themeOptions,
          disabled: !unref(getShowHeaderRef),
        }),
        renderSelectItem('菜单主题', {
          handler: (e) => {
            baseHandler('menuTheme', e);
          },
          def: menuTheme,
          options: themeOptions,
          disabled: !unref(getShowMenuRef),
        }),
      ];
    }
    /**
     * @description:
     */
    function renderFeatures() {
      const {
        contentMode,
        headerSetting: { fixed },
        menuSetting: {
          hasDrag,
          collapsed,
          showSearch,
          menuWidth,
          topMenuAlign,
          collapsedShowTitle,
          trigger,
        } = {},
      } = appStore.getProjectConfig;
      return [
        renderSwitchItem('侧边菜单拖拽', {
          handler: (e) => {
            baseHandler('hasDrag', e);
          },
          def: hasDrag,
          disabled: !unref(getShowMenuRef),
        }),
        renderSwitchItem('侧边菜单搜索', {
          handler: (e) => {
            baseHandler('showSearch', e);
          },
          def: showSearch,
          disabled: !unref(getShowMenuRef),
        }),
        renderSwitchItem('折叠菜单', {
          handler: (e) => {
            baseHandler('collapsed', e);
          },
          def: collapsed,
          disabled: !unref(getShowMenuRef),
        }),
        renderSwitchItem('折叠菜单显示名称', {
          handler: (e) => {
            baseHandler('collapsedShowTitle', e);
          },
          def: collapsedShowTitle,
          disabled: !unref(getShowMenuRef) || !collapsed,
        }),

        renderSwitchItem('固定header', {
          handler: (e) => {
            baseHandler('headerFixed', e);
          },
          def: fixed,
          disabled: !unref(getShowHeaderRef),
        }),
        renderSelectItem('顶部菜单布局', {
          handler: (e) => {
            baseHandler('topMenuAlign', e);
          },
          def: topMenuAlign,
          options: topMenuAlignOptions,
          disabled: !unref(getShowHeaderRef),
        }),
        renderSelectItem('菜单折叠按钮', {
          handler: (e) => {
            baseHandler('menuTrigger', e);
          },
          def: trigger,
          options: menuTriggerOptions,
        }),
        renderSelectItem('内容区域宽度', {
          handler: (e) => {
            baseHandler('contentMode', e);
          },
          def: contentMode,
          options: contentModeOptions,
        }),
        <div class={`setting-drawer__cell-item`}>
          <span>自动锁屏</span>
          <InputNumber
            style="width:120px"
            size="small"
            min={0}
            onChange={(e) => {
              baseHandler('lockTime', e);
            }}
            defaultValue={appStore.getProjectConfig.lockTime}
            formatter={(value: string) => {
              if (parseInt(value) === 0) {
                return '0(不自动锁屏)';
              }
              return `${value}分钟`;
            }}
          />
        </div>,
        <div class={`setting-drawer__cell-item`}>
          <span>菜单展开宽度</span>
          <InputNumber
            style="width:120px"
            size="small"
            max={600}
            min={100}
            step={10}
            disabled={!unref(getShowMenuRef)}
            defaultValue={menuWidth}
            formatter={(value: string) => `${parseInt(value)}px`}
            onChange={(e: any) => {
              baseHandler('menuWidth', e);
            }}
          />
        </div>,
      ];
    }
    function renderTransition() {
      const { routerTransition, openRouterTransition, openPageLoading } = appStore.getProjectConfig;

      return (
        <>
          {renderSwitchItem('页面切换loading', {
            handler: (e) => {
              baseHandler('openPageLoading', e);
            },
            def: openPageLoading,
          })}
          {renderSwitchItem('切换动画', {
            handler: (e) => {
              baseHandler('openRouterTransition', e);
            },
            def: openRouterTransition,
          })}
          {renderSelectItem('路由动画', {
            handler: (e) => {
              baseHandler('routerTransition', e);
            },
            def: routerTransition,
            options: routerTransitionOptions,
            disabled: !openRouterTransition,
          })}
        </>
      );
    }
    function renderContent() {
      const {
        grayMode,
        colorWeak,
        fullContent,
        showLogo,
        headerSetting: { show: showHeader },
        menuSetting: { show: showMenu },
        multiTabsSetting: { show: showMultiple, showQuick, showIcon: showTabIcon },
        showBreadCrumb,
        showBreadCrumbIcon,
      } = unref(getProjectConfigRef);
      return [
        renderSwitchItem('面包屑', {
          handler: (e) => {
            baseHandler('showBreadCrumb', e);
          },
          def: showBreadCrumb,
          disabled: !unref(getShowHeaderRef),
        }),
        renderSwitchItem('面包屑图标', {
          handler: (e) => {
            baseHandler('showBreadCrumbIcon', e);
          },
          def: showBreadCrumbIcon,
          disabled: !unref(getShowHeaderRef),
        }),
        renderSwitchItem('标签页', {
          handler: (e) => {
            baseHandler('showMultiple', e);
          },
          def: showMultiple,
        }),
        renderSwitchItem('标签页快捷按钮', {
          handler: (e) => {
            baseHandler('showQuick', e);
          },
          def: showQuick,
          disabled: !unref(getShowTabsRef),
        }),
        renderSwitchItem('标签页图标', {
          handler: (e) => {
            baseHandler('showTabIcon', e);
          },
          def: showTabIcon,
          disabled: !unref(getShowTabsRef),
        }),
        renderSwitchItem('左侧菜单', {
          handler: (e) => {
            baseHandler('showSidebar', e);
          },
          def: showMenu,
          disabled: unref(getIsHorizontalRef),
        }),
        renderSwitchItem('顶栏', {
          handler: (e) => {
            baseHandler('showHeader', e);
          },
          def: showHeader,
        }),
        renderSwitchItem('Logo', {
          handler: (e) => {
            baseHandler('showLogo', e);
          },
          def: showLogo,
        }),
        renderSwitchItem('全屏内容', {
          handler: (e) => {
            baseHandler('fullContent', e);
          },
          def: fullContent,
        }),
        renderSwitchItem('灰色模式', {
          handler: (e) => {
            baseHandler('grayMode', e);
          },
          def: grayMode,
        }),
        renderSwitchItem('色弱模式', {
          handler: (e) => {
            baseHandler('colorWeak', e);
          },
          def: colorWeak,
        }),
      ];
    }
    function baseHandler(event: string, value: any) {
      let config: DeepPartial<ProjectConfig> = {};
      if (event === 'layout') {
        const { mode, type, split } = value;
        const splitOpt = split === undefined ? { split } : {};
        let headerSetting = {};
        if (type === MenuTypeEnum.TOP_MENU) {
          headerSetting = {
            theme: MenuThemeEnum.DARK,
          };
        }
        config = {
          menuSetting: {
            mode,
            type,
            collapsed: false,
            show: true,
            ...splitOpt,
          },
          headerSetting,
        };
      }
      if (event === 'hasDrag') {
        config = {
          menuSetting: {
            hasDrag: value,
          },
        };
      }
      if (event === 'menuTrigger') {
        config = {
          menuSetting: {
            trigger: value,
          },
        };
      }
      if (event === 'openPageLoading') {
        config = {
          openPageLoading: value,
        };
      }
      if (event === 'topMenuAlign') {
        config = {
          menuSetting: {
            topMenuAlign: value,
          },
        };
      }
      if (event === 'showBreadCrumb') {
        config = {
          showBreadCrumb: value,
        };
      }
      if (event === 'showBreadCrumbIcon') {
        config = {
          showBreadCrumbIcon: value,
        };
      }
      if (event === 'collapsed') {
        config = {
          menuSetting: {
            collapsed: value,
          },
        };
      }
      if (event === 'menuWidth') {
        config = {
          menuSetting: {
            menuWidth: value,
          },
        };
      }
      if (event === 'collapsedShowTitle') {
        config = {
          menuSetting: {
            collapsedShowTitle: value,
          },
        };
      }
      if (event === 'lockTime') {
        config = {
          lockTime: value,
        };
      }
      if (event === 'showQuick') {
        config = {
          multiTabsSetting: {
            showQuick: value,
          },
        };
      }
      if (event === 'showTabIcon') {
        config = {
          multiTabsSetting: {
            showIcon: value,
          },
        };
      }
      if (event === 'contentMode') {
        config = {
          contentMode: value,
        };
      }
      if (event === 'menuTheme') {
        config = {
          menuSetting: {
            theme: value,
          },
        };
      }
      if (event === 'splitMenu') {
        config = {
          menuSetting: {
            split: value,
          },
        };
      }
      if (event === 'showMultiple') {
        config = {
          multiTabsSetting: {
            show: value,
          },
        };
      }
      if (event === 'headerMenu') {
        config = {
          headerSetting: {
            theme: value,
          },
        };
      }
      if (event === 'grayMode') {
        config = {
          grayMode: value,
        };
        updateGrayMode(value);
      }
      if (event === 'colorWeak') {
        config = {
          colorWeak: value,
        };
        updateColorWeak(value);
      }
      if (event === 'showLogo') {
        config = {
          showLogo: value,
        };
      }
      if (event === 'showSearch') {
        config = {
          menuSetting: {
            showSearch: value,
          },
        };
      }
      if (event === 'showSidebar') {
        config = {
          menuSetting: {
            show: value,
          },
        };
      }
      if (event === 'openRouterTransition') {
        config = {
          openRouterTransition: value,
        };
      }
      if (event === 'routerTransition') {
        config = {
          routerTransition: value,
        };
      }
      if (event === 'headerFixed') {
        config = {
          headerSetting: {
            fixed: value,
          },
        };
      }
      if (event === 'fullContent') {
        config = {
          fullContent: value,
        };
      }
      if (event === 'showHeader') {
        config = {
          headerSetting: {
            show: value,
          },
        };
      }
      appStore.commitProjectConfigState(config);
    }

    function handleResetSetting() {
      try {
        appStore.commitProjectConfigState(defaultSetting);
        const { colorWeak, grayMode } = defaultSetting;
        // updateTheme(themeColor);
        updateColorWeak(colorWeak);
        updateGrayMode(grayMode);
        createMessage.success('重置成功！');
      } catch (error) {
        createMessage.error(error);
      }
    }

    function handleClearAndRedo() {
      localStorage.clear();
      userStore.resumeAllState();
      location.reload();
    }

    function renderSelectItem(text: string, config?: SelectConfig) {
      const { handler, def, disabled = false, options } = config || {};
      const opt = def ? { value: def, defaultValue: def } : {};
      return (
        <div class={`setting-drawer__cell-item`}>
          <span>{text}</span>
          {/* @ts-ignore */}
          <Select
            {...opt}
            disabled={disabled}
            size="small"
            style={{ width: '120px' }}
            onChange={(e) => {
              handler && handler(e);
            }}
            options={options}
          />
        </div>
      );
    }

    function renderSwitchItem(text: string, options?: SwitchOptions) {
      const { handler, def, disabled = false } = options || {};
      const opt = def ? { checked: def } : {};
      return (
        <div class={`setting-drawer__cell-item`}>
          <span>{text}</span>
          <Switch
            {...opt}
            disabled={disabled}
            onChange={(e: any) => {
              handler && handler(e);
            }}
            checkedChildren="开"
            unCheckedChildren="关"
          />
        </div>
      );
    }
    return () => (
      <BasicDrawer {...attrs} title="项目配置" width={300} wrapClassName="setting-drawer">
        {{
          default: () => (
            <>
              <Divider>{() => '导航栏模式'}</Divider>
              {renderSidebar()}
              <Divider>{() => '界面功能'}</Divider>
              {renderFeatures()}
              <Divider>{() => '界面显示'}</Divider>
              {renderContent()}
              <Divider>{() => '切换动画'}</Divider>
              {renderTransition()}
              <Divider />
              <div class="setting-drawer__footer">
                <Button type="primary" block onClick={handleCopy}>
                  {() => (
                    <>
                      <CopyOutlined class="mr-2" />
                      拷贝
                    </>
                  )}
                </Button>
                <Button block class="mt-2" onClick={handleResetSetting} color="warning">
                  {() => (
                    <>
                      <RedoOutlined class="mr-2" />
                      重置
                    </>
                  )}
                </Button>
                <Button block class="mt-2" onClick={handleClearAndRedo} color="error">
                  {() => (
                    <>
                      <RedoOutlined class="mr-2" />
                      清空缓存并返回登录页
                    </>
                  )}
                </Button>
              </div>
            </>
          ),
        }}
      </BasicDrawer>
    );
  },
});
