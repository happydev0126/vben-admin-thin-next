import type { Router } from 'vue-router';

import { useSetting } from '/@/hooks/core/useSetting';

/**
 * 设置页面标题
 * @param {*} title  :页面标题
 */
const setDocumentTitle = (title: string) => {
  document.title = title;
  const ua = navigator.userAgent;
  const regex = /\bMicroMessenger\/([\d.]+)/;
  // 兼容
  if (regex.test(ua) && /ip(hone|od|ad)/i.test(ua)) {
    const i = document.createElement('iframe');
    i.src = '/favicon.ico';
    i.style.display = 'none';
    i.onload = function () {
      setTimeout(function () {
        i.remove();
      }, 9);
    };
    document.body.appendChild(i);
  }
};
export const createPageTitleGuard = (router: Router) => {
  router.beforeEach(async (to) => {
    // This operation does not require synchronization
    setTimeout(() => {
      const { globSetting } = useSetting();
      if (to.meta.title) {
        const { title } = globSetting;
        const _title = to.meta.title ? ` ${to.meta.title}-${title} ` : `${title}`;
        setDocumentTitle(_title);
      }
    }, 30);
    return true;
  });
};
