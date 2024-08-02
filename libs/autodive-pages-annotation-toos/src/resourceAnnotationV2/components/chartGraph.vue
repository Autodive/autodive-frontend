<template>
  <el-dialog :title="$t('标注图谱')" custom-class="outdivstyle" v-model="dialogVisible" width="60%">
    <div class="contain">
      <div class="chart" id="chart"></div>
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

      seriesData: [],
      seriesLinks: [],
      seriesCategories: []
    }
  },
  computed: {
    options() {
      return {
        tooltip: {},
        series: [
          {
            name: 'Les Miserables',
            type: 'graph',
            layout: 'force',
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut',
            force: {
              friction: 0
            },
            data: this.seriesData,
            links: this.seriesLinks,
            categories: this.seriesCategories,
            roam: true,
            label: {
              show: true,
              position: 'right',
              formatter: '{b}'
            },
            labelLayout: {
              hideOverlap: true
            },
            scaleLimit: {
              min: 0.4,
              max: 2
            },
            lineStyle: {
              color: 'source',
              curveness: 0.3
            }
          }
        ]
      }
    }
  },
  methods: {
    show(seriesData, seriesLinks, seriesCategories) {
      this.dialogVisible = true

      this.seriesData = seriesData || []
      this.seriesLinks = seriesLinks || []
      this.seriesCategories = seriesCategories || []

      this.$nextTick(() => {
        this.initChart()
      })
    },
    initChart() {
      const chartsAnnoDom = document.getElementById('chart')
      this.chartsAnno = echarts.init(chartsAnnoDom)

      this.chartsAnno.setOption(this.options)
    }
  }
}
</script>

<style lang="scss" scoped>
.contain {
  display: flex;
  height: 400px;
  .chart {
    width: 100%;
  }
}
</style>
