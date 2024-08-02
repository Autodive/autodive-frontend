<template>
  <div class="proind">
    <div class="titlediv">
      <span class="titleicon"></span>{{ $t('项目完成情况') }}
      <el-button class="editbutton" @click="editorProject">
        <el-icon>
          <Edit />
        </el-icon>
      </el-button>
    </div>
    <el-row style="margin-top:40px;" :gutter="30">
      <el-col :span="6">
        <div class="cirbg">
          <div class="cirdiv"></div>
          <div class="cirmain">
            <div class="cirfont1">{{ totalProgress }}%</div>
            <div>{{ $t('项目标注进度') }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="maintopdiv">
          <img src="../assets/xmindex1.png" class="xmicon">
          <div class="xmfont">{{ $t('已办任务数') }}
            <div class="xmfontnum">{{ indexdata.completeNum }}</div>
          </div>
          <div class="xmfont2">{{ $t('剩余任务') }}</div>
          <div class="xmjdbg">
            <div class="xmjd1" :style="completedTaskStyle"></div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="maintopdiv">
          <img src="../assets/xmindex2.png" class="xmicon">
          <div class="xmfont">{{ $t('在办任务数') }}
            <div class="xmfontnum" style="color:#E34599">{{ indexdata.workingNum }}
            </div>
          </div>
          <div class="xmfont2">{{ $t('剩余任务') }}</div>
          <div class="xmjdbg">
            <div class="xmjd2" :style="progressTaskStyle">
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="maintopdiv">
          <img src="../assets/xmindex3.png" class="xmicon">
          <div class="xmfont">{{ $t('待办任务数') }}<div class="xmfontnum" style="color:#4753DC">{{ indexdata.waitNum }}</div>
          </div>
          <div class="xmfont2">{{ $t('剩余任务') }}</div>
          <div class="xmjdbg">
            <div class="xmjd3" :style="toBeTaskStyle">
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row style="margin-top:40px;" :gutter="30">
      <el-col :span="7" :lg="7" :md="12" :xs="24" :sm="24">
        <div class="titlediv">
          <span class="titleicon"></span>{{ $t('标签标注情况') }}
          <div style="position:absolute;right:0;top:0;">
            <el-radio-group v-model="radio" @change="getAllLabelData(projectId)">
              <el-radio-button label="1">{{ $t('实体标签') }}</el-radio-button>
              <el-radio-button label="2">{{ $t('关系标签') }}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div id="echart" style="width:100%;height:450px;"></div>
      </el-col>
      <el-col :span="10" :lg="10" :md="12" :xs="24" :sm="24">
        <div class="titlediv"><span class="titleicon"></span>{{ $t('单个标签标注情况') }}
          <div style="position:absolute;right:0;top:0;display:flex;">
            <el-radio-group v-model="radio2" @change="getbqlist">
              <el-radio-button label="1">{{ $t('实体标签') }}</el-radio-button>
              <el-radio-button label="2">{{ $t('关系标签') }}</el-radio-button>
            </el-radio-group>
            <el-select v-model="bqselect" @change="getSingleLabelData" filterable style="width:200px;margin-left:15px;" :placeholder="$t('请选择')">
              <el-option v-for="item in bqlist" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </div>
        </div>
        <div id="echart2" style="width:100%;height:450px;"></div>
      </el-col>
      <el-col :span="7" :lg="7" :md="12" :xs="24" :sm="24">
        <div class="titlediv"><span class="titleicon"></span>{{ $t('本周统计情况') }}</div>
        <div id="echart3" style="width:100%;height:450px;"></div>
      </el-col>
    </el-row>
    <el-dialog :title="$t('编辑项目')" v-model="dialogVisible" width="40%">
      <el-form ref="form" :model="formitem" label-width="150px" style="margin-top:20px">
        <el-form-item :label="$t('项目名称') + ' :'">
          <el-input :placeholder="$t('请输入项目名')" v-model="formitem.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('项目描述') + ' :'">
          <el-input :placeholder="$t('请输入项目描述')" v-model="formitem.desc"></el-input>
        </el-form-item>
        <el-form-item :label="$t('元数据') + ' :'">
          <el-row style="margin-bottom: 10px" :gutter="20" v-for="(item, index) in metadata" :key="index">
            <el-col :span="10">
              <el-input :placeholder="$t('请输入key')" v-model="item.key"></el-input>
            </el-col>
            <el-col :span="10">
              <el-input :placeholder="$t('请输入value')" v-model="item.value"></el-input>
            </el-col>
            <el-col :span="4">
              <el-button @click="deleteMeta(index)">
                <el-icon>
                  <Minus />
                </el-icon>
              </el-button>
            </el-col>
          </el-row>
          <el-button style="width:100%;" @click="addMeta">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
          <el-button type="primary" @click="send">{{ $t('确定') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getindex, getAllLabel, getSingleLabel } from '@/api/home'
import { getshiti, getguanxi } from '@/api/benti'
import { editproject } from '@/api/project'
import { getxmqx } from '@/api/quanxian'
import * as echarts from 'echarts'
import { Plus } from '@element-plus/icons-vue'
export default {
  data() {
    return {
      radio: '1',
      radio2: '1',
      bqselect: '',
      bqlist: [],
      indexdata: {},
      dialogVisible: false,
      formitem: {
        name: '',
        desc: '',
        metadata: []
      },
      metadata: []
    }
  },
  mounted() {
    this.getindexdata()
    this.getAllLabelData()
    this.getbqlist()
  },
  computed: {
    projectId() {
      return this.$route.query.id
    },
    totalProgress() {
      const totalProgress = this.indexdata.totalProgress

      return (totalProgress && totalProgress != "NaN") ? Math.ceil(totalProgress * 100) : '0'
    },
    completedTaskStyle() {
      return {
        width: this.indexdata.completeNum * 100 / (this.indexdata.completeNum + this.indexdata.workingNum + this.indexdata.waitNum) + '%'
      }
    },
    progressTaskStyle() {
      return {
        width: this.indexdata.workingNum * 100 / (this.indexdata.completeNum + this.indexdata.workingNum + this.indexdata.waitNum) + '%'
      }
    },
    toBeTaskStyle() {
      return { 
        width: this.indexdata.waitNum * 100 / (this.indexdata.completeNum + this.indexdata.workingNum + this.indexdata.waitNum) + '%' 
      }
    }
  },
  beforeRouteUpdate(to, from, next) {
    next()

    this.$forceUpdate()
    this.getindexdata(to.query.id)
    this.getAllLabelData(to.query.id)
    this.getbqlist(to.query.id)
  },
  methods: {
    getbqlist(projectId) {
      projectId = projectId || this.projectId

      this.bqselect = ''
      if (this.radio2 == '1') {
        getshiti({ projectId, isall: 0 }).then((res) => {
          this.bqlist = res.data.map((item) => {
            return {
              id: item.id,
              name: item.definName
            }
          })
          if (this.bqlist[0] != undefined) {
            this.bqselect = this.bqlist[0].id
          }
          this.getSingleLabelData()
        })
      } else {
        getguanxi({ projectId, isall: 0 }).then((res) => {
          this.bqlist = res.data
          if (this.bqlist[0] != undefined) {
            this.bqselect = this.bqlist[0].id
          }
          this.getSingleLabelData()
        })
      }
    },
    editorProject() {
      getxmqx({ projectId: this.projectId }).then((res) => {
        if (res.data.status == 1) {
          this.formitem = {
            name: res.data.project.name,
            desc: res.data.project.desc,
            metadata: res.data.project.metadata,
            id: this.projectId
          }
          this.metadata = res.data.project.metadata
          this.dialogVisible = true
        } else {
          this.$message({
            message: this.$t('你已经被禁用，请联系管理员'),
            type: 'error'
          })
        }
      })
    },
    addMeta() {
      this.metadata.push({ key: '', value: '' })
    },
    deleteMeta(index) {
      this.metadata.splice(index, 1)
    },
    send() {
      delete this.formitem.createDate
      editproject(this.formitem).then((res) => {
        this.$message({
          message: this.$t('编辑成功'),
          type: 'success'
        })
        this.dialogVisible = false
        this.page = 1
        this.getlist()
      })
    },
    getSingleLabelData() {
      getSingleLabel({
        type: this.radio2,
        definId: this.bqselect,
        isall: 0
      }).then((res) => {
        this.getcharts2(res.data.xdata, res.data.ydata)
      })
    },
    getindexdata(projectId) {
      projectId = projectId || this.projectId
      getindex({ id: projectId, isall: 0 }).then((res) => {
        this.indexdata = res.data
        this.getcharts3(res.data.pieChat)
      })
    },
    getAllLabelData(projectId) {
      projectId = projectId || this.projectId
      getAllLabel({
        type: this.radio,
        projectId: projectId,
        isall: 0
      }).then((res) => {
        this.getcharts(res.data.xdata, res.data.ydata)
      })
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
      var colorList = ['#4753DC', '#858fcf']
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
        angleAxis: {
          type: 'category',
          data: pieChat.xdata.map(this.$t)
        },
        radiusAxis: {
          axisTick: {
            show: false 
          },
          axisLine: {
            show: false 
          },
          axisLabel: {
            show: false
          }
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
      }
      myChart.setOption(option)
    }
  }
}
</script>

<style lang="scss" scoped>
.proind {
  padding-left: 20px;
  padding-top: 20px;

  .titlediv {
    font-size: 16px;
    color: #6b6b6b;
    font-weight: bold;
    position: relative;
    line-height: 21px;
  }

  .titleicon {
    background: #08979c;
    width: 3px;
    height: 21px;
    margin-right: 6px;
    display: block;
    float: left;
  }

  .cirbg {
    width: 218px;
    height: 218px;
    border: 20px solid #eff0f3;
    background: #fff;
    border-radius: 50%;
    position: relative;
    margin: 0 auto;
  }

  .cirdiv {
    background: url(../assets/cir.png) no-repeat;
    width: 226px;
    height: 226px;
    background-size: 100% 100%;
    animation: fadenum 3s linear infinite;
    position: absolute;
    top: -4px;
    left: -4px;
  }

  .cirmain {
    text-align: center;
    padding-top: 76px;
    font-size: 15px;
    color: #969696;

    .cirfont1 {
      font-size: 48px;
      color: #b1b1b1;
      font-weight: bold;
    }
  }

  .xmicon {
    width: 50px;
    height: 50px;
  }

  .xmfont {
    color: #939393;
    font-size: 24px;
    margin-top: 10px;
    font-weight: bold;
    position: relative;
  }

  .xmfontnum {
    font-size: 60px;
    color: #4bbcf8;
    position: absolute;
    right: 0px;
    top: -65px;
  }

  .xmfont2 {
    color: #b4b4b4;
    font-size: 12px;
    margin-top: 20px;
  }

  .xmjdbg {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    position: relative;
    margin-top: 5px;
  }

  .xmjd1,
  .xmjd2,
  .xmjd3 {
    background: #53c0f8;
    border-radius: 4px;
    position: absolute;
    left: 0;
    top: 0;
    height: 8px;
  }

  .xmjd2 {
    background: #e34599;
  }

  .xmjd3 {
    background: #4753dc;
  }

  .maintopdiv {
    padding: 40px;
  }
}

@keyframes fadenum {
  100% {
    transform: rotate(-360deg);
  }
}

.editbutton {
  font-size: 20px;
  border: none;
  padding: 0 5px;
}

.meta {
  margin-top: 10px;
}
</style>
