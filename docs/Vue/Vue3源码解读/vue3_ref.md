# Ref

## 基础使用方法

- 使用场景 定义原始类型的值（作为reactive限制的补充）

```js
// 1.定义原始类型的值
const num = ref(1);
console.log(num);
//Ref<1>

// 修改值
const addNum = () => {;
  num.value++;
};
```

- 定义引用类型的值

```js
const people = ref({ name: "JJ", age: 40 });
console.log(people.value);
//Reactive<Object>

people.value.name = "JAY";
```

*从这里可以发现，ref定义引用类型时，只是内部其实依旧是reactive对象*

## shallowRef

```js
const state = shallowRef({ count: 1 })

// 不会触发更改
state.value.count = 2

// 会触发更改
state.value = { count: 2 }
```

*与ref不同的是，shallowRef的响应式是浅层的，常常用于对大型数据结构的性能优化或是与外部的状态管理系统集成*

## triggerRef

**强制触发依赖于一个浅层 ref的副作用，这通常在对浅引用的内部值进行深度变更后使用。**

```js
const shallow = shallowRef({
  greet: 'Hello, world'
})

// 触发该副作用第一次应该会打印 "Hello, world"
watchEffect(() => {
  console.log(shallow.value.greet)
})

// 这次变更不应触发副作用，因为这个 ref 是浅层的
shallow.value.greet = 'Hello, universe'

// 打印 "Hello, universe"
triggerRef(shallow)
```

## customRef

**创建一个自定义的 ref，显式声明对其依赖追踪和更新触发的控制方式。**

```js
import { customRef } from 'vue'

export function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => {
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
        }, delay)
      }
    }
  })
} void
}
```

`customRef()` 预期接收一个工厂函数作为参数，这个工厂函数接受 `track` 和 `trigger` 两个函数作为参数，并返回一个带有 `get` 和 `set` 方法的对象。

一般来说，`track()` 应该在 `get()` 方法中调用，而 `trigger()` 应该在 `set()` 中调用。然而事实上，你对何时调用、是否应该调用他们有完全的控制权。

## 源码解析

https://github.com/lengdayu/vue3_source_read/blob/main/packages/reactivity/src/ref.ts
