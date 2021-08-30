const evalCache = Object.create(null)

export const evaluate = (scope, exp, el) =>
  execute(scope, `return(${exp})`, el)

export const execute = (scope, exp, el) => {
  const fn = evalCache[exp] || (evalCache[exp] = toFunction(exp))
  try {
    return fn(scope, el)
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn(`Error when evaluating expression "${exp}":`)
    }
    console.error(e)
  }
}

const toFunction = (exp) => {
  try {
    return new Function(`$data`, `$el`, `with($data){${exp}}`)
  } catch (e) {
    console.error(`${e.message} in expression: ${exp}`)
    return () => {}
  }
}
