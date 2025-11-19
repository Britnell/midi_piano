import { ref, watchEffect, type Ref
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
  
  export function cachedRef<T>(key: string, initial: T): Ref<T> {
    const state = ref<T>(initial);
    state.value = readLocal<T>(key, initial);
  
    watchEffect(() =>  writeLocal(key, JSON.stringify(state.value)) );
    return state as Ref<T>;
  }
  