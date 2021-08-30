

export const ref = ({
  el,
  ctx: {
    scope: { $refs }
  },
  get,
  effect
}) => {
  let prevRef
  effect(() => {
    const ref = get()
    $refs[ref] = el
    if (prevRef && ref !== prevRef) {
      delete $refs[prevRef]
    }
    prevRef = ref
  })
  return () => {
    prevRef && delete $refs[prevRef]
  }
}