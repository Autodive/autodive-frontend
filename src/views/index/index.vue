<template>
  <div class="home">
    <div v-if="act == 1" class="page" :style="`background-image:url(${page1});`">
      <div @click="actclick(2)" style="position:absolute;left:0;top:274rem;cursor:pointer;width:517rem;height:120rem;">
      </div>
      <div @click="actclick(3)" style="position:absolute;left:0;top:394rem;cursor:pointer;width:517rem;height:120rem;">
      </div>
    </div>
    <div v-if="act == 2" class="page" :style="`background-image:url(${page2});`">
      <div @click="actclick(1)" style="position:absolute;left:0;top:166rem;cursor:pointer;width:517rem;height:120rem;">
      </div>
      <div @click="actclick(3)" style="position:absolute;left:0;top:394rem;cursor:pointer;width:517rem;height:120rem;">
      </div>
    </div>
    <div v-if="act == 3" class="page" :style="`background-image:url(${page3});`">
      <div @click="actclick(1)" style="position:absolute;left:0;top:166rem;cursor:pointer;width:517rem;height:120rem;">
      </div>
      <div @click="actclick(2)" style="position:absolute;left:0;top:274rem;cursor:pointer;width:517rem;height:120rem;">
      </div>
      <div @click="actclick(4)"
        style="position:absolute;left:1000rem;top:56rem;cursor:pointer;width:190rem;height:53rem;"></div>
    </div>
    <div v-if="act == 4" class="page" :style="`background-image:url(${page4});`">
      <div @click="actclick(1)" style="position:absolute;left:0;top:166rem;cursor:pointer;width:517rem;height:120rem;">
      </div>
      <div @click="actclick(2)" style="position:absolute;left:0;top:274rem;cursor:pointer;width:517rem;height:120rem;">
      </div>
      <div @click="actclick(3)"
        style="position:absolute;left:800rem;top:56rem;cursor:pointer;width:190rem;height:53rem;"></div>
    </div>

  </div>
</template>

<script>

export default {
  data() {
    return {
      act: 1,
      page1: this.$t('index-1-img'),
      page2: this.$t('index-2-img'),
      page3: this.$t('index-3-img'),
      page4: this.$t('index-4-img'),
    };
  },
  methods: {
    actclick(e) {
      this.act = e
    }
  }
};
</script>

<style lang="scss">
.page {
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 1606rem;
  height: 752rem;
  margin: 5% auto;
  position: relative;
}
</style>
