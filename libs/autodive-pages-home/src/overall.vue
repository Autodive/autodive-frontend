<template>
  <div class="proind2">
    <el-row :gutter="30">
      <el-col :span="7">
        <div class="titlediv">
          <span class="titleicon"></span>{{ $t('标签标注情况') }}
          <div style="position: absolute; right: 0; top: 0">
            <el-radio-group v-model="radio" size="mini" @change="getAllLabelData">
              <el-radio-button label="1">{{ $t('实体标签') }}</el-radio-button>
              <el-radio-button label="2">{{ $t('关系标签') }}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div id="echart" style="width: 100%; height: 450px"></div>
      </el-col>
      <el-col :span="10">
        <div class="titlediv">
          <span class="titleicon"></span>{{ $t('单个标签标注情况') }}
          <div style="position: absolute; right: 0; top: 0; display: flex">
            <el-radio-group v-model="radio2" size="mini" @change="getbqlist">
              <el-radio-button label="1">{{ $t('实体标签') }}</el-radio-button>
              <el-radio-button label="2">{{ $t('关系标签') }}</el-radio-button>
            </el-radio-group>
            <el-select v-model="bqselect" size="mini" @change="getSingleLabelData" filterable style="width: 200px; margin-left: 15px" :placeholder="$t('请选择')">
              <el-option v-for="item in bqlist" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </div>
        </div>
        <div id="echart2" style="width: 100%; height: 450px"></div>
      </el-col>
      <el-col :span="7">
        <div class="titlediv">
          <span class="titleicon"></span>{{ $t('标注统计情况') }}
        </div>
        <div id="echart3" style="width: 100%; height: 450px"></div>
      </el-col>
    </el-row>
    <el-row style="margin-top: 40px" :gutter="30">
      <el-col :span="7">
        <div class="titlediv">
          <span class="titleicon"></span>{{ $t('项目完成情况') }}
          <div style="position: absolute; right: 90px; top: 0">
            <a @click="onClickExportProject" target="blank"><el-button type="success" size="mini">{{
                $t('项目导出')
              }}</el-button></a>
          </div>
        </div>
        <div style="display: flex; align-items: center; padding-top: 20px">
          <div class="cirbg">
            <div class="cirdiv"></div>
            <div class="cirmain">
              <div class="cirfont1">
                {{
                  indexdata.totalProgress && indexdata.totalProgress != 'NaN'
                    ? Math.ceil(indexdata.totalProgress * 100)
                    : '0'
                }}%
              </div>
              <div>{{ $t('项目标注进度') }}</div>
            </div>
          </div>
          <div style="flex: 1; margin-left: 50px">
            <div class="glxmli">
              <img src="../assets/glxmindex1.png" />
              <div style="flex: 1">
                <div class="glxmlifont">{{ $t('已办任务数') }}</div>
                <div class="glxmlifont2">{{ indexdata.completeNum }}</div>
              </div>
            </div>
            <div class="glxmli">
              <img src="../assets/glxmindex2.png" />
              <div style="flex: 1">
                <div class="glxmlifont">{{ $t('在办任务数') }}</div>
                <div class="glxmlifont2" style="color: #e34599">
                  {{ indexdata.workingNum }}
                </div>
              </div>
            </div>
            <div class="glxmli">
              <img src="../assets/glxmindex3.png" />
              <div style="flex: 1">
                <div class="glxmlifont">{{ $t('待办任务数') }}</div>
                <div class="glxmlifont2" style="color: #4753dc">
                  {{ indexdata.waitNum }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="17">
        <div class="titlediv">
          <span class="titleicon"></span>{{ $t('项目人员情况') }}
        </div>
        <el-table :data="indexdata.taskList" height="300px" style="margin-top: 15px; width: 100%" :header-cell-style="{ background: '#F9F9F9' }">
          <el-table-column prop="userName" width="100" align="center" :label="$t('姓名')"></el-table-column>
          <el-table-column prop="completeNum" width="100" align="center" :label="$t('已标注')"></el-table-column>
          <el-table-column prop="waitNum" width="100" align="center" :label="$t('待标注')"></el-table-column>
          <el-table-column prop="onlineDuration" align="center" :label="$t('在线时长')"></el-table-column>
          <el-table-column align="center" :label="$t('标注进度')">
            <template v-slot="scope">
              <div style="display: flex; align-items: center">
                <div class="xmjdbg">
                  <div class="xmjd1" :style="{ width: `${Math.ceil(scope.row.progress * 100)}%` }"></div>
                </div>
                <div style="margin-left: 10px">
                  {{ Math.ceil(scope.row.progress * 100) }}%
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" align="center" :label="$t('当前状态')">
            <template v-slot="scope">
              <div v-if="scope.row.status == 1" class="wks">
                {{ $t('未开始') }}
              </div>
              <div v-if="scope.row.status == 2" class="jxz">
                {{ $t('进行中') }}
              </div>
              <div v-if="scope.row.status == 3" class="wc">
                {{ $t('标注完成') }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getindex, getAllLabel, getSingleLabel } from '@/api/home'
import { exportProject } from '@/api/export.js'
import { getshiti, getguanxi } from '@/api/benti'
import { getUserOptToken } from '@/api/user'
import * as echarts from 'echarts'
export default {
  data() {
    return {
      radio: '1',
      radio2: '1',
      bqselect: '',
      bqlist: [],
      indexdata: {},
      tableData: []
    }
  },
  mounted() {
    this.getindexdata()
    this.getAllLabelData()
    this.getbqlist()
  },
  methods: {
    getbqlist() {
      this.bqselect = ''
      if (this.radio2 == '1') {
        getshiti({ projectId: this.$route.query.id }).then((res) => {
          this.bqlist = res.data.map((item) => {
            return {
              id: item.id,
              name: item.definName
            }
          })
          this.bqselect = this.bqlist[0].id
          this.getSingleLabelData()
        })
      } else {
        getguanxi({ projectId: this.$route.query.id }).then((res) => {
          this.bqlist = res.data
          this.bqselect = this.bqlist[0].id
          this.getSingleLabelData()
        })
      }
    },
    getSingleLabelData() {
      getSingleLabel({ type: this.radio2, definId: this.bqselect }).then(
        (res) => {
          this.getcharts2(res.data.xdata, res.data.ydata)
        }
      )
    },
    getindexdata() {
      getindex({ id: this.$route.query.id }).then((res) => {
        console.log(res.data)
        this.indexdata = res.data
        this.getcharts3(res.data.allLabel)
      })
    },
    getAllLabelData() {
      getAllLabel({ type: this.radio, projectId: this.$route.query.id }).then(
        (res) => {
          this.getcharts(res.data.xdata, res.data.ydata)
        }
      )
    },
    getcharts(xdata, ydata) {
      var myChart = echarts.init(document.getElementById('echart'))
      var option = {
        grid: {
          top: '4%',
          left: '3%',
          right: '4%',
          bottom: '0%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          show: false
        },
        yAxis: {
          type: 'category',
          axisTick: { show: false },
          data: xdata
        },
        series: [
          {
            name: this.$t('标注情况'),
            type: 'bar',
            barWidth: 12,
            data: ydata,
            itemStyle: {
              normal: {
                color: function (params) {
                  return `rgb(${87+(params.dataIndex*4)}, ${91+(params.dataIndex*4)}, ${202+(params.dataIndex)})`
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
      }
      myChart.setOption(option)
    },
    getcharts2(xdata, ydata) {
      var myChart = echarts.init(document.getElementById('echart2'))
      var colorList = [
        '#4753DC',
        '#4BBCF8',
        '#E34599',
        '#4753DC',
        '#4BBCF8',
        '#E34599',
        '#4753DC',
        '#4BBCF8',
        '#E34599',
        '#4753DC',
        '#4BBCF8',
        '#E34599'
      ]
      var option = {
        color: colorList,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          top: '10%',
          left: '3%',
          right: '4%',
          bottom: '0%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xdata
        },
        yAxis: {
          type: 'value',
          name: this.$t('单位（个）')
        },
        series: [
          {
            name: this.$t('标注情况'),
            type: 'bar',
            barWidth: 12,
            data: ydata,
            itemStyle: {
              normal: {
                color: function (params) {
                  return colorList[params.dataIndex]
                }
              }
            }
          }
        ]
      }
      myChart.setOption(option)
    },
    getcharts3(pieChat) {
      var myChart = echarts.init(document.getElementById('echart3'))
      const data = pieChat.xdata
        .map((d, i) => [d, pieChat.ydata[i]])
        .sort((a, b) => a[1] - b[1])
      console.log(data)
      var option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          show: false,
          data: data.map((d) => d[0])
        },
        toolbox: {
          show: false
        },
        series: [
          {
            name: this.$t('标注统计情况'),
            type: 'pie',
            radius: [20, 140],
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 5
            },
            data: data.map((d) => ({ value: d[1], name: d[0] }))
          }
        ]
      }
      myChart.setOption(option)
    },

    async onClickExportProject() {
      var otpTokenResult = await getUserOptToken()
      var params = {
        projectId: this.$route.query.id,
        otpToken: otpTokenResult.data
      }
      exportProject(params)
    }
  }
}
</script>

<style lang="scss">
.proind2 {
  padding-left: 20px;
  padding-top: 20px;
  .titlediv {
    font-size: 22px;
    color: #6b6b6b;
    font-weight: bold;
    position: relative;
  }
  .titleicon {
    background: #08979c;
    width: 4px;
    height: 24px;
    margin-right: 6px;
    display: block;
    float: left;
  }
  .cirbg {
    width: 164px;
    height: 164px;
    border: 10px solid #eff0f3;
    background: #fff;
    border-radius: 50%;
    position: relative;
  }
  .cirdiv {
    background: url(../assets/cir.png) no-repeat;
    width: 168px;
    height: 168px;
    background-size: 100% 100%;
    animation: fadenum 3s linear infinite;
    position: absolute;
    top: -2px;
    left: -2px;
  }
  .cirmain {
    text-align: center;
    padding-top: 50px;
    font-size: 13px;
    color: #969696;
    .cirfont1 {
      font-size: 40px;
      color: #b1b1b1;
      font-weight: bold;
    }
  }
  .glxmli {
    display: flex;
    margin-top: 20px;
    img {
      width: 36px;
      margin-right: 15px;
      height: 36px;
    }
    .glxmlifont {
      color: #939393;
      font-size: 14px;
    }
    .glxmlifont2 {
      font-size: 36px;
      font-weight: bold;
      color: #4bbcf8;
    }
  }
  .xmjdbg {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    position: relative;
    margin-top: 5px;
    flex: 1;
  }
  .xmjd1 {
    background: #08979c;
    border-radius: 4px;
    position: absolute;
    left: 0;
    top: 0;
    height: 8px;
  }
  .maintopdiv {
    padding: 40px;
  }
  .wks,
  .jxz,
  .wc {
    width: 90px;
    height: 30px;
    line-height: 30px;
    margin: 0 auto;
    text-align: center;
    color: #d63c45;
    border: 1px solid #d63c45;
    border-radius: 8px;
  }
  .jxz {
    color: #4587e9;
    border: 1px solid #4587e9;
  }
  .wc {
    color: #42a414;
    border: 1px solid #42a414;
  }
}
@keyframes fadenum {
  100% {
    transform: rotate(-360deg);
  }
}
</style>
