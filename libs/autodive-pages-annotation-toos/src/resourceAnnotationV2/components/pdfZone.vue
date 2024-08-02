<template>
  <div style="display: flex; height: 100%">
    <div class="pdfleft">
      <div class="pdftop">
        <div class="pdfym">
          {{ $t('页码') + ' :' }} + {{ page }}/ {{ numPages ? numPages : '∞' }}
        </div>
        <div class="pdfname">
          <div v-if="pdftitle != ''" style="line-height: 20px">
            ( {{ $t(statusMap[resource.status]) }} ){{ pdftitle }}.pdf
          </div>
        </div>
        <div class="pdf_top_right">
          <img
            :title="$t('放大')"
            @click="jia"
            src="@/assets/task/plus.png"
          />
          <div class="pdfsf">{{ formattedZoom ? formattedZoom : 100 }} %</div>
          <img
            :title="$t('缩小')"
            @click="jian"
            src="@/assets/task/minus.png"
          />
          <img
            :title="$t('正则标注')"
            @click="cancleBar"
            v-if="selectedUtilBar.title != '初'"
            src="@/assets/task/gripper.png"
          />
          <img
            :title="$t('正则标注')"
            @click="cancleBar"
            v-if="selectedUtilBar.title == '初'"
            src="@/assets/task/gripper-selected.png"
          />
        </div>
      </div>
      <div class="pdfmain">
        <div class="bz-util" id="leftgjl">
          <div
            v-for="(items, index) in toolBars"
            :key="index"
            style="border-bottom: 5px solid #e5e5e5; padding: 0px 0"
          >
            <img
              v-for="bar in items"
              :key="bar.type"
              @click="clickBZUtilBar(bar)"
              :src="bar.url"
              :title="$t(bar.title)"
              :style="{width:index==3?'30px':'40px',height:index==3?'30px':'40px'}"
            />
          </div>
          <img
            :title="$t('暂存')"
            @click="zcbtn"
            src="@/assets/task/staging-selected.png"
            class="zc"
          />
          <img
            :title="$t('完成')"
            @click="okbtn"
            src="@/assets/task/save-selected.png"
            class="duihao"
          />
          <img
            :title="$t('下载')"
            @click="clickExportAnnotation"
            src="@/assets/task/download-selected.png"
            class="download"
          />
        </div>
        <div class="pdfmaindiv">
          <div id="pdfvuer" ref="container">
            <div id="buttons"></div>
            <pdfViewer
              ref="pdfViewer"
              :bentiMarkList="bentiMarkList"
              :relationMarkList="relationMarkList"
              @getbz="getbz"
              @addRelationCaptionOfAnnotation="addRelationCaptionOfAnnotation"
              @getgx="getgx"
              @diddelbq="getdelbq"
              @addgx="addgx"
              @editorAnnotation="editorAnnotation"
              @finishedSearch="finishedSearch"
              @finishedLoad="finishedLoad"
              @cancleBar="cancleBar"
              @clickBZUtilBar="clickBZUtilBar"
              @setResourceMarkListAnnotationActive="
                setResourceMarkListAnnotationActive
              "
              :definRelationData="definRelationData"
            ></pdfViewer>
            <div
              ref="maskContainer"
              id="mask-container"
              style="
                width: 100%;
                height: 0;
                top: 0;
                position: absolute;
                z-index: 99;
              "
            ></div>
            <div class="seachbq" id="seachbqdiv">
              <div style="padding: 6px; font-weight: bold">
                {{ $t('选择标签') }}
              </div>
              <ul>
                <li
                  @click="biaozhu(item)"
                  v-for="(item, index) in bentiMarkList"
                  :key="index"
                >
                  <span
                    :style="{ borderColor: item.color, color: item.color }"
                    >{{ $t('推荐') }}</span
                  >{{ item.definName }}
                </li>
              </ul>
            </div>
            <div class="seachbq" id="seachgxdiv">
              <div style="padding: 6px; font-weight: bold">
                {{ $t('选择关系') }}
              </div>
              <ul>
                <li
                  @click="guanxi(item)"
                  v-for="(item, index) in relationMarkList"
                  :key="index"
                >
                  <span
                    :style="{ borderColor: item.color, color: item.color }"
                    >{{ $t('推荐') }}</span
                  >{{ item.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pdfright" id="pdfslt"></div>
    <chartBar ref="chartBar"></chartBar>
    <chartGraph ref="chartGraph"></chartGraph>
  </div>
</template>

<script>
import PDFViewer from './PDFViewer.vue'
import moshuDialog from './moshuDialog.vue'
import { getUserOptToken } from '@/api/user'
import { exportAnnotation } from '@/api/export'
import { getResourceStats } from '@/api/zhiyuan'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf'

import request from 'axios'
import { baseURL } from '@/config'
import { ref } from 'vue'

const sentenceHeadTester = /((.(?![ .]))|[^.?!。？！…rn])+$/
const sentenceTailTester = /^((.(?![ .]))|[^.?!。？！…rn])+(.)3{0,2}/

import txtImg from '@/assets/task/txt.png'
import txtActiveImg from '@/assets/task/txt-selected.png'
import rectangleImg from '@/assets/task/rectangle.png'
import rectangleActiveImg from '@/assets/task/rectangle-selected.png'
import polygonImg from '@/assets/task/polygon.png'
import polygonActiveImg from '@/assets/task/polygon-selected.png'
import tableImg from '@/assets/task/table.png'
import tableActiveImg from '@/assets/task/table-selected.png'
import gripperImg from '@/assets/task/gripper.png'
import gripperActiveImg from '@/assets/task/gripper-selected.png'
import m7hov from '@/assets/m7hov.png'
import m8hov from '@/assets/m8hov.png'
import chartBar from './chartBar.vue'
import chartGraph from './chartGraph.vue'

const urlMap = {
  gripper: gripperImg,
  txt: txtImg,
  rectangle: rectangleImg,
  polygon: polygonImg,
  table: tableImg
}

const urlActiveMap = {
  gripper: gripperActiveImg,
  txt: txtActiveImg,
  rectangle: rectangleActiveImg,
  polygon: polygonActiveImg,
  table: tableActiveImg
}
export default {
  props: {
    resource: {},
    bentiMarkList: {
      type: [Array, Object],
      default: () => {
        return []
      },
    },
    relationMarkList: {
      type: [Array, Object],
      default: () => {
        return []
      },
    },
    definRelationData: {
      type: Array,
      default: []
    }
  },
  watch: {
    resource(newVal, oldVal) {
      this.currentResource = newVal
      this.initPdfZone()
    },
    bentiMarkList: {
      deep: true,
      handler(newVal) {
      },
    },
    relationMarkList(newVal, oldVal) {
    },
  },
  components: {
    pdfViewer: PDFViewer,
    moshuDialog,
    chartBar,
    chartGraph
  },
  data() {
    return {
      projectId: this.$route.query.id,
      userId: '',
      baseURL: baseURL,
      currentResource: this.resource,
      page: 1,
      numPages: 0,
      pdfdata: undefined,
      errors: [],
      scale: 1.3,
      rects: [],
      bqname: '',
      context: '',
      addgxarry: [],
      pdftitle: '',
      resourceId: '',
      doi: null,
      clickStatus: false,
      project: null,
      newformattedZoom: 100,
      newdataarry: [],
      resize: false,
      biaozhuObj: {},
      biaozhutype: 0,
      biaoqianType: 'paper',
      statusMap: { 1: '未完成', 2: '进行中', 3: '已完成' },
      toolBars: [
        [
          {
            title: '文本标注',
            type: 'txt',
            annotationType: 'textBlock',
            iconName: 'txt',
            disabled: false,
            url: txtImg,
          },
        ],
        [
          {
            title: '矩形标注',
            type: 'rectangle',
            annotationType: 'image',
            iconName: 'rectangle',
            disabled: false,
            url: rectangleImg,
          },
          {
            title: '多边形标注',
            type: 'polygon',
            annotationType: 'image',
            iconName: 'polygon',
            disabled: false,
            url: polygonImg,
          }
        ],
        [
          {
            title: '表格标注',
            type: 'rectangle',
            annotationType: 'table',
            iconName: 'table',
            disabled: false,
            url: tableImg,
          },
        ],
        [
          {
            title: '柱状图',
            type: 'chartBar',
            annotationType: 'table',
            iconName: 'table',
            disabled: false,
            url: m7hov,
            orgUrl: m7hov,
            activeUrl: m7hov
          },
          {
            title: '图谱',
            type: 'chartGraphOverlap',
            annotationType: 'table',
            iconName: 'table',
            disabled: false,
            url: m8hov,
            orgUrl: m8hov,
            activeUrl: m8hov
          }
        ]
      ],
      moshuAcceptTypes: ['rectangle', 'polygon', 'table'],
      selectedUtilBar: '',
      dbOnce: true,
      dbTimer: null,
    }
  },
  computed: {
    formattedZoom() {
      return Number.parseInt(this.scale * 100)
    },
  },
  mounted() {
    this.initPdfZone()
    if (this.$route.query.userId) {
      this.userId = this.$route.query.userId
    } else {
      this.userId = JSON.parse(localStorage.getItem('user')).id
    }
    this.listener = this.createEventListener()
    document.addEventListener('keypress', this.listener)
    let that = this
    document.addEventListener('scroll', this.pageScroll, true)

    window.addgx = function (e, x, y) {
      if (that.addgxarry.length == 0) {
        that.addgxarry.push(e)
        document.getElementsByClassName(e)[0].style.fontWeight = 'bold'
      } else if (
        that.addgxarry.length == 1 &&
        that.addgxarry.indexOf(e) == -1
      ) {
        that.addgxarry.push(e)
        document.getElementById('seachgxdiv').style.display = 'block'
        document.getElementById('seachgxdiv').style.top = y + 10 + 'px'
        document.getElementById('seachgxdiv').style.left = x + 'px'
        document.getElementsByClassName(e)[0].style.fontWeight = 'bold'
      } else {
        document.getElementsByClassName(that.addgxarry[0])[0].style.fontWeight =
          'normal'
        document.getElementsByClassName(that.addgxarry[1])[0].style.fontWeight =
          'normal'
        that.addgxarry = []
        document.getElementById('seachgxdiv').style.display = 'none'
      }
    }
  },
  unmounted() {
    document.removeEventListener('scroll', this.pageScroll, true)
  },
  unmounted() {
    document.removeEventListener('keypress', this.listener)
  },
  methods: {
    refineSen() {
      return this.$refs.pdfViewer.refineSen()
    },
    pageScroll() {
      this.changePage()
      this.stickyNav()
    },
    setDefinRelation(data) {
      this.$refs.pdfViewer.setDefinRelation(data)
    },
    cilckBiaoqianTab(e) {
      this.biaoqianType = e
    },
    cancleBar() {
      this.clickBZUtilBar({
        title: '初',
        type: '',
        annotationType: '',
        iconName: 'gripper',
        disabled: false,
        url: gripperImg,
      })
    },
    clickBZUtilBar(e) {
      if (e.type === 'chartBar') {
        this.showCharBarDialog()
        return
      }

      if (e.type === 'chartGraphOverlap') {
        this.showCharGraph()
        return
      }

      if (e.disabled) {
        return
      }
      if (e.title == this.selectedUtilBar.title) {
        return
      }

      e.url = urlActiveMap[e.iconName]
      if (this.selectedUtilBar != '') {
        this.selectedUtilBar.url = urlMap[this.selectedUtilBar.iconName] 
      }
      this.selectedUtilBar = e
      this.$refs.pdfViewer.setAnnotationOperation(this.selectedUtilBar)
    },

    async showCharBarDialog() {
      let anno = []
      this.bentiMarkList.map(item=>{
        if (item.annotationList && item.annotationList.length>0) {
          anno.push({
            name: item.definName,
            value: item.annotationList.length
          })
        }
      })
      this.$refs.chartBar.show({anno})
    },
    showCharGraph() {
      const data = []
      const links = []
      const categories = []

      this.bentiMarkList.forEach((item, index) => {
        if (item.annotationList && item.annotationList.length>0) {
          data.push({
          id: item.id,
          name: item.definName,
          symbolSize: (item.annotationList.length || 1) * 10,
          value: item.annotationList.length || 1,
          category: index
        })

        categories.push({
          name: item.definName
        })
        }
      })

      this.definRelationData.forEach(item => {
        links.push({
          source: item.fromDefinId,
          target: item.toDefinId
        })
      })
      this.$refs.chartGraph.show(data, links, categories)
    },

    async getRegData(item) {
      if (!item.regex) {
        return
      }
      if (item.regex[item.regex.length - 1] != 'g') {
        item.regex += 'g'
      }
      const checkobj = this.bentiMarkList.find(
        (d) => d.definName === item.definName
      )
      const reg = eval(item.regex)
      this.$refs.pdfViewer.setReg(reg, item, checkobj)
    },
    async getDictData(item) {
      if (!item.dict) {
        return
      }
      var dictUrl = item.dict
      var otpTokenResult = await getUserOptToken()
      dictUrl += '?otpToken=' + otpTokenResult.data

      const resp = await request({ method: 'GET', url: dictUrl })
      const data = resp.data
      const words = this._getWords(data)
      const checkobj = this.bentiMarkList.find(
        (d) => d.definName === item.definName
      )
      this.clickStatus = true
      this.$refs.pdfViewer.setWords(words, item, checkobj)
    },

    finishedSearch() {
      this.clickStatus = false
      if (this.clickStatus) {
        this.$message({
          message: '匹配完成',
          type: 'message',
        })
        return
      }
      this.$emit( 'finishedSearch')
    },
    finishedLoad() {
      this.$emit( 'finishedLoad')
    },

    getbz(e) {
      this.$emit( 'getbz', e)
    },

    addRelationCaptionOfAnnotation(e) {
      this.$emit( 'addRelationCaptionOfAnnotation', e)
    },
    getgx(e) {
      this.$emit( 'getgx', e)
    },
    editorAnnotation(fId) {
      this.$emit( 'editorAnnotation', fId)
    },
    deleteAnnotation(id) {
      this.$refs.pdfViewer.deleteAnnotation(id)
    },
    setAnnotationDisplay(annatation) {
      this.$refs.pdfViewer.setAnnotationDisplay(annatation)
    },

    setAnnotationActive(fId, isActive) {
      this.$refs.pdfViewer.setAnnotationActive(fId, isActive)
    },
    setResourceMarkListAnnotationActive(fId, isActive) {
      this.$emit( 'setResourceMarkListAnnotationActive', fId, isActive)
    },

    setAnnotationRelationList(data) {
      this.$refs.pdfViewer.setAnnotationRelationList(data)
    },
    getdelbq(e) {
      this.$emit( 'getdelbq', e)
    },

    addgx(e) {
      if (this.addgxarry.length == 0) {
        this.addgxarry.push(e)
        document.getElementById(e).style.fontWeight = 'bold'
      } else if (
        this.addgxarry.length == 1 &&
        this.addgxarry.indexOf(e) == -1
      ) {
        this.addgxarry.push(e)

        var container = document.getElementById(e)
        container.style.fontWeight = 'bold'
        var rect = container.getBoundingClientRect()
        var parentrect = document
          .getElementById('preview-pdf')
          .getBoundingClientRect()
        var searchgxdiv = document.getElementById('seachgxdiv')
        searchgxdiv.style.display = 'block'
        searchgxdiv.style.top = rect.top - parentrect.top + 10 + 'px'
        searchgxdiv.style.left = rect.left - parentrect.left + 'px'
      } else {
        document.getElementById(this.addgxarry[0]).style.fontWeight = 'normal'
        document.getElementById(this.addgxarry[1]).style.fontWeight = 'normal'
        this.addgxarry = []
        document.getElementById('seachgxdiv').style.display = 'none'
      }
    },
    _getWords(data) {
      data = data.replace(/,/g, '')
      data = data.replace(/[\n\r\,]/g, ',')
      return data.split(',')
    },
    debounce(fn) {
      if (this.dbOnce && !this.dbTimer) {
        this.dbOnce = false;
        this.dbTimer = setTimeout(() => {
          console.log("。。。。触发")
          fn.apply(this);
          this.dbOnce = true;
          clearTimeout(this.dbTimer);
          this.dbTimer = null;
        }, 800)
      }
    },
    jian() {
      this.scale = parseFloat(this.scale)
      if (this.scale>0.85) {
        this.scale -= 0.1
        this.scale = this.scale.toFixed(1)
        this.formattedZoom = Number.parseInt(this.scale * 100)
        this.debounce(this.jianH);
      }
    },
    jianH() {
      this.pdfdata.then(res=>{
        this.$refs.pdfViewer.setScale(this.scale, res)
      })
    },
    jia() {
      this.scale = parseFloat(this.scale)
      if (this.scale < 2) {
        this.scale += 0.1
        this.scale = this.scale.toFixed(1)
        this.formattedZoom = Number.parseInt(this.scale * 100)
        this.debounce(this.jiaH);
      }
    },
    jiaH () {
      this.pdfdata.then(res=>{
        this.$refs.pdfViewer.setScale(this.scale, res)
      })
    },
    okbtn() {
      if (this.clickStatus) {
        this.$message({
          message: '正在匹配中',
          type: 'error',
        })
        return
      }
      this.$emit( 'getok', 'saveok')
    },
    zcbtn() {
      if (this.clickStatus) {
        this.$message({
          message: '正在匹配中',
          type: 'error',
        })
        return
      }
      this.$emit( 'getzc')
    },
    inittag(arry0) {
      let that = this
      var arry = []
      if (arry0) {
        this.newdataarry = arry0
        arry = arry0
      } else {
        arry = this.newdataarry
      }
      if (arry.length == 0) return

      this.$refs.maskContainer.innerHTML = ''
      const hintBgColor = '#ffffff'
      const hintColor = '#333'
      if (arry[0].annotationList && arry[0].annotationList.length != 0) {
        this.newformattedZoom = JSON.parse(
          arry[0].annotationList[0].container
        ).formattedZoom
      }
      for (let i = 0; i < arry.length; i++) {
        const maskColor = arry[i].color
        const hintBorderColor = arry[i].color
        for (let j = 0; j < arry[i].annotationList.length; j++) {
          const hintEl = document.createElement('div')
          Object.assign(hintEl.style, {
            position: 'absolute',
            left:
              ((arry[i].annotationList[j].x -
                JSON.parse(arry[i].annotationList[j].container).left) *
                that.formattedZoom) /
                JSON.parse(arry[i].annotationList[j].container).formattedZoom +
              'px',
            top:
              ((arry[i].annotationList[j].y -
                JSON.parse(arry[i].annotationList[j].container).top -
                26) *
                that.formattedZoom) /
                JSON.parse(arry[i].annotationList[j].container).formattedZoom +
              'px',
            color: hintColor,
            borderRadius: '6px',
            padding: '5px 10px',
            backgroundColor: hintBgColor,
            border: '1px solid ' + hintBorderColor,
            borderLeft: '5px solid ' + hintBorderColor,
          })
          hintEl.innerHTML =
            '<span onclick=addgx("' +
            (arry[i].annotationList[j].shortcutKey || '') +
            arry[i].annotationList[j].x +
            '-' +
            arry[i].annotationList[j].y +
            '",' +
            (arry[i].annotationList[j].x - arry[i].annotationList[j].left) +
            ',' +
            (arry[i].annotationList[j].y -
              JSON.parse(arry[i].annotationList[j].container).top) +
            ')>' +
            arry[i].annotationList[j].name.slice(0, 30) +
            '...</span>' +
            '<span onclick=delfont("' +
            (arry[i].annotationList[j].shortcutKey || '') +
            arry[i].annotationList[j].x +
            '-' +
            arry[i].annotationList[j].y +
            '") class="gbclose">×</span>'
          hintEl.className =
            arry[i].annotationList[j].shortcutKey +
            arry[i].annotationList[j].x +
            '-' +
            arry[i].annotationList[j].y
          this.$refs.maskContainer.append(hintEl)

          let newrects = JSON.parse(arry[i].annotationList[j].rects)
          for (let ind in newrects) {
            const maskEl = document.createElement('div')
            Object.assign(maskEl.style, {
              position: 'absolute',
              left:
                ((newrects[ind].x -
                  JSON.parse(arry[i].annotationList[j].container).left) *
                  that.formattedZoom) /
                  JSON.parse(arry[i].annotationList[j].container)
                    .formattedZoom +
                'px',
              top:
                ((newrects[ind].y -
                  JSON.parse(arry[i].annotationList[j].container).top) *
                  that.formattedZoom) /
                  JSON.parse(arry[i].annotationList[j].container)
                    .formattedZoom +
                'px',
              width:
                ((newrects[ind].width + 4) * that.formattedZoom) /
                  JSON.parse(arry[i].annotationList[j].container)
                    .formattedZoom +
                'px',
              height:
                ((newrects[ind].height + 4) * that.formattedZoom) /
                  JSON.parse(arry[i].annotationList[j].container)
                    .formattedZoom +
                'px',
              backgroundColor: maskColor,
              opacity: 0.3,
            })
            maskEl.className =
              arry[i].annotationList[j].shortcutKey +
              arry[i].annotationList[j].x +
              '-' +
              arry[i].annotationList[j].y
            this.$refs.maskContainer.append(maskEl)
          }
        }
      }
    },
    guanxi(item) {
      this.$emit( 'getgx', { item: item, addgxarry: this.addgxarry })
      document.getElementById('seachgxdiv').style.display = 'none'
    },

    handle_pdf_link: function (params) {
      var page = document.getElementById(String(params.pageNumber))
      page.scrollIntoView()
    },
    async getProjectInfo(prjId) {
      const resp = await request({ method: 'GET', url: '/project/' + prjId })
      this.project = resp.data
    },

    async initPdfZone() {
      if (!this.currentResource.url || this.currentResource.length == 0) {
        return
      }

      var resource = this.currentResource
      this.getProjectInfo(resource.projectId)

      this.doi = resource.doi
      this.resourceId = resource.id

      document.getElementById('pdfslt').innerHTML = ''
      this.pdftitle = resource.title
      var self = this

      var otpTokenResult = await getUserOptToken()

      self.pdfdata = getDocument({
        url: baseURL + resource.url + '?otpToken=' + otpTokenResult.data
      }).promise

      self.pdfdata.then((pdf) => {
        this.$refs.pdfViewer.setPdf(pdf, this.resource)
        this.clickBZUtilBar(this.toolBars[0][0])

        self.numPages = pdf.numPages
        var pages = []
        while (pages.length < pdf.numPages) pages.push(pages.length + 1)
        return Promise.all(
          pages.map(function (num) {
            var div1 = document.createElement('div')
            div1.id = 'slt' + num
            div1.onclick = function () {
              var page = document.getElementById('textLayer' + num)
              page.scrollIntoView()
            }
            document.getElementById('pdfslt').appendChild(div1)
            return pdf
              .getPage(num)
              .then(self.makeThumb)
              .then(function (canvas) {
                div1.appendChild(canvas)
                self.$forceUpdate()
              })
          })
        )
      })
    },
    findPos(obj) {
      let xx = obj?.getBoundingClientRect()
      if (xx) {
        return Math.abs(xx.top)
      }
    },

    stickyNav() {
      var sticky = document.getElementById('buttons').offsetTop
      if (window.pageYOffset >= sticky) {
        document.getElementById('buttons').classList.remove('hidden')
      } else {
        document.getElementById('buttons').classList.add('hidden')
      }
    },

    changePage() {
      if (!document.getElementById('textLayer1')) {
        return
      }
      var self = this
      var maint =
        self.findPos(document.getElementById('textLayer1')) +
        self.findPos(document.getElementById('leftgjl')) +
        10
      var mainh = document.getElementById('textLayer1').offsetHeight
      self.page = Math.ceil(maint / mainh)
      this.$refs.pdfViewer.setCurrentPage(self.page)
      var divarry = document
        .getElementById('pdfslt')
        .getElementsByTagName('div')
      for (let i = 0; i < divarry.length; i++) {
        divarry[i].classList.remove('pagehov')
      }
      document.getElementById('slt' + self.page).classList.add('pagehov')
    },
    makeThumb(page) {
      var vp = page.getViewport({ scale: 1 })
      var canvas = document.createElement('canvas')
      var scalesize = 0.2
      canvas.width = vp.width * scalesize
      canvas.height = vp.height * scalesize
      canvas.className = 'slt'
      var scale = Math.min(canvas.width / vp.width, canvas.height / vp.height)
      return page
        .render({
          canvasContext: canvas.getContext('2d'),
          viewport: page.getViewport({ scale: scale }),
        })
        .promise.then(function () {
          return canvas
        })
    },
    createEventListener() {
      return (event) => {
        if (this.addgxarry.length == 2) {
          let checkobj = this.relationMarkList.filter(
            (item) => item.shortcutKey.toUpperCase() == event.key.toUpperCase()
          )[0]
          if (checkobj && checkobj != undefined) {
            this.guanxi(checkobj)
          }
        } else {
          let checkobj = this.bentiMarkList.filter(
            (item) => item.shortcutKey.toUpperCase() == event.key.toUpperCase()
          )[0]
          if (checkobj && checkobj != undefined) {
            this.biaozhu(checkobj)
          }
        }
      }
    },

    biaozhu(checkobj, tag, figure, sen) {
      const container = document.getElementById('pdfvuer')
      const maskColor = checkobj.color
      const hintBorderColor = checkobj.color
      const hintBgColor = '#ffffff'
      const hintColor = '#333'
      const selection = window.getSelection()
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i)
        const clientRects = range.getClientRects()
        const rects = clientRects.length == 0 ? this.rects : clientRects
        const firstRect = rects[0]
        const hintEl = document.createElement('div')
        if (tag) {
          hintEl.setAttribute('data-tag', tag)
        }
        if (figure) {
          hintEl.setAttribute('data-figure', figure)
        }
        Object.assign(hintEl.style, {
          position: 'absolute',
          left: firstRect.x - container.getBoundingClientRect().left + 'px',
          top: firstRect.y - container.getBoundingClientRect().top - 26 + 'px',
          color: hintColor,
          borderRadius: '6px',
          padding: '5px 10px',
          backgroundColor: hintBgColor,
          border: '1px solid ' + hintBorderColor,
          borderLeft: '5px solid ' + hintBorderColor,
        })
        hintEl.innerHTML =
          '<span onclick=addgx("' +
          (checkobj.shortcutKey || '') +
          firstRect.x +
          '-' +
          firstRect.y +
          '",' +
          (firstRect.x - container.getBoundingClientRect().left) +
          ',' +
          (firstRect.y - container.getBoundingClientRect().top) +
          ')>' +
          (selection.toString() != ''
            ? selection.toString().slice(0, 30)
            : this.bqname.slice(0, 30)) +
          '...</span>' +
          '<span onclick=delfont("' +
          this.biaozhuObj.fId +
          '") class="gbclose">×</span>'
        this.$refs.maskContainer.append(hintEl)

        hintEl.id = this.biaozhuObj.fId
        hintEl.className = this.biaozhuObj.fId + ''
        ;(this.biaozhuObj.shortcutKey = checkobj.shortcutKey
          ? checkobj.shortcutKey
          : null),
          (this.biaozhuObj.definitionId = checkobj.definitionId),
          this.$emit( 'getbz', this.biaozhuObj)
        for (let rect of rects) {
          const maskEl = document.createElement('div')
          maskEl.addEventListener('click', () => {
            addgx(
              (checkobj.shortcutKey || '') + firstRect.x + '-' + firstRect.y,
              firstRect.x - container.getBoundingClientRect().left,
              firstRect.y - container.getBoundingClientRect().top
            )
          })
          Object.assign(maskEl.style, {
            position: 'absolute',
            left: rect.x - container.getBoundingClientRect().left + 'px',
            top: rect.y - container.getBoundingClientRect().top + 'px',
            width: rect.width + 4 + 'px',
            height: rect.height + 4 + 'px',
            backgroundColor: maskColor,
            opacity: 0.3,
          })
          maskEl.className = this.biaozhuObj.fId + ''
          this.$refs.maskContainer.append(maskEl)
        }
      }
    },
    async getRangeOfRobotOntology(sen, text, matchWholeWord) {
      const pdfEl = this.$refs.container
      let words = sen.split(' ')
      let wordIdx = 0

      const itor = document.createNodeIterator(pdfEl, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const startIdx = wordIdx
          while (
            wordIdx < words.length &&
            node.textContent.includes(
              words.slice(startIdx, wordIdx + 1).join(' ')
            )
          ) {
            wordIdx++
          }
          const found = wordIdx > startIdx
          return found ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        },
      })

      const els = []
      let n = itor.nextNode()
      while (n) {
        els.push(n.parentElement)
        n = itor.nextNode()
      }
      const elTexts = els.map((d) => d.textContent)
      const termRanges = indexOfTerm(elTexts, text)

      const annotatedMarks = this.bentiMarkList.flatMap((d) => d.annotationList)
      const container = document.getElementById('pdfvuer')

      const result = termRanges.map(
        ({ startTerm, startOffset, endTerm, endOffset }) => {
          const range = new Range()
          range.setStart(els[startTerm].firstChild, startOffset)
          range.setEnd(els[endTerm].firstChild, endOffset)
          return range
        }
      )

      await new Promise((resolve) => setTimeout(resolve))
      return result

      function indexOfTerm(terms, searchText) {
        const fullTerm = terms.join(' ')
        const termStartIndexes = terms.map((_, i) => {
          return terms
            .slice(0, i)
            .map((d) => d.length + 1)
            .reduce((a, b) => a + b, 0)
        })
        const termIndexRanges = termStartIndexes.map((d, i) => [
          d,
          termStartIndexes[i + 1] - 1 || fullTerm.length - 1,
          i,
        ])
        const resultIndexes = []
        let start = fullTerm.indexOf(searchText)
        let end = Math.min(start + searchText.length, fullTerm.length - 1)
        while (start >= 0 && end <= fullTerm.length) {
          const termIncluded = matchWholeWord
            ? 
              (start === 0 || fullTerm[start - 1] === ' ') &&
              (end >= fullTerm.length || fullTerm[end] === ' ')
            : true
          if (termIncluded) {
            const startRange = termIndexRanges.find(
              (r) => r[0] <= start && start <= r[1]
            )
            const endRange = termIndexRanges.find(
              (r) => r[0] <= end && end <= r[1]
            )
            resultIndexes.push({
              startTerm: startRange[2],
              startOffset: start - startRange[0],
              endTerm: endRange[2],
              endOffset: end - endRange[0],
            })
          }
          start = fullTerm.indexOf(searchText, end)
          end = Math.min(start + searchText.length, fullTerm.length - 1)
        }
        return resultIndexes
      }
    },

    async clickExportAnnotation() {
      var otpTokenResult = await getUserOptToken()
      var params = {
        resourceId: this.resource.id,
        layerId: this.userId,
        projectId: this.projectId,
        otpToken: otpTokenResult.data,
      }
      exportAnnotation(params)
    },

    drawScaled() {
      let pdfDomList = this.$refs.pdfDom
      pdfDomList.forEach((item) => {
        item.drawScaled('page-width')
      })
    },
  }
}

