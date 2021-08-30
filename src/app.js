import { reactive } from './reactive'
import { Block } from './block'
import { createContext } from './context'
import { toDisplayString } from './directives/text'
import { nextTick } from './scheduler'

export const createApp = (initialData) => {
  // root context
  const ctx = createContext()
  if (initialData) {
    ctx.scope = reactive(initialData)
  }

  // global internal helpers
  ctx.scope.$s = toDisplayString
  ctx.scope.$nextTick = nextTick
  ctx.scope.$refs = Object.create(null)

  let rootBlocks=[]

  return {
    directive(name, def) {
      if (def) {
        ctx.dirs[name] = def
        return this
      } else {
        return ctx.dirs[name]
      }
    },

    mount(el) {
      if (typeof el === 'string') {
        el = document.querySelector(el)
        if (!el) {
          import.meta.env.DEV &&
            console.error(`selector ${el} has no matching element.`)
          return
        }
      }

      el = el || document.documentElement
      let roots=[]
      if (el.hasAttribute('v-scope')) {
        roots = [el]
      } else {
        roots = [...el.querySelectorAll(`[v-scope]`)].filter(
          (root) => !root.matches(`[v-scope] [v-scope]`)
        )
      }
      if (!roots.length) {
        roots = [el]
      }

      if (
        import.meta.env.DEV &&
        roots.length === 1 &&
        roots[0] === document.documentElement
      ) {
        console.warn(
          `Mounting on documentElement - this is non-optimal as petite-vue ` +
            `will be forced to crawl the entire page's DOM. ` +
            `Consider explicitly marking elements controlled by petite-vue ` +
            `with \`v-scope\`.`
        )
      }

      rootBlocks = roots.map((el) => new Block(el, ctx, true))
      // remove all v-cloak after mount
      ;[el, ...el.querySelectorAll(`[v-cloak]`)].forEach((el) =>
        el.removeAttribute('v-cloak')
      )
      return this
    },

    unmount() {
      rootBlocks.forEach((block) => block.teardown())
    }
  }
}
