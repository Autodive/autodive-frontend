<template>
  <div class="proind">
     <div class="titlediv"><span class="titleicon"></span>{{ $t('项目完成情况') }}</div>
      <el-row style="margin-top:40rem;" :gutter="30">
          <el-col :span="6">
              <div class="cirbg">
                  <div class="cirdiv"></div>
                  <div class="cirmain">
                      <div class="cirfont1">{{indexdata.totalProgress!='NaN'?(indexdata.totalProgress*100).toFixed(2):'0'}}%</div>
                      <div>{{ $t('项目标注进度') }}</div>
                  </div>
              </div>
          </el-col>
          <el-col :span="6">
              <div class="maintopdiv">
                <img src="../../assets/xmindex1.png" class="xmicon">
                <div class="xmfont">{{ $t('已办任务数') }}<div class="xmfontnum">{{indexdata.completeNum}}</div></div>
                <div class="xmfont2">{{ $t('剩余任务') }}</div>
                <div class="xmjdbg"><div class="xmjd1" :style="{width:indexdata.completeNum*100/(indexdata.completeNum+indexdata.workingNum+indexdata.waitNum)+'%'}"></div></div>
              </div>
          </el-col>
          <el-col :span="6">
              <div class="maintopdiv">
                <img src="../../assets/xmindex2.png" class="xmicon">
                <div class="xmfont">{{ $t('在办任务数') }}<div class="xmfontnum" style="color:#E34599">{{indexdata.workingNum}}</div></div>
                <div class="xmfont2">{{ $t('剩余任务') }}</div>
                <div class="xmjdbg"><div class="xmjd2" :style="{width:indexdata.workingNum*100/(indexdata.completeNum+indexdata.workingNum+indexdata.waitNum)+'%'}"></div></div>
              </div>
          </el-col>
          <el-col :span="6">
              <div class="maintopdiv">
                <img src="../../assets/xmindex3.png" class="xmicon">
                <div class="xmfont">{{ $t('待办任务数') }}<div class="xmfontnum" style="color:#4753DC">{{indexdata.waitNum}}</div></div>
                <div class="xmfont2">{{ $t('剩余任务') }}</div>
                <div class="xmjdbg"><div class="xmjd3" :style="{width:indexdata.waitNum*100/(indexdata.completeNum+indexdata.workingNum+indexdata.waitNum)+'%'}"></div></div>
              </div>
          </el-col>
      </el-row>
      <el-row style="margin-top:40rem;" :gutter="30">
        <el-col :span="7">
            <div class="titlediv">
                <span class="titleicon"></span>{{ $t('标签标注情况') }}
                <div style="position:absolute;right:0;top:0;">
                 <el-radio-group v-model="radio" size="mini" @change="getAllLabelData">
                    <el-radio-button label="1">{{ $t('实体标签') }}</el-radio-button>
                    <el-radio-button label="2">{{ $t('关系标签') }}</el-radio-button>
                  </el-radio-group>
                </div>
            </div>
            <div id="echart" style="width:100%;height:450rem;"></div>
        </el-col>
        <el-col :span="10">
            <div class="titlediv"><span class="titleicon"></span>{{ $t('单个标签标注情况') }}
                <div style="position:absolute;right:0;top:0;display:flex;" >
                  <el-radio-group v-model="radio2" size="mini" @change="getbqlist">
                    <el-radio-button label="1">{{ $t('实体标签') }}</el-radio-button>
                    <el-radio-button label="2">{{ $t('关系标签') }}</el-radio-button>
                  </el-radio-group>
                   <el-select v-model="bqselect" size="mini" @change="getSingleLabelData" filterable style="width:200rem;margin-left:15rem;" placeholder="请选择">
                        <el-option
                          v-for="item in bqlist"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id">
                        </el-option>
                      </el-select>
                </div>
            </div>
            <div id="echart2" style="width:100%;height:450rem;"></div>
        </el-col>
        <el-col :span="7">
            <div class="titlediv"><span class="titleicon"></span>{{ $t('本周统计情况') }}</div>
            <div id="echart3" style="width:100%;height:450rem;"></div>
        </el-col>
     </el-row>
  </div>
</template>

<script>
import {getindex,getAllLabel,getSingleLabel} from '@/api/home'
import {getshiti,getguanxi} from '@/api/benti'
// import i18next from 'i18next';
export default {
  data() {
    return {
      radio:'1',
      radio2:'1',
      bqselect:'',
      bqlist:[],
      indexdata:{}
    };
  },
  mounted(){
    this.getindexdata()
    this.getAllLabelData()
    this.getbqlist()



  },
   methods: {
    getbqlist(){
      this.bqselect=''
       if(this.radio2=='1'){
          getshiti({projectId:this.$route.query.id,isall:0}).then(res=>{
            this.bqlist=res.data.map(item=>{
              return {
                id:item.id,
                name:item.definName
              }
            })
            if(this.bqlist[0]!=undefined)
            {
              this.bqselect=this.bqlist[0].id;
            }
             this.getSingleLabelData()
          })
       }else{
          getguanxi({projectId:this.$route.query.id,isall:0}).then(res=>{
             this.bqlist=res.data
             if(this.bqlist[0]!=undefined)
            {
              this.bqselect=this.bqlist[0].id;
            }
             this.getSingleLabelData()
          })
       }

    },
    getSingleLabelData(){
        getSingleLabel({type:this.radio2,definId:this.bqselect,isall:0}).then(res=>{
         this.getcharts2(res.data.xdata,res.data.ydata)
      })
    },
    getindexdata(){
      getindex({id:this.$route.query.id,isall:0}).then(res=>{
        console.log(res.data)
        this.indexdata=res.data;
         this.getcharts3(res.data.pieChat)
      })
    },
    getAllLabelData(){
      getAllLabel({type:this.radio,projectId:this.$route.query.id,isall:0}).then(res=>{
        this.getcharts(res.data.xdata,res.data.ydata)
      })
    },
    getcharts(xdata,ydata){
      var myChart = this.$echarts.init(
        document.getElementById("echart")
      );
      var colorList = ["#D7D9F2","#CACDF1","#BEC2F0","#ADB3EF","#A1A8EE","#9199ED","#828CEC", "#707CEB","#5563E9","#4555E7"];
      var option = {
        color: colorList,
        grid: {
            top:'4%',
            left: '3%',
            right: '4%',
            bottom: '0%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            show: false,
          },
          yAxis: {
            type: 'category',
            axisTick: {show: false},
            data:xdata
          },
          series: [
            {
              name: this.$t('标注情况'),
              type: 'bar',
              barWidth:12,
              data: ydata,
              itemStyle: {
              normal: {
                color: function(params) {
                  return colorList[params.dataIndex];
                }
              }
            },
              label: {
                show: true,
                position: 'right',
                valueAnimation: true
              }
            }
          ]
      };
      myChart.setOption(option);
    },
     getcharts2(xdata,ydata){
      var myChart = this.$echarts.init(
        document.getElementById("echart2")
      );
      var colorList = ["#4753DC","#4BBCF8","#E34599","#4753DC","#4BBCF8","#E34599","#4753DC","#4BBCF8","#E34599","#4753DC","#4BBCF8","#E34599"];
      var option = {
        color: colorList,
        tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
        grid: {
            top:'10%',
            left: '3%',
            right: '4%',
            bottom: '0%',
            containLabel: true
          },
           xAxis: {
            type: 'category',
            data:xdata
            //data: ['1周', '2周', '3周', '4周', '5周', '6周', '7周','8周','9周','10周','11周','12周']
          },
          yAxis: {
            type: 'value',
            name:this.$t('单位（个）')
          },
          series: [
            {
              name: this.$t('标注情况'),
              type: 'bar',
              barWidth:12,
              data:ydata,
             // data: [43,48,43,55,38, 40,43,47,50,54,35,43],
              itemStyle: {
              normal: {
                color: function(params) {
                  return colorList[params.dataIndex];
                }
              }
            }
            }
          ]
      };
      myChart.setOption(option);
    },
     getcharts3(pieChat){
      var myChart = this.$echarts.init(
        document.getElementById("echart3")
      );
      var colorList = ["#4753DC","#858fcf"];
      var option = {
        color: colorList,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
        grid: {
            top:'10%',
            left: '3%',
            right: '4%',
            bottom: '0%',
            containLabel: true
          },
          angleAxis: {
    type: 'category',
    data:pieChat.xdata,
    //data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  radiusAxis: {
    axisTick:{
          show:false // 不显示坐标轴刻度线
    },
    axisLine: {
          show: false, // 不显示坐标轴线
    },
    axisLabel: {
          show: false, // 不显示坐标轴上的文字
    },
  },
  polar: {},
  series: [
    {
      type: 'bar',
      data: pieChat.completeData,
      coordinateSystem: 'polar',
      name: this.$t('已完成'),
      stack: 'a',
      emphasis: {
        focus: 'series'
      }
    },
    {
      type: 'bar',
      data: pieChat.noCompleteData,
      coordinateSystem: 'polar',
      name: this.$t('未完成'),
      stack: 'a',
      emphasis: {
        focus: 'series'
      }
    }
  ],
  legend: {
    show: true,
    data: [this.$t('已完成'), this.$t('未完成')]
  }
      };
      myChart.setOption(option);
    }
   }
};
</script>

<style lang="scss">
.proind {padding-left:20rem;
  .titlediv {font-size:22rem;color:#6B6B6B;font-weight: bold;position: relative;}
  .titleicon {background:#575BCA;width:4rem;height:24rem;margin-right:6rem;display:block;float:left;}
  .cirbg {width:218rem;height:218rem;border:20rem solid #EFF0F3;background:#fff;border-radius: 50%;position: relative;margin:0 auto;}
  .cirdiv {background: url(../../assets/cir.png) no-repeat;width:226rem;height:226rem;background-size:100% 100%;animation:fadenum 3s linear infinite;position: absolute;top:-4rem;left:-4rem;}
  .cirmain {
    text-align: center;padding-top:76rem;font-size:15rem;color:#969696;
    .cirfont1{font-size:48rem;color:#B1B1B1;font-weight: bold}
  }
  .xmicon {width:50rem;height:50rem;}
  .xmfont {color:#939393;font-size: 24rem;margin-top:10rem;font-weight: bold;position: relative;}
  .xmfontnum {font-size:64rem;color:#4BBCF8;position: absolute;right:0rem;bottom:-20rem;}
  .xmfont2 {color:#B4B4B4;font-size:12rem;margin-top:20rem;}
  .xmjdbg {height:8rem;background:#E0E0E0;border-radius: 4rem;position: relative;margin-top:5rem;}
  .xmjd1,.xmjd2,.xmjd3 {background:#53C0F8;border-radius: 4rem;position: absolute;left:0;top:0;height:8rem;}
  .xmjd2 {background:#E34599;}
  .xmjd3 {background:#4753DC}
  .maintopdiv {padding:40rem;}
}
 @keyframes fadenum{
   100%{transform:rotate(-360deg);}
}
</style>