async function pdfDataToText(pdf) {
  const lines = await Promise.all(
    new Array(pdf.numPages).fill(null).map(async (_, pageNumber) => {
      const page = await pdf.getPage(pageNumber + 1)
      const textContent = await page.getTextContent()
      return textContent.items.map((d) => d.str).join(' ')
    })
  )

  return lines.join('\r\n')
}
</script>

<style lang="scss">
#pdfvuer {
  position: relative;
  margin: 0 auto;
}
.pdfright {
  width: 130px;
  background: #f9f9f9;
  overflow: auto;
  text-align: center;
  div {
    margin-top: 10px;
    cursor: pointer;
  }
  .slt {
    border-radius: 8px;
  }
  .slt:hover,
  .pagehov canvas {
    border: 5px solid #575bca;
  }
}
.pdfleft {
  width: calc(100% - 130px);
  .pdftop {
    background: #fff;
    line-height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    color: #595959;
    padding: 15px;
    height: 44px;
    border-bottom: 1px solid #979797;
    .pdfym {
      width: 160px;
    }
    .pdfname {
      font-weight: bold;
      max-width: 600px;
      word-break: break-all;
    }
    .pdf_top_right {
      display: flex;
      align-items: center;
      img {
        cursor: pointer;
        width: 44px;
        height: 44px;
      }
      .pdfsf {
        width: 90px;
        text-align: center;
        font-size: 18px;
      }
    }
  }
  .pdfmain {
    display: flex;
    align-items: flex-start;
    height: calc(100% - 75px);
    .bz-util {
      background: #fff;
      width: 50px;
      border-right: 1px solid #979797;
      height: 100%;
      text-align: center;
      position: relative;

      img {
        cursor: pointer;
        width: 44px;
        height: 44px;
        margin: 19px 0 0 0;
      }

      .download {
        cursor: pointer;
        position: absolute;
        bottom: 130px;
        left: 3px;
      }

      .duihao {
        cursor: pointer;
        position: absolute;
        bottom: 10px;
        left: 3px;
      }
      .zc {
        cursor: pointer;
        position: absolute;
        bottom: 70px;
        left: 3px;
      }
    }
    .pdfmaindiv {
      height: 100%;
      flex: 1;
      overflow: scroll;
      background: #e5e5e5;
    }
  }
  .gbclose {
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
  }
  .seachbq {
    position: absolute;
    z-index: 9999;
    left: 0;
    top: 0;
    background: #fff;
    max-height: 300px;
    overflow: auto;
    display: none;
    width: 200px;
    border-radius: 8px;
    box-shadow: 0px 0px 8px 2px rgba(201, 200, 208, 0.35);
    li {
      font-size: 12px;
      padding: 6px;
      cursor: pointer;
      span {
        border: 1px solid;
        height: 15px;
        display: inline-block;
        line-height: 15px;
        border-radius: 8px;
        margin-right: 10px;
        padding: 3px 5px;
      }
    }
    li:hover {
      background: #f4f4f4;
    }
  }
}
</style>
