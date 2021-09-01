import { isObject } from "./utils";
import { effect,track,trigger } from "./effect";
const reactiveMap = new WeakMap();
const mutableHandlers = {
  get:function(target, key, receiver){ // receiver是proxy实例
    const res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      // 把内部所有的是 object 的值都用 reactive 包裹，变成响应式对象
      // 如果说这个 res 值是一个对象的话，那么我们需要把获取到的 res 也转换成 reactive
      // res 等于 target[key]
      return reactive(res);
    }
      // 在触发 get 的时候进行依赖收集
    track(target, "get", key);
    return res;
  },
  set:function(target, key, value,receiver){
    const result = Reflect.set(target, key, value, receiver);
    // 在触发 set 的时候进行触发依赖
    trigger(target, "get", key);
    return result;
  }
};

function stop(runner) {
  runner.effect.stop();
}
function reactive(target) {
  return createReactiveObject(target, reactiveMap);
}
function createReactiveObject(target, proxyMap) {
  // 核心就是 proxy
  // 目的是可以侦听到用户 get 或者 set 的动作
  // 如果命中的话就直接返回就好了
  // 使用缓存做的优化点
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, mutableHandlers);
  // 把创建好的 proxy 给存起来，
  proxyMap.set(target, proxy);
  return proxy;
}

export{effect,stop,reactive,trigger}