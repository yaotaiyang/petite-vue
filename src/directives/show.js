export const show = ({ el, get, effect }) => {
  const initialDisplay = el.style.display
  effect(() => {
    el.style.display = get() ? initialDisplay : 'none'
  })
}
