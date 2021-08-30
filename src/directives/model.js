import { isArray, looseEqual, looseIndexOf, toNumber } from '../utils'
import { listen } from '../utils'

export const model = ({ el, exp, get, effect, modifiers }) => {
  const type = el.type
  const assign = get(`(val) => { ${exp} = val }`)
  const { trim, number = type === 'number' } = modifiers || {}

  if (el.tagName === 'SELECT') {
    const sel = el
    listen(el, 'change', () => {
      const selectedVal = Array.prototype.filter
        .call(sel.options, (o) => o.selected)
        .map((o) =>
          number ? toNumber(getValue(o)) : getValue(o)
        )
      assign(sel.multiple ? selectedVal : selectedVal[0])
    })
    effect(() => {
      const value = get()
      const isMultiple = sel.multiple
      for (let i = 0, l = sel.options.length; i < l; i++) {
        const option = sel.options[i]
        const optionValue = getValue(option)
        if (isMultiple) {
          if (isArray(value)) {
            option.selected = looseIndexOf(value, optionValue) > -1
          } else {
            option.selected = value.has(optionValue)
          }
        } else {
          if (looseEqual(getValue(option), value)) {
            if (sel.selectedIndex !== i) sel.selectedIndex = i
            return
          }
        }
      }
      if (!isMultiple && sel.selectedIndex !== -1) {
        sel.selectedIndex = -1
      }
    })
  } else if (type === 'checkbox') {
    listen(el, 'change', () => {
      const modelValue = get()
      const checked = (el).checked
      if (isArray(modelValue)) {
        const elementValue = getValue(el)
        const index = looseIndexOf(modelValue, elementValue)
        const found = index !== -1
        if (checked && !found) {
          assign(modelValue.concat(elementValue))
        } else if (!checked && found) {
          const filtered = [...modelValue]
          filtered.splice(index, 1)
          assign(filtered)
        }
      } else {
        assign(getCheckboxValue(el, checked))
      }
    })

    let oldValue
    effect(() => {
      const value = get()
      if (isArray(value)) {
        ;(el).checked =
          looseIndexOf(value, getValue(el)) > -1
      } else if (value !== oldValue) {
        ;(el).checked = looseEqual(
          value,
          getCheckboxValue(el, true)
        )
      }
      oldValue = value
    })
  } else if (type === 'radio') {
    listen(el, 'change', () => {
      assign(getValue(el))
    })
    let oldValue
    effect(() => {
      const value = get()
      if (value !== oldValue) {
        ;(el).checked = looseEqual(value, getValue(el))
      }
    })
  } else {
    // text-like
    const resolveValue = (val) => {
      if (trim) return val.trim()
      if (number) return toNumber(val)
      return val
    }

    listen(el, 'compositionstart', onCompositionStart)
    listen(el, 'compositionend', onCompositionEnd)
    listen(el, modifiers?.lazy ? 'change' : 'input', () => {
      if ((el).composing) return
      assign(resolveValue(el.value))
    })
    if (trim) {
      listen(el, 'change', () => {
        el.value = el.value.trim()
      })
    }

    effect(() => {
      if ((el).composing) {
        return
      }
      const curVal = el.value
      const newVal = get()
      if (document.activeElement === el && resolveValue(curVal) === newVal) {
        return
      }
      if (curVal !== newVal) {
        el.value = newVal
      }
    })
  }
}

const getValue = (el) => ('_value' in el ? el._value : el.value)

// retrieve raw value for true-value and false-value set via :true-value or :false-value bindings
const getCheckboxValue = (
  el,
  checked
) => {
  const key = checked ? '_trueValue' : '_falseValue'
  return key in el ? el[key] : checked
}

const onCompositionStart = (e) => {
  ;(e.target).composing = true
}

const onCompositionEnd = (e) => {
  const target = e.target 
  if (target.composing) {
    target.composing = false
    trigger(target, 'input')
  }
}

const trigger = (el, type) => {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}
