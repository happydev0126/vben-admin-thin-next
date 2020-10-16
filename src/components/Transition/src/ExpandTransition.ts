/**
 * Makes the first character of a string uppercase
 */
export function upperFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface HTMLExpandElement extends HTMLElement {
  _parent?: (Node & ParentNode & HTMLElement) | null;
  _initialStyle: {
    transition: string;
    visibility: string | null;
    overflow: string | null;
    height?: string | null;
    width?: string | null;
  };
}

export default function (expandedParentClass = '', x = false) {
  const sizeProperty = x ? 'width' : ('height' as 'width' | 'height');
  const offsetProperty = `offset${upperFirst(sizeProperty)}` as 'offsetHeight' | 'offsetWidth';

  return {
    beforeEnter(el: HTMLExpandElement) {
      el._parent = el.parentNode as (Node & ParentNode & HTMLElement) | null;
      el._initialStyle = {
        transition: el.style.transition,
        visibility: el.style.visibility,
        overflow: el.style.overflow,
        [sizeProperty]: el.style[sizeProperty],
      };
    },

    enter(el: HTMLExpandElement) {
      const initialStyle = el._initialStyle;
      const offset = `${el[offsetProperty]}px`;

      el.style.setProperty('transition', 'none', 'important');
      el.style.visibility = 'hidden';
      el.style.visibility = initialStyle.visibility!;
      el.style.overflow = 'hidden';
      el.style[sizeProperty] = '0';
      /* eslint-disable-next-line */
      void el.offsetHeight; // force reflow

      el.style.transition = initialStyle.transition;

      if (expandedParentClass && el._parent) {
        el._parent.classList.add(expandedParentClass);
      }
      console.log('======================');
      console.log(sizeProperty, offset);
      console.log('======================');
      requestAnimationFrame(() => {
        el.style[sizeProperty] = offset;
      });
    },

    afterEnter: resetStyles,
    enterCancelled: resetStyles,

    leave(el: HTMLExpandElement) {
      el._initialStyle = {
        transition: '',
        visibility: '',
        overflow: el.style.overflow,
        [sizeProperty]: el.style[sizeProperty],
      };

      el.style.overflow = 'hidden';
      el.style[sizeProperty] = `${el[offsetProperty]}px`;
      /* eslint-disable-next-line */
      void el.offsetHeight; // force reflow

      requestAnimationFrame(() => (el.style[sizeProperty] = '0'));
    },

    afterLeave,
    leaveCancelled: afterLeave,
  };

  function afterLeave(el: HTMLExpandElement) {
    if (expandedParentClass && el._parent) {
      el._parent.classList.remove(expandedParentClass);
    }
    resetStyles(el);
  }

  function resetStyles(el: HTMLExpandElement) {
    const size = el._initialStyle[sizeProperty];
    el.style.overflow = el._initialStyle.overflow!;
    if (size != null) el.style[sizeProperty] = size;
    Reflect.deleteProperty(el, '_initialStyle');
  }
}
