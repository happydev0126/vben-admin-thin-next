import type { ColEx } from '../types';
import type { AdvanceState } from '../types/hooks';
import { ComputedRef, Ref } from 'vue';
import type { FormProps, FormSchema } from '../types/form';

import { computed, unref, watch } from 'vue';
import { isBoolean, isFunction, isNumber, isObject } from '/@/utils/is';

import { useBreakpoint } from '/@/hooks/event/useBreakpoint';

const BASIC_COL_LEN = 24;

interface UseAdvancedContext {
  advanceState: AdvanceState;
  emit: EmitType;
  getMergePropsRef: ComputedRef<FormProps>;
  getProps: ComputedRef<FormProps>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: any;
  defaultValueRef: Ref<any>;
}

export default function ({
  advanceState,
  emit,
  getMergePropsRef,
  getProps,
  getSchema,
  formModel,
  defaultValueRef,
}: UseAdvancedContext) {
  const { realWidthRef, screenEnum, screenRef } = useBreakpoint();
  const getEmptySpanRef = computed((): number => {
    if (!advanceState.isAdvanced) {
      return 0;
    }
    const emptySpan = unref(getMergePropsRef).emptySpan || 0;

    if (isNumber(emptySpan)) {
      return emptySpan;
    }
    if (isObject(emptySpan)) {
      const { span = 0 } = emptySpan;
      const screen = unref(screenRef) as string;

      const screenSpan = (emptySpan as any)[screen.toLowerCase()];
      return screenSpan || span || 0;
    }
    return 0;
  });

  const getActionPropsRef = computed(() => {
    const {
      resetButtonOptions,
      submitButtonOptions,
      showActionButtonGroup,
      showResetButton,
      showSubmitButton,
      showAdvancedButton,
      actionColOptions,
    } = unref(getProps);
    return {
      resetButtonOptions,
      submitButtonOptions,
      show: showActionButtonGroup,
      showResetButton,
      showSubmitButton,
      showAdvancedButton,
      actionColOptions,
    };
  });

  watch(
    [() => unref(getSchema), () => advanceState.isAdvanced, () => unref(realWidthRef)],
    () => {
      const { showAdvancedButton } = unref(getProps);
      if (showAdvancedButton) {
        updateAdvanced();
      }
    },
    { immediate: true }
  );

  function getAdvanced(itemCol: Partial<ColEx>, itemColSum = 0, isLastAction = false) {
    const width = unref(realWidthRef);

    const mdWidth =
      parseInt(itemCol.md as string) ||
      parseInt(itemCol.xs as string) ||
      parseInt(itemCol.sm as string) ||
      (itemCol.span as number) ||
      BASIC_COL_LEN;
    const lgWidth = parseInt(itemCol.lg as string) || mdWidth;
    const xlWidth = parseInt(itemCol.xl as string) || lgWidth;
    const xxlWidth = parseInt(itemCol.xxl as string) || xlWidth;
    if (width <= screenEnum.LG) {
      itemColSum += mdWidth;
    } else if (width < screenEnum.XL) {
      itemColSum += lgWidth;
    } else if (width < screenEnum.XXL) {
      itemColSum += xlWidth;
    } else {
      itemColSum += xxlWidth;
    }
    if (isLastAction) {
      advanceState.hideAdvanceBtn = false;
      if (itemColSum <= BASIC_COL_LEN * 2) {
        // 小于等于2行时，不显示收起展开按钮
        advanceState.hideAdvanceBtn = true;
        advanceState.isAdvanced = true;
      } else if (
        itemColSum > BASIC_COL_LEN * 2 &&
        itemColSum <= BASIC_COL_LEN * (unref(getMergePropsRef).autoAdvancedLine || 3)
      ) {
        advanceState.hideAdvanceBtn = false;

        // 大于3行默认收起
      } else if (!advanceState.isLoad) {
        advanceState.isLoad = true;
        advanceState.isAdvanced = !advanceState.isAdvanced;
      }
      return { isAdvanced: advanceState.isAdvanced, itemColSum };
    }
    if (itemColSum > BASIC_COL_LEN) {
      return { isAdvanced: advanceState.isAdvanced, itemColSum };
    } else {
      // 第一行始终显示
      return { isAdvanced: true, itemColSum };
    }
  }

  function updateAdvanced() {
    let itemColSum = 0;
    let realItemColSum = 0;
    for (const schema of unref(getSchema)) {
      const { show, colProps } = schema;
      let isShow = true;

      if (isBoolean(show)) {
        isShow = show;
      }

      if (isFunction(show)) {
        isShow = show({
          schema: schema,
          model: formModel,
          field: schema.field,
          values: {
            ...unref(defaultValueRef),
            ...formModel,
          },
        });
      }

      if (isShow && colProps) {
        const { itemColSum: sum, isAdvanced } = getAdvanced(colProps, itemColSum);

        itemColSum = sum || 0;
        if (isAdvanced) {
          realItemColSum = itemColSum;
        }
        schema.isAdvanced = isAdvanced;
      }
    }

    advanceState.actionSpan = (realItemColSum % BASIC_COL_LEN) + unref(getEmptySpanRef);

    getAdvanced(
      unref(getActionPropsRef).actionColOptions || { span: BASIC_COL_LEN },
      itemColSum,
      true
    );

    emit('advanced-change');
  }

  function handleToggleAdvanced() {
    advanceState.isAdvanced = !advanceState.isAdvanced;
  }
  return { getActionPropsRef, handleToggleAdvanced };
}
