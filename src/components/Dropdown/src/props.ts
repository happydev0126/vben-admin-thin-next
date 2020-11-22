import type { PropType } from 'vue';
import type { DropMenu } from './types';

export const dropdownProps = {
  /**
   * the trigger mode which executes the drop-down action
   * @default ['hover']
   * @type string[]
   */
  trigger: {
    type: [Array] as PropType<string[]>,
    default: () => {
      return ['contextmenu'];
    },
  },
};
export const basicDropdownProps = Object.assign({}, dropdownProps, {
  dropMenuList: {
    type: Array as PropType<DropMenu[]>,
    default: () => [],
  },
  selectedKeys: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});
