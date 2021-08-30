import { isObject } from '../utils'

export const text= ({ el, get, effect }) => {
  effect(() => {
    el.textContent = toDisplayString(get())
  })
}

export const toDisplayString = (value) =>
  value == null
    ? ''
    : isObject(value)
    ? JSON.stringify(value, null, 2)
    : String(value)
