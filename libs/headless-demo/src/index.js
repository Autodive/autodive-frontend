import { ref } from 'vue';

export default function createHeadlessDemo() {
    const count = ref(0);

    return {
        count, increase
    }

    function increase() {
        count.value++;
    }
} 