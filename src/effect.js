import { extend,isArray } from './utils'
let activeEffect;
let activeEffectScope;
const targetMap = new WeakMap();
const createDep = (effects) => {
    const dep = new Set(effects);
    return dep;
};
export class ReactiveEffect {
    active = true;
    deps = [];
    constructor(fn, scheduler,scope) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.active = true;
      this.deps = [];
      recordEffectScope(this, scope);
      console.log("创建 ReactiveEffect 对象");
    }
    run() {
      // 执行的时候给全局的 activeEffect 赋值
      // 利用全局属性来获取当前的 effect
      activeEffect = this;
      // 执行用户传入的 fn
      console.log("执行用户传入的 fn");
      return this.fn();
    }
  
    stop() {
      if (this.active) {
        // 如果第一次执行 stop 后 active 就 false 了
        // 这是为了防止重复的调用，执行 stop 逻辑
        cleanupEffect(this);
        this.active = false;
      }
    }
}

function cleanupEffect(effect) {
    // 找到所有依赖这个 effect 的响应式对象
    // 从这些响应式对象里面把 effect 给删除掉
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}

function effect(fn, options) {
    if (fn.effect) {
        fn = fn.effect.fn;
    }
      // 把用户传过来的值合并到 _effect 对象上去
  // 缺点就是不是显式的，看代码的时候并不知道有什么值
    const _effect = new ReactiveEffect(fn);
    if (options) {
        extend(_effect, options);
        if (options.scope)
            recordEffectScope(_effect, options.scope);
    }
    if (!options || !options.lazy) {
        _effect.run();
    }
      // 把 _effect.run 这个方法返回
  // 让用户可以自行选择调用的时机（调用 fn）
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

function recordEffectScope(effect, scope) {
    scope = scope || activeEffectScope;
    if (scope && scope.active) {
        scope.effects.push(effect);
    }
}
function track(target, type, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
        depsMap.set(key, (dep = createDep()));
    }
    trackEffects(dep);
}

export function trackEffects(dep) {
    // 用 dep 来存放所有的 effect
    let shouldTrack = false;
    // TODO
    // 这里是一个优化点
    // 先看看这个依赖是不是已经收集了，
    // 已经收集的话，那么就不需要在收集一次了
    // 可能会影响 code path change 的情况
    // 需要每次都 cleanupEffect
    shouldTrack = !dep.has(activeEffect);
    if (!shouldTrack) return;
    if (!activeEffect) return;
    dep.add(activeEffect);
    (activeEffect).deps.push(dep);
}

function triggerEffects(dep, debuggerEventExtraInfo) {
    // spread into array for stabilization
    for (const effect of isArray(dep) ? dep : [...dep]) {
        if (effect !== activeEffect || effect.allowRecurse) {
            if (effect.scheduler) {
                effect.scheduler();
            }
            else {
                effect.run();
            }
        }
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // never been tracked
        return;
    }
    let deps = [];
    if(key!==undefined){
        deps.push(depsMap.get(key));
    }
    const effects = [];
    for (const dep of deps) {
        if (dep) {
            effects.push(...dep);
        }
    }
    triggerEffects(createDep(effects));
  }
export {effect,track,trigger}