
export const html = ({ el, get, effect }) => {
  effect(() => {
    el.innerHTML = get()
  })
}
