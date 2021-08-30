export { createApp } from './app.js'
export { nextTick } from './scheduler'
export { reactive } from './reactive'

import { createApp } from './app'

let s
if ((s = document.currentScript) && s.hasAttribute('init')) {
  createApp().mount()
}