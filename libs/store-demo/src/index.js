import { ref } from 'vue';
import { defineStore } from 'pinia';

export default defineStore('demo', () => {
    const count = ref(0);

    return {
        count, increase,
    }

    function increase() {
        count.value++;
    }
});
