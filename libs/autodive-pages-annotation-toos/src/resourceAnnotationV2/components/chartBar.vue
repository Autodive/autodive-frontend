<template>
  <el-dialog :title="$t('柱状图')" custom-class="outdivstyle" v-model="dialogVisible" width="60%">
    <div class="contain">
      <div class="chart" id="chartsAnno"></div>
      <div class="chart" id="chartsRel"></div>
    </div>
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'moshuDialog',
  components: {},
  data() {
    return {
      dialogVisible: false,
      chartsAnno: null,
      chartsRel: null,
      responseData: {}
    }
  },
  computed: {
    annoOption() {
      const anno = this.responseData['anno']

      const xAxisData = []
      const seriesData = []
      if (anno) {
        anno.forEach((item) => {
          xAxisData.push(item.name)
          seriesData.push(item.value)
        })
      }

      return {
        title: {
          text: this.$t('本体数量')
        },
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: seriesData,
            type: 'bar'
          }
        ]
      }
    },
    relOption() {
      const rel = this.responseData['rel']

      const xAxisData = []
      const seriesData = []
      if (rel) {
        rel.forEach((item) => {
          xAxisData.push(item.name)
          seriesData.push(item.value)
        })
      }

      return {
        title: {
          text: this.$t('关系数量')
        },
        xAxis: {
          type: 'category',
          data: xAxisData
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: seriesData,
            type: 'bar'
          }
        ]
      }
    }
  },
  methods: {
    show(responseData) {
      this.dialogVisible = true
      this.responseData = responseData || {}

      this.$nextTick(() => {
        this.initChart()
      })
    },
    initChart() {
      const chartsAnnoDom = document.getElementById('chartsAnno')
      this.chartsAnno = echarts.init(chartsAnnoDom)

      if (this.responseData['anno'] && this.responseData['anno'].length) {
        this.chartsAnno.setOption(this.annoOption)
      } else {
        this.chartsAnno.showLoading({
          text: this.$t('暂无数据'),
          showSpinner: false,
          textColor: '#9d9d9d',
          maskColor: 'rgba(255, 255, 255, 0.8)',
          fontSize: '25px',
          fontWeight: 'bold',
          fontFamily: 'Microsoft YaHei'
        })
      }

      if (this.responseData['rel'] && this.responseData['rel'].length) {
        const chartsRelDom = document.getElementById('chartsRel')
        this.chartsRel = echarts.init(chartsRelDom)
        this.chartsRel.setOption(this.relOption)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.contain {
  display: flex;
  height: 400px;
  .chart {
    width: 50%;
  }
}
</style>
