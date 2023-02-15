<template>
  <div class="home">
     <div v-if="act==1" class="page1">
          <div @click="actclick(2)" style="position:absolute;left:0;top:274rem;cursor:pointer;width:517rem;height:120rem;"></div>
          <div @click="actclick(3)" style="position:absolute;left:0;top:394rem;cursor:pointer;width:517rem;height:120rem;"></div>
     </div>
     <div v-if="act==2" class="page2">
        <div @click="actclick(1)" style="position:absolute;left:0;top:166rem;cursor:pointer;width:517rem;height:120rem;"></div>
        <div @click="actclick(3)" style="position:absolute;left:0;top:394rem;cursor:pointer;width:517rem;height:120rem;"></div>
     </div>
     <div v-if="act==3" class="page3">
        <div @click="actclick(1)" style="position:absolute;left:0;top:166rem;cursor:pointer;width:517rem;height:120rem;"></div>
        <div @click="actclick(2)" style="position:absolute;left:0;top:274rem;cursor:pointer;width:517rem;height:120rem;"></div>
        <div @click="actclick(4)" style="position:absolute;left:1000rem;top:56rem;cursor:pointer;width:190rem;height:53rem;"></div>
     </div>
     <div v-if="act==4" class="page4">
        <div @click="actclick(1)" style="position:absolute;left:0;top:166rem;cursor:pointer;width:517rem;height:120rem;"></div>
        <div @click="actclick(2)" style="position:absolute;left:0;top:274rem;cursor:pointer;width:517rem;height:120rem;"></div>
        <div @click="actclick(3)" style="position:absolute;left:800rem;top:56rem;cursor:pointer;width:190rem;height:53rem;"></div>
     </div>

  </div>
</template>

<script>

export default {
  data() {
    return {
      act:1,
    };
  },
   methods: {
     actclick(e){
      this.act=e
     }
   }
};
</script>

<style lang="scss">
.page1 {background:url(../../assets/yd1.jpg) no-repeat;width:1606rem;height:752rem;background-size: 100% 100%;margin:5% auto;position: relative;}
.page2 {background:url(../../assets/yd2.jpg) no-repeat;width:1606rem;height:752rem;background-size: 100% 100%;margin:5% auto;position: relative;}
.page3 {background:url(../../assets/yd3.jpg) no-repeat;width:1606rem;height:752rem;background-size: 100% 100%;margin:5% auto;position: relative;}
.page4 {background:url(../../assets/yd4.jpg) no-repeat;width:1606rem;height:752rem;background-size: 100% 100%;margin:5% auto;position: relative;}
</style>
