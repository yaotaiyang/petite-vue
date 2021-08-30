import {  createContext } from './context'
import { walk } from './walk'
import { remove } from './utils'
import { stop } from './reactive'

export class Block {
  template
  ctx
  key
  parentCtx
  isFragment
  start
  end
  get el() {
    return this.start || (this.template)
  }

  constructor(template, parentCtx, isRoot = false) {
    this.isFragment = template instanceof HTMLTemplateElement

    if (isRoot) {
      this.template = template
    } else if (this.isFragment) {
      this.template = (template).content.cloneNode(
        true
      ) 
    } else {
      this.template = template.cloneNode(true)
    }

    if (isRoot) {
      this.ctx = parentCtx
    } else {
      // create child context
      this.parentCtx = parentCtx
      parentCtx.blocks.push(this)
      this.ctx = createContext(parentCtx)
    }

    walk(this.template, this.ctx)
  }

  insert(parent, anchor) {
    if (this.isFragment) {
      if (this.start) {
        // already inserted, moving
        let node = this.start
        let next
        while (node) {
          next = node.nextSibling
          parent.insertBefore(node, anchor)
          if (node === this.end) break
          node = next
        }
      } else {
        this.start = new Text('')
        this.end = new Text('')
        parent.insertBefore(this.end, anchor)
        parent.insertBefore(this.start, this.end)
        parent.insertBefore(this.template, this.end)
      }
    } else {
      parent.insertBefore(this.template, anchor)
    }
  }

  remove() {
    if (this.parentCtx) {
      remove(this.parentCtx.blocks, this)
    }
    if (this.start) {
      const parent = this.start.parentNode
      let node= this.start
      let next 
      while (node) {
        next = node.nextSibling
        parent.removeChild(node)
        if (node === this.end) break
        node = next
      }
    } else {
      this.template.parentNode.removeChild(this.template)
    }
    this.teardown()
  }

  teardown() {
    this.ctx.blocks.forEach((child) => {
      child.teardown()
    })
    this.ctx.effects.forEach(stop)
    this.ctx.cleanups.forEach((fn) => fn())
  }
}
