<template>
  <div class="zhiyuanok">
    <div class="addtop">

        <div class="stepdiv">
            <div class="step1"><div class="stepcir">1</div>{{ $t('导入资源') }}</div>
            <div class="step1sx"></div>
            <div class="step2"><div class="stepcir">2</div>{{ $t('指派任务') }}</div>
            <div class="step2sx"></div>
            <div class="step3"><div class="stepcir">3</div>{{ $t('指派完成') }}</div>
        </div>
    </div>
    <div style="text-align:center;padding-top:150rem;">
        <img src="../../assets/ok.png" style="width:288rem;height:288rem;">
        <div style="font-size:22rem;color: #757575;margin-top:10rem;margin-bottom:20rem;">已完成任务指派，可前往已有资源列表查看任务情况</div>
        <el-button type="primary" @click="goback">{{ $t('查看已有资源列表') }}</el-button>
   </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

    };
  },
  mounted(){

    },
   methods: {
    goback(){
       this.$router.push({ path: '/project/zhiyuan?name='+this.$route.query.name+'&id='+this.$route.query.id })
    }
   }
};
</script>

<style lang="scss" scoped>
.zhiyuanok{

  .addtop {
    display:flex;
    .stepdiv {
      display: flex;width:800rem;margin:0 auto 50rem auto;
      .step1,.step2,.step3 {
        width:70rem;text-align:center;
      }
      .stepcir {width:40rem;height:40rem;line-height:40rem;border-radius: 50%;border:1px solid #3F3CE8;color:#fff;background:#3F3CE8;font-size:24rem;text-align: center;margin:0 auto;margin-bottom:10rem;}
      .step1sx,.step2sx {background:#3F3CE8;height:5rem;flex:1;margin-top:20rem;}
    }
  }


}


</style>
