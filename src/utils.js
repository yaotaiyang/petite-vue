export const checkAttr = (el, name) => {
    const val = el.getAttribute(name)
    if (val != null) el.removeAttribute(name)
    return val
  }
  
 const listen = (
    el,
    event,
    handler,
    options
  ) => {
    el.addEventListener(event, handler, options)
  
  }

const isString = (val) => typeof val === 'string';
const isArray = Array.isArray;
const isObject = (val) => val !== null && typeof val === 'object';
const isDate = (val) => val instanceof Date;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
      arr.splice(i, 1);
  }
}
const toNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
};
const cacheStringFunction = (fn) => {
  const cache = Object.create(null);
  return ((str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
  });
};
const hyphenateRE = /\B([A-Z])/g;
/**
 * @private
 */
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());

function normalizeClass(value) {
  let res = '';
  if (isString(value)) {
      res = value;
  }
  else if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
          const normalized = normalizeClass(value[i]);
          if (normalized) {
              res += normalized + ' ';
          }
      }
  }
  else if (isObject(value)) {
      for (const name in value) {
          if (value[name]) {
              res += name + ' ';
          }
      }
  }
  return res.trim();
}
function normalizeStyle(value) {
  if (isArray(value)) {
      const res = {};
      for (let i = 0; i < value.length; i++) {
          const item = value[i];
          const normalized = isString(item)
              ? parseStringStyle(item)
              : normalizeStyle(item);
          if (normalized) {
              for (const key in normalized) {
                  res[key] = normalized[key];
              }
          }
      }
      return res;
  }
  else if (isString(value)) {
      return value;
  }
  else if (isObject(value)) {
      return value;
  }
}
function looseEqual(a, b) {
    if (a === b)
        return true;
    let aValidType = isDate(a);
    let bValidType = isDate(b);
    if (aValidType || bValidType) {
        return aValidType && bValidType ? a.getTime() === b.getTime() : false;
    }
    aValidType = isArray(a);
    bValidType = isArray(b);
    if (aValidType || bValidType) {
        return aValidType && bValidType ? looseCompareArrays(a, b) : false;
    }
    aValidType = isObject(a);
    bValidType = isObject(b);
    if (aValidType || bValidType) {
        /* istanbul ignore if: this if will probably never be called */
        if (!aValidType || !bValidType) {
            return false;
        }
        const aKeysCount = Object.keys(a).length;
        const bKeysCount = Object.keys(b).length;
        if (aKeysCount !== bKeysCount) {
            return false;
        }
        for (const key in a) {
            const aHasKey = a.hasOwnProperty(key);
            const bHasKey = b.hasOwnProperty(key);
            if ((aHasKey && !bHasKey) ||
                (!aHasKey && bHasKey) ||
                !looseEqual(a[key], b[key])) {
                return false;
            }
        }
    }
    return String(a) === String(b);
}
function looseIndexOf(arr, val) {
    return arr.findIndex(item => looseEqual(item, val));
}
export const extend = Object.assign;
const isMap = (val) => toTypeString(val) === '[object Map]';
const isSet = (val) => toTypeString(val) === '[object Set]';
const isSymbol = (val) => typeof val === 'symbol';
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isIntegerKey = (key) => isString(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key;
export {isIntegerKey,hasOwn,remove,listen,hyphenate,normalizeClass,normalizeStyle,isArray,isString,isObject,looseEqual,looseIndexOf,toNumber,isSymbol,isMap,isSet}