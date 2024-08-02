<template>
  <div class="alphabet">
    <dl class="letter-list">
      <dt v-for="item in List" :key="item.ind" @click.capture="go(item.ind)" class="letter-item" :class="{
          current: activeId == item.ind,
        }">
        {{ item.ind }}
      </dt>
    </dl>
  </div>
</template>

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
    }
  }
}
</script>

<style lang="scss" scoped>
.alphabet {
  display: flex;
  align-items: center;
  width: 25px;
  justify-content: center;
  .letter-list {
    color: #a4a4a4;
    font-size: 14px;
    .letter-item {
      height: 32px;
      line-height: 32px;
      width: 18px;
      font-size: 14px;
      text-align: center;
      position: relative;
      cursor: pointer;
    }
    .current,
    .letter-item:hover {
      color: #fff;
      background: $base-color-default;
      border-radius: 8px;
    }
  }
}
</style>
