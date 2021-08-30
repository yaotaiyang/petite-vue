import { hyphenate } from '../utils'
import { listen } from '../utils'
import { nextTick } from '../scheduler'

// same as vue 2
const simplePathRE =
  /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/

const systemModifiers = ['ctrl', 'shift', 'alt', 'meta']


const modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !(e).ctrlKey,
  shift: (e) => !(e).shiftKey,
  alt: (e) => !(e).altKey,
  meta: (e) => !(e).metaKey,
  left: (e) => 'button' in e && (e).button !== 0,
  middle: (e) => 'button' in e && (e).button !== 1,
  right: (e) => 'button' in e && (e).button !== 2,
  exact: (e, modifiers) =>
    systemModifiers.some((m) => (e)[`${m}Key`] && !modifiers[m])
}

export const on = ({ el, get, exp, arg, modifiers }) => {
  
  if (!arg) {
    if (import.meta.env.DEV) {
      console.error(`v-on="obj" syntax is not supported in petite-vue.`)
    }
    return
  }

  let handler = simplePathRE.test(exp)
    ? get(`(e => ${exp}(e))`)
    : get(`($event => { ${exp} })`)

  // special lifecycle events
  if (arg === 'mounted') {
    nextTick(handler)
    return
  } else if (arg === 'unmounted') {
    return () => handler()
  }

  if (modifiers) {
    // map modifiers
    if (arg === 'click') {
      if (modifiers.right) arg = 'contextmenu'
      if (modifiers.middle) arg = 'mouseup'
    }

    const raw = handler
    handler = (e) => {
      if ('key' in e && !(hyphenate((e).key) in modifiers)) {
        return
      }
      for (const key in modifiers) {
        const guard = modifierGuards[key]
        if (guard && guard(e, modifiers)) {
          return
        }
      }
      return raw(e)
    }
  }
  console.log(arg,modifiers)
  listen(el, arg, handler, modifiers)
}
