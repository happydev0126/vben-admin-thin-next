import type { SorterResult } from './types/table';

export const ROW_KEY = 'key';

// 可选的每页显示条数;
export const PAGE_SIZE_OPTIONS = ['10', '50', '80', '100'];

// 每页显示条数
export const PAGE_SIZE = ~~PAGE_SIZE_OPTIONS[0];

// 通用接口字段设置
// 支持 xxx.xxx.xxx格式
export const FETCH_SETTING = {
  // 传给后台的当前页字段名
  pageField: 'page',
  // 传给后台的每页显示记录数字段名
  sizeField: 'pageSize',
  // 接口返回的表格数据字段名
  listField: 'items',
  // 接口返回的表格总数字段名
  totalField: 'total',
};

// 配置通用排序函数
export function DEFAULT_SORT_FN(sortInfo: SorterResult) {
  const { field, order } = sortInfo;
  return {
    // 传给后台的排序字段你
    field,
    // 传给后台的排序方式  asc/desc
    order,
  };
}

export function DEFAULT_FILTER_FN(data: Partial<Recordable<string[]>>) {
  return data;
}

//  表格单元格默认布局
export const DEFAULT_ALIGN = 'center';

export const INDEX_COLUMN_FLAG = 'INDEX';
export const ACTION_COLUMN_FLAG = 'ACTION';
