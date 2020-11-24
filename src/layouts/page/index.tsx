import type { FunctionalComponent } from 'vue';

import { computed, defineComponent, unref, Transition, KeepAlive } from 'vue';
import { RouterView, RouteLocation } from 'vue-router';

import FrameLayout from '/@/layouts/iframe/index.vue';

import { useTransition } from './useTransition';
import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { useMultipleTabSetting } from '/@/hooks/setting/useMultipleTabSetting';

import { tabStore } from '/@/store/modules/tab';
import { useTransitionSetting } from '/@/hooks/setting/useTransitionSetting';

interface DefaultContext {
  Component: FunctionalComponent;
  route: RouteLocation;
}

export default defineComponent({
  name: 'PageLayout',
  setup() {
    const { getShowMenu } = useMenuSetting();
    const { getOpenKeepAlive, getCanEmbedIFramePage } = useRootSetting();

    const { getBasicTransition, getEnableTransition } = useTransitionSetting();

    const { getMax } = useMultipleTabSetting();

    const transitionEvent = useTransition();

    const openCacheRef = computed(() => unref(getOpenKeepAlive) && unref(getShowMenu));

    const getCacheTabsRef = computed(() => tabStore.getKeepAliveTabsState as string[]);

    return () => {
      return (
        <div>
          <RouterView>
            {{
              default: ({ Component, route }: DefaultContext) => {
                // No longer show animations that are already in the tab
                const cacheTabs = unref(getCacheTabsRef);
                const isInCache = cacheTabs.includes(route.name as string);
                const name = isInCache && route.meta.inTab ? 'fade-slide' : null;

                const renderComp = () => <Component key={route.fullPath} />;

                const PageContent = unref(openCacheRef) ? (
                  <KeepAlive max={unref(getMax)} include={cacheTabs}>
                    {renderComp()}
                  </KeepAlive>
                ) : (
                  renderComp()
                );

                return unref(getEnableTransition) ? (
                  <Transition
                    {...transitionEvent}
                    name={name || route.meta.transitionName || unref(getBasicTransition)}
                    mode="out-in"
                    appear={true}
                  >
                    {() => PageContent}
                  </Transition>
                ) : (
                  PageContent
                );
              },
            }}
          </RouterView>
          {unref(getCanEmbedIFramePage) && <FrameLayout />}
        </div>
      );
    };
  },
});
