<template>
  <div class="table_column_text">
    <div
      class="text_overflow"
      :style="{width: width + 'px'}">{{text}}</div>
  </div>
</template>

<script>
export default {
  name: 'TableColumnText',
  props: {
    text: '',
    width: {
      type: [Number, String],
      default: 200,
    }
  }
}
</script>

<style lang="scss" scoped>
  .table_column_text{
    position: relative;
  }
.text_overflow{overflow: hidden; text-overflow:ellipsis; white-space: nowrap;}
</style>
