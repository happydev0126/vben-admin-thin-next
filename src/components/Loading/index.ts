import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
export const Loading = createAsyncComponent(() => import('./src/index.vue'));

export { useLoading } from './src/useLoading';
export { createLoading } from './src/createLoading';
