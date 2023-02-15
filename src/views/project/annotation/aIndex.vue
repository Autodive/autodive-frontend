<script>
export default {
  name: 'a-index',
  props: {
    List: {
      type: Array,
      default: () => []
    },
    activeId: {
      type: String,
      default: () => ''
    }
  },

  methods: {
    go(letter) {
      this.$emit('go', letter)
    },
  }
}
</script>

<template>
  <div class="alphabet">
    <dl
      class="letter-list"
    >
      <dt
        v-for="item in List"
        :key="item.ind"
        @click.capture="go(item.ind)"
        class="letter-item"
        :class="{
          current: activeId == item.ind
        }"
      >
        {{ item.ind }}
      </dt>
    </dl>
  </div>
</template>

<style lang="scss" scoped>
.alphabet{
display:flex; align-items: center;width:25rem; justify-content: center;
  .letter-list {
    color: #A4A4A4;
    font-size: 14rem;
    .letter-item {
      height: 32rem;
      line-height: 32rem;
      width: 18rem;
      font-size: 14rem;
      text-align: center;
      position: relative;
      cursor: pointer;

    }
    .current,.letter-item:hover {
        color: #fff;
        background: #4341E3;
        border-radius: 8rem;
      }
  }
}
</style>
