import { ref, watchEffect, type Ref, type UnwrapRef
 } from "vue";

export const readLocal = <T>(key: string, initial: T): T => {
    try {
      const str = localStorage.getItem(key);
      if (!str) return initial;
      return JSON.parse(str);
    } catch (e) {
      return initial;
    }
  };

  export const writeLocal = (key:string,value:string)=> localStorage.setItem(key, value);
  
  export function cachedRef<T>(key: string, initial: T): Ref<UnwrapRef<T>> {
    const state = ref<T>(initial);
    state.value = readLocal<T>(key, initial) as UnwrapRef<T>;
  
    watchEffect(() =>  writeLocal(key, JSON.stringify(state.value)) );
    return state;
  }
  