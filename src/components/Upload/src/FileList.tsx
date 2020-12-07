import { defineComponent, CSSProperties } from 'vue';
import { fileListProps } from './props';
import { isFunction } from '/@/utils/is';
import './FileList.less';

export default defineComponent({
  name: 'FileList',
  props: fileListProps,
  setup(props) {
    return () => {
      const { columns, actionColumn, dataSource } = props;

      const columnList = [...columns, actionColumn];
      return (
        <table class="file-table">
          <colgroup>
            {columnList.map((item) => {
              const { width = 0, dataIndex } = item;

              const style: CSSProperties = {
                width: `${width}px`,
                minWidth: `${width}px`,
              };

              return <col style={width ? style : {}} key={dataIndex} />;
            })}
          </colgroup>
          <thead>
            <tr class="file-table-tr">
              {columnList.map((item) => {
                const { title = '', align = 'center', dataIndex } = item;
                return (
                  <th class={['file-table-th', align]} key={dataIndex}>
                    {title}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {dataSource.map((record = {}) => {
              return (
                <tr class="file-table-tr" key={record.uuid}>
                  {columnList.map((item) => {
                    const { dataIndex = '', customRender, align = 'center' } = item;
                    const render = customRender && isFunction(customRender);
                    return (
                      <td class={['file-table-td', align]} key={dataIndex}>
                        {render
                          ? customRender?.({ text: record[dataIndex], record })
                          : record[dataIndex]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    };
  },
});
