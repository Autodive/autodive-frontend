import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

import { defineStore } from 'pinia';

export default defineStore('common', () => {
  const language = ref('zh')

  function switchLanguages() {
    console.log(language)
    if (language.value === 'zh') {
      language.value = 'en'
    } else {
      language.value = 'zh'
    }
  }
  return {
    language, switchLanguages
  }
}, {
  persist: true,
});
