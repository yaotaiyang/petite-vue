import { Block } from '../block'
import { evaluate } from '../eval'
import { checkAttr } from '../utils'

export const _if = (el, exp, ctx) => {
  if (import.meta.env.DEV && !exp.trim()) {
    console.warn(`v-if expression cannot be empty.`)
  }

  const parent = el.parentElement
  const anchor = new Comment('v-if')
  parent.insertBefore(anchor, el) // newItem,existingItem

  //存储其他条件分支
  const branches = [
    {
      exp,
      el
    }
  ]

  // locate else branch
  let elseEl
  let elseExp
  // 全部移除
  while ((elseEl = el.nextElementSibling)) {
    elseExp = null
    if (
      checkAttr(elseEl, 'v-else') === '' ||
      (elseExp = checkAttr(elseEl, 'v-else-if'))
    ) {
      parent.removeChild(elseEl)
      branches.push({ exp: elseExp, el: elseEl })
    } else {
      break
    }
  }

  const nextNode = el.nextSibling
  parent.removeChild(el)

  let block
  let activeBranchIndex = -1

  const removeActiveBlock = () => {
    if (block) {
      parent.insertBefore(anchor, block.el)
      block.remove()
      block = undefined
    }
  }

  ctx.effect(() => {
    for (let i = 0; i < branches.length; i++) {
      const { exp, el } = branches[i]
      if (!exp || evaluate(ctx.scope, exp)) {
        if (i !== activeBranchIndex) {
          removeActiveBlock()
          block = new Block(el, ctx)
          block.insert(parent, anchor)
          parent.removeChild(anchor)
          activeBranchIndex = i
        }
        return
      }
    }
    // no matched branch.
    activeBranchIndex = -1
    removeActiveBlock()
  })

  return nextNode
}
