import { effect as rawEffect, reactive } from './reactive'
import { queueJob } from './scheduler'
import { inOnce } from './walk'


export const createContext = (parent) => {
  const ctx = {
    ...parent,
    scope: parent ? parent.scope : reactive({}),
    dirs: parent ? parent.dirs : {},
    effects: [],
    blocks: [],
    cleanups: [],
    effect: (fn) => {
      if (inOnce) {
        queueJob(fn)
        return fn 
      }
      const e = rawEffect(fn, {
        scheduler: () => queueJob(fn)
      })
      ctx.effects.push(e)
      return e
    }
  }
  return ctx
}

export const createScopedContext = (ctx, data = {}) => {
  const parentScope = ctx.scope
  const mergedScope = Object.create(parentScope)
  Object.defineProperties(mergedScope, Object.getOwnPropertyDescriptors(data))
  mergedScope.$refs = Object.create(parentScope.$refs)
  const reactiveProxy = reactive(
    new Proxy(mergedScope, {
      set(target, key, val, receiver) {
        // when setting a property that doesn't exist on current scope,
        // do not create it on the current scope and fallback to parent scope.
        if (receiver === reactiveProxy && !target.hasOwnProperty(key)) {
          return Reflect.set(parentScope, key, val)
        }
        return Reflect.set(target, key, val, receiver)
      }
    })
  )
  return {
    ...ctx,
    scope: reactiveProxy
  }
}
