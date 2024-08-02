<template>
  <div style="display: flex; height: 100%; flex-direction: column">
    <div class="image-zone-top">
      <div class="title">
        <div v-if="title != ''" style="line-height: 20px">
          ( {{ $t(statusMap[resource.status]) }} ){{ title }}
        </div>
      </div>
      <div class="right-scale">
        <img @click="changeScale(0.1)" src="@/assets/task/plus.png" />
        <div class="scale-value">
          {{ formattedZoom ? formattedZoom : 100 }} %
        </div>
        <img @click="changeScale(-0.1)" src="@/assets/task/minus.png" />
        <img @click="cancleBar" v-if="selectedUtilBar.title != '初'" src="@/assets/task/gripper.png" />
        <img @click="cancleBar" v-if="selectedUtilBar.title == '初'" src="@/assets/task/gripper-selected.png" />
      </div>
    </div>
    <div class="image-zone-main">
      <div class="bz-util" id="leftgjl">
        <div v-for="(items, index) in toolBars" :key="index" class="tool-bar-view">
          <template v-for="bar in items" :key="bar.type">
            <img @click="clickBZUtilBar(bar)" :src="bar.url" v-if="robotRevealShow(bar)" :style="{width:index==1?'30px':'40px',height:index==1?'30px':'40px'}" :title="$t(bar.title)" />
          </template>
        </div>
        <template v-if="isEdit">
          <img :title="$t('暂存')" @click="zcbtn" src="@/assets/task/staging-selected.png" class="zc" />
          <img :title="$t('完成')" @click="okbtn" src="@/assets/task/save-selected.png" class="duihao" />
          <img :title="$t('下载')" @click="clickExportAnnotation" src="@/assets/task/download-selected.png" class="download" />
        </template>
      </div>
      <div class="image-viewer" id="imageZoneMain">
        <div :style="'transform:scale(' + scale + ')'">
          <div :style="`margin:0 auto; width:${imgWidth}px; height:${imgHeight}px; position: relative`">
            <img id="resourceImg" />
            <moshuViewer class="moshu" id="imgMoshu" ref="imgMoshu" :page="1" @cancleCurrentMoshuAnnotation="cancleCurrentMoshuAnnotation" @finishMoshuAnnotationOperation="finishMoshuAnnotationOperation" />
            <canvas id="viewerCanvas" class="viewer-canvas"></canvas>

            <div ref="maskContainer" id="mask-container" style="
                width: 100%;
                height: 0;
                top: 0;
                position: absolute;
                z-index: 99;
              "></div>
            <div class="mark-list-pop" id="bentiMarkListPop">
              <div style="padding: 6px; font-weight: bold">
                {{ $t('选择标签') }}
              </div>
              <ul>
                <li @click="didSelectedMark(item)" v-for="(item, index) in filterBentiMarkList" :key="index">
                  <span :style="{ borderColor: item.color, color: item.color }">{{ $t('推荐') }}</span>{{ item.definName }}
                </li>
              </ul>
            </div>

            <div class="relation-list-pop" id="relationListPop">
              <div style="padding: 6px; font-weight: bold">
                {{ $t('选择关系') }}
              </div>
              <ul>
                <li @click="addGuanxi(item)" v-for="(item, index) in filterRelations" :key="index">
                  <span :style="{ borderColor: item.color, color: item.color }">{{ $t('推荐') }}</span>{{ item.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <chartBar ref="chartBar"></chartBar>
    <chartGraph ref="chartGraph"></chartGraph>
  </div>
</template>

<script>
import { $emit } from '@/utils/gogocodeTransfer'
import moshuViewer from './moshuViewer.vue'
import chartBar from './chartBar.vue'
import chartGraph from './chartGraph.vue'
import { getUserOptToken } from '@/api/user'
import { exportAnnotation } from '@/api/export'
import { getMattingBlob, uploadMattingBlob } from './matting.js'
import rectangleImg from '@/assets/task/rectangle.png'
import rectangleActiveImg from '@/assets/task/rectangle-selected.png'
import polygonImg from '@/assets/task/polygon.png'
import polygonActiveImg from '@/assets/task/polygon-selected.png'
import gripperImg from '@/assets/task/gripper.png'
import gripperActiveImg from '@/assets/task/gripper-selected.png'
import m7hov from '@/assets/m7hov.png'
import m8hov from '@/assets/m8hov.png'
import { baseURL } from "@/config"

export default {
  props: {
    resource: {},
    bentiMarkList: {
      type: [Array, Object],
      default: () => {
        return []
      }
    },
    relationMarkList: {
      type: [Array, Object],
      default: () => {
        return []
      }
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    definRelationData: {
      type: Array,
      default: []
    }
  },
  watch: {
    resource(newVal, oldVal) {
      console.log('zone get new resource')
      console.log(this.resource)
      this.currentResource = newVal
      this.initZone()
    },
    bentiMarkList: {
      deep: true,
      handler(newVal) {
        console.log('bentiMarkList change')
      }
    },
    relationMarkList(newVal, oldVal) {
      console.log('relationMarkList change')
    }
  },
  components: {
    moshuViewer,
    chartBar,
    chartGraph
  },
  data() {
    return {
      scale: 1,
      userId: '',
      baseURL: baseURL,
      projectId: this.$route.query.id,
      currentResource: this.resource,
      statusMap: { 1: '未完成', 2: '进行中', 3: '已完成' },
      title: '',
      imgHeight: 0,
      imgWidth: 0,
      annotationList: [],
      idToAnnoMap: {},
      addRelationAnnotations: [],
      relationList: [],
      filterRelations: [],
      annotationRelationList: [],
      biaoqianType: 'paper',
      selectedUtilBar: '',
      filterBentiMarkList: [],
      toolBars: [
        [
          {
            title: '矩形标注',
            type: 'rectangle',
            annotationType: 'image',
            iconName: 'rectangle',
            disabled: false,
            url: rectangleImg,
            orgUrl: rectangleImg,
            activeUrl: rectangleActiveImg
          },
          {
            title: '多边形标注',
            type: 'polygon',
            annotationType: 'image',
            iconName: 'polygon',
            disabled: false,
            url: polygonImg,
            orgUrl: polygonImg,
            activeUrl: polygonActiveImg
          }
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

      annotationOperation: {
        annotation: {},
        type: ''
      },

      ismouseover: false
    }
  },
  computed: {
    formattedZoom() {
      return Number.parseInt(this.scale * 100)
    }
  },
  mounted() {
    console.log(' mounted')
    this.initZone()
    if (this.$route.query.userId) {
      this.userId = this.$route.query.userId
    } else {
      this.userId = JSON.parse(localStorage.getItem('user')).id
    }
    var that = this
    document.getElementById('imageZoneMain').addEventListener(
      'mouseup',
      async function (e) {
        console.log('mouseup')
        var currentAnnotationType = that.annotationOperation.annotation.annotationType
        if (that.addRelationAnnotations.length >= 2) {
          setTimeout(() => {
            that.updateRelationMarkPopDisplay('none')
          }, 500)
        }
      },
      true
    )

    window.addGX = function (fId, titleId) {
      console.log('addGX' + that.addRelationAnnotations.length)
      console.log('fId=' + fId)
      console.log('fId=' + titleId)
      if (that.addRelationAnnotations.length == 0) {
        that.addRelationAnnotations.push(fId)
        console.log('1')
        var firstEl = document.getElementById(titleId)
        if (firstEl.style) {
          firstEl.style.fontWeight = 'bold'
        }
      } else if (
        that.addRelationAnnotations.length == 1 &&
        that.addRelationAnnotations.indexOf(fId) == -1
      ) {
        that.addRelationAnnotations.push(fId)
        var heard = document.getElementById(titleId)
        if (heard.style) {
          heard.style.fontWeight = 'bold'
        }
        var x = 0
        var y = 0
        var el = document.getElementById(titleId)

        do {
          x += el.offsetLeft
          y += el.offsetTop
          el = el.parentElement
          console.log(el)
          console.log('y=' + y)
        } while (el.id != 'mask-container')

        y += 20
        console.log('2')
        var relationPop = document.getElementById('relationListPop')
        relationPop.style.display = 'block'
        relationPop.style.top = y + 10 + 'px'
        relationPop.style.left = x + 'px'
        that.filteRelationMarkPopListData()
      } else {
        console.log('3')
        that.updateRelationMarkPopDisplay('none')
      }
    }

    window.onmouseoverannotation = function (fId) {
      if (that.ismouseover) {
        return
      }
      that.ismouseover = true
      that.onmouseoverannotation(fId)
    }

    window.onmouseleaveannotation = function (fId) {
      if (!that.ismouseover) {
        return
      }
      that.ismouseover = false
      that.onmouseleaveannotation(fId)
    }

    window.deleteAnnotation = function (fId) {
      that.deleteAnnotation(fId)
      $emit(that, 'getdelbq', fId)
    }

    window.editorAnnotation = function (fId) {
      $emit(that, 'editorAnnotation', fId)
    }
  },
  unmounted() {
    document.removeEventListener('keypress', this.listener)
  },
  methods: {
    async initZone() {
      if (!this.currentResource.url || this.currentResource.length == 0) {
        return
      }

      this.title = this.currentResource.title

      var img = document.getElementById('resourceImg')
      var otpTokenResult = await getUserOptToken()

      img.src =
        baseURL + this.currentResource.url + '?otpToken=' + otpTokenResult.data
      console.log('img.src=' + img.src)
      var that = this
      img.onload = function (value) {
        console.log('img.onload')
        console.log(img.width)
        console.log(img.height)
        that.imgWidth = img.width
        that.imgHeight = img.height
        setTimeout(() => {
          that.setAnnotationList(that.resource.annotationList)
          if (that.isEdit) {
            that.clickBZUtilBar(that.toolBars[0][0])
          }
        }, 500)
      }
    },

    async setAnnotationList(data) {
      if (data == null || !Array.isArray(data)) return
      if (this.pdfPages <= 0) return
      this.annotationList = data
      this.annotationList.forEach((annotation) => {
        this.showAnnotation(annotation)
      })
      $emit(this, 'finishedLoad')
    },

    deleteAnnotation(fId) {
      var list = document.getElementsByClassName(fId)
      do {
        var el = list[0]
        el.remove()
      } while (list.length > 0)

      var annotation = this.idToAnnoMap[fId]
      if (annotation.annotationType != 'textBlock') {
        var page = annotation.presentation.index
        var moshu = this.$refs['imgMoshu']
        moshu.deleteAnnotation(fId)
      }

      if (this.idToAnnoMap[fId]) {
        delete this.idToAnnoMap[fId]
      }
    },

    setAnnotationDisplay(annotation) {
      console.log('image viewer setAnnotationDisplay')
      if (
        annotation.annotationType == 'image' ||
        annotation.annotationType == 'table'
      ) {
        var page = annotation.presentation.index
        var moshu = this.$refs['imgMoshu']
        moshu.updateAnnotationDisplay(annotation)
        var el = document.getElementById(annotation.presentation.fId)
        var display = annotation.isClose ? 'none' : 'block'
        el.style.display = display
      }
    },

    cilckBiaoqianTab(e) {
      this.biaoqianType = e
    },
    cancleBar() {
      this.clickBZUtilBar({
        title: '初',
        type: '',
        annotationType: '',
        disabled: false,
        url: gripperImg,
        orgUrl: gripperImg,
        activeUrl: gripperActiveImg
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

      e.url = e.activeUrl

      if (this.selectedUtilBar != '') {
        this.selectedUtilBar.url = this.selectedUtilBar.orgUrl
      }
      this.selectedUtilBar = e
      this.setAnnotationOperation(this.selectedUtilBar)
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

    setAnnotationOperation(operation) {
      this.updateRelationMarkPopDisplay('none')
      this.updateMarkListPopDisplay('none')
      var newAnnotationOperation = {
        type: operation.type,
        annotation: {
          annotationType: operation.annotationType,
          name: '',
          content: '',
          presentation: {}
        }
      }
      var nowAnnOperType = this.annotationOperation.type
      if (nowAnnOperType != '' && nowAnnOperType.type != operation.type) {
        var nowAnnType = this.annotationOperation.annotation.annotationType
        if (['image', 'table'].indexOf(nowAnnType) >= 0) {
          this.cancleAnnotateMoshu()
        }
      }

      if (['rectangle', 'polygon'].indexOf(operation.type) >= 0) {
        this.startAnnotateMoShu(newAnnotationOperation.type)
      }
      this.annotationOperation = newAnnotationOperation
    },

    startAnnotateMoShu(type) {
      var moshuEl = document.getElementById('imgMoshu')
      moshuEl.style.zIndex = 3
      var moshu = this.$refs['imgMoshu']
      moshu.startDraw(type)
      this.updateMarkListPopDisplay('none')
      this.updateRelationMarkPopDisplay('none')
    },

    cancleAnnotateMoshu() {
      var moshuEl = document.getElementById('imgMoshu')
      moshuEl.style.zIndex = 1
      var moshu = this.$refs['imgMoshu']
      moshu.cancleDraw()
      this.updateMarkListPopDisplay('none')
      this.updateRelationMarkPopDisplay('none')
    },

    async clickExportAnnotation() {
      var otpTokenResult = await getUserOptToken()
      var params = {
        resourceId: this.resource.id,
        layerId: this.userId,
        projectId: this.projectId,
        otpToken: otpTokenResult.data
      }
      exportAnnotation(params)
    },
    okbtn() {
      $emit(this, 'getok', 'saveok')
    },
    zcbtn() {
      $emit(this, 'getzc')
    },

    cancleCurrentMoshuAnnotation() {
      this.updateMarkListPopDisplay('none')
      var annotation = this.annotationOperation.annotation
      annotation.presentation = {}
    },

    finishMoshuAnnotationOperation(value) {
      console.log('finishMoshuAnnotationOperation')
      var points = value.points
      var page = value.page

      var fId = 'p' + page
      for (var i = 0; i < points.length; i++) {
        var point = points[i]
        fId += 'x' + point.x + 'y' + point.y
      }

      var annotation = this.annotationOperation.annotation
      annotation.presentation.fId = fId
      annotation.presentation.index = value.page
      annotation.presentation.points = points
      annotation.presentation.scale = this.scale

      var filterBentiMarkList = []
      console.log('过滤符合条件的标签')
      this.bentiMarkList.forEach((item) => {
        if (item.annotatedType.image) {
          filterBentiMarkList.push(item)
        }
      })
      this.filterBentiMarkList = filterBentiMarkList

      var markListPopEl = document.getElementById('bentiMarkListPop')
      markListPopEl.style.display = 'block'
      var maxY = 0
      var maxX = 0
      var minY = 0
      var minX = 0
      for (var i = 0; i < points.length; i++) {
        var point = points[i]
        if (i == 0) {
          maxX = point.x
          minX = point.x
          maxY = point.y
          minY = point.y
        } else {
          maxX = maxX < point.x ? point.x : maxX
          minX = minX < point.x ? minX : point.x
          maxY = maxY < point.y ? point.y : maxY
          minY = minY < point.y ? minY : point.y
        }
      }
      var left = (maxX - minX) * 0.5 + minX
      var top = (maxY - minY) * 0.5 + minY

      markListPopEl.style.top = top + 'px'
      markListPopEl.style.left = left + 'px'
    },

    updateMarkListPopDisplay(value) {
      var markListPopEl = document.getElementById('bentiMarkListPop')
      markListPopEl.style.display = value
    },
    updateRelationMarkPopDisplay(display) {
      console.log('updateRelationMarkPopDisplay' + display)
      var relationPop = document.getElementById('relationListPop')
      relationPop.style.display = display
      if (display == 'none') {
        for (var i = 0; i < this.addRelationAnnotations.length; i++) {
          var ele = document.getElementById(
            'title' + this.addRelationAnnotations[i]
          )
          if (ele) {
            ele.style.fontWeight = 'normal'
          }
        }
        this.addRelationAnnotations = []
      }
    },

    async didSelectedMark(item) {
      console.log('didSelectedMark')
      this.updateMarkListPopDisplay('none')
      var annotation = JSON.parse(
        JSON.stringify(this.annotationOperation.annotation)
      )
      this.annotationOperation.annotation
      annotation.definitionId = item.id
      annotation.presentation.color = item.color
      annotation.presentation.fId += item.id

      var moshuTypes = ['rectangle', 'polygon']
      var type = this.annotationOperation.type
      if (moshuTypes.indexOf(type) >= 0) {
        var annotationNames = []
        for (var i = 0; i < this.annotationList; i++) {
          var ann = this.annotationList[i]
          annotationNames.push(ann.name)
        }
        var index = -1
        var code = this.annotationList.length + 1
        do {
          annotation.name = item.definName + '-' + code
          index = annotationNames.indexOf(annotation.name)
          code += 1
        } while (index >= 0)
        annotation.content = ''
        var page = annotation.presentation.index
        var moshu = this.$refs['imgMoshu']
        moshu.clearAction(true)

        var ele = document.getElementById('resourceImg')
        getMattingBlob(annotation.presentation.points, ele, async (blob) => {
          var fileName = annotation.presentation.fId + '.png'
          var re = await uploadMattingBlob(
            blob,
            fileName,
            '/upload/' +
              this.$route.query.id +
              '/' +
              this.$route.query.resourceId
          )
          console.log('upload annotation img = ' + re.data)
          annotation.url = re.data
          $emit(this, 'getbz', annotation)
          this.showAnnotation(annotation)
        })
      }

      this.annotationOperation.annotation = {
        annotationType: this.annotationOperation.annotation.annotationType,
        metadata: [],
        name: '',
        content: '',
        presentation: {}
      }
    },

    showAnnotation(annotation) {
      this.idToAnnoMap[annotation.presentation.fId] = annotation
      var headerEl = this.createMoShuAnnotationHeader(annotation)
      this.$refs.maskContainer.append(headerEl)

      var moshu = this.$refs['imgMoshu']
      moshu.getNewAnnotation(annotation)
    },

    createMoShuAnnotationHeader(annotation) {
      console.log(JSON.stringify(annotation))

      const hintEl = document.createElement('div')
      var points = annotation.presentation.points
      var maxY = 0
      var maxX = 0
      var minY = 0
      var minX = 0
      for (var i = 0; i < points.length; i++) {
        var point = points[i]
        if (i == 0) {
          maxX = point.x
          minX = point.x
          maxY = point.y
          minY = point.y
        } else {
          maxX = maxX < point.x ? point.x : maxX
          minX = minX < point.x ? minX : point.x
          maxY = maxY < point.y ? point.y : maxY
          minY = minY < point.y ? minY : point.y
        }
      }
      var left = (maxX - minX) * 0.5 + minX
      var top = (maxY - minY) * 0.5 + minY
      var moshu = document.getElementById('imgMoshu')
      top += moshu.parentNode.offsetTop

      const hintBgColor = '#ffffff'
      const hintColor = '#333'
      var hintBorderColor = annotation.presentation.color
      Object.assign(hintEl.style, {
        position: 'absolute',
        left: left + 'px',
        top: top + 'px',
        color: hintColor,
        borderRadius: '6px',
        padding: '5px',
        backgroundColor: hintBgColor,
        border: '1px solid ' + hintBorderColor,
        borderLeft: '5px solid ' + hintBorderColor
      })
      var fId = annotation.presentation.fId
      var titleId = 'title' + fId
      var addGX = 'addGX("' + fId + '","' + titleId + '")'

      var onmouseoverannotation = 'onmouseoverannotation(' + '"' + fId + '")'
      var onmouseleaveannotation = 'onmouseleaveannotation(' + '"' + fId + '")'
      var typeIconSvg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M160 160v704h704V160zm-32-64h768a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H128a32 32 0 0 1-32-32V128a32 32 0 0 1 32-32"></path><path fill="currentColor" d="M384 288q64 0 64 64t-64 64q-64 0-64-64t64-64M185.408 876.992l-50.816-38.912L350.72 556.032a96 96 0 0 1 134.592-17.856l1.856 1.472 122.88 99.136a32 32 0 0 0 44.992-4.864l216-269.888 49.92 39.936-215.808 269.824-.256.32a96 96 0 0 1-135.04 14.464l-122.88-99.072-.64-.512a32 32 0 0 0-44.8 5.952z"></path></svg>'
      if (annotation.annotationType == 'textBlock') {
        typeIconSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="m174.72 855.68 135.296-45.12 23.68 11.84C388.096 849.536 448.576 864 512 864c211.84 0 384-166.784 384-352S723.84 160 512 160 128 326.784 128 512c0 69.12 24.96 139.264 70.848 199.232l22.08 28.8-46.272 115.584zm-45.248 82.56A32 32 0 0 1 89.6 896l58.368-145.92C94.72 680.32 64 596.864 64 512 64 299.904 256 96 512 96s448 203.904 448 416-192 416-448 416a461.056 461.056 0 0 1-206.912-48.384l-175.616 58.56z"></path><path fill="currentColor" d="M352 576h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32m32-192h256q32 0 32 32t-32 32H384q-32 0-32-32t32-32"></path></svg>'
      } else if (annotation.annotationType == 'table') {
        typeIconSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M640 384v256H384V384zm64 0h192v256H704zm-64 512H384V704h256zm64 0V704h192v192zm-64-768v192H384V128zm64 0h192v192H704zM320 384v256H128V384zm0 512H128V704h192zm0-768v192H128V128z"></path></svg>'
      }
      let elHtml = `<i style="padding-right:4px" class="el-icon">${typeIconSvg}</i>
         <span onmouseleave=${onmouseleaveannotation} onmousemove=${onmouseoverannotation} id="${titleId}" onclick=${addGX}>
            ${annotation.name}
         </span>`

      if (this.isEdit) {
        elHtml += `<i onclick=editorAnnotation("${fId}") class="el-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"></path><path fill="currentColor" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path></svg>
          </i>
          <i onclick=deleteAnnotation("${fId}") class="el-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path></svg>
          </i>`
      }
      hintEl.innerHTML = elHtml
      hintEl.id = 'head' + fId
      hintEl.className = fId + ' biaozhuhead'
      return hintEl
    },

    setDefinRelation(data) {
      this.definRelationData = data
    },
    setAnnotationRelationList(list) {
      this.annotationRelationList = list
      console.log('imgview setAnnotationRelationList')
      console.log(this.annotationRelationList)
    },

    filteRelationMarkPopListData() {
      if (this.addRelationAnnotations.length < 2) {
        return
      }
      var filterRelationIds = []
      var firstAnnotation = this.getAnnotationByFId(
        this.addRelationAnnotations[0]
      )
      var secondAnntation = this.getAnnotationByFId(
        this.addRelationAnnotations[1]
      )

      this.definRelationData.forEach((item) => {
        if (
          item.fromDefinId == firstAnnotation.definitionId &&
          item.toDefinId == secondAnntation.definitionId
        ) {
          filterRelationIds.push(item.relationId)
        }

        if (
          item.fromDefinId == secondAnntation.definitionId &&
          item.toDefinId == firstAnnotation.definitionId
        ) {
          filterRelationIds.push(item.relationId)
        }
      })

      this.annotationRelationList.forEach((item) => {
        if (!item.deleted) {
          if (item.fromId && !item.fromFId) {
            console.log('item.fromId && !item.fromFId')
            var ann = getAnnotationById(item.fromId)
            if (ann && ann.presentation) {
              item.fromFId = ann.presentation
            }
          }

          if (item.toId && !item.toFId) {
            console.log('item.toId && !item.toFId')
            var ann = getAnnotationById(item.toId)
            if (ann && ann.presentation) {
              item.toFId = ann.presentation.fId
            }
          }

          var isDelete = false
          var ind = filterRelationIds.indexOf(item.relationId)
          if (!item.deleted && ind >= 0) {
            if (
              firstAnnotation.presentation.fId == item.fromFId &&
              secondAnntation.presentation.fId == item.toFId
            ) {
              isDelete = true
            }
            if (
              secondAnntation.presentation.fId == item.fromFId &&
              firstAnnotation.presentation.fId == item.toFId
            ) {
              isDelete = true
            }
          }
          if (isDelete) {
            filterRelationIds.splice(ind, 1)
          }
        }
      })

      var filterRelations = []
      this.relationMarkList.forEach((element) => {
        if (filterRelationIds.indexOf(element.definRelationId) >= 0) {
          filterRelations.push(element)
        }
      })
      this.filterRelations = filterRelations
    },

    addGuanxi(item) {
      var value = {
        relationId: item.definRelationId,
        fromFId: this.addRelationAnnotations[0],
        toFId: this.addRelationAnnotations[1],
        deleted: false
      }
      console.log('finish addGuanxi')
      console.log(this.addRelationAnnotations)
      $emit(this, 'getgx', value)
      this.updateRelationMarkPopDisplay('none')
    },

    getAnnotationByFId(fId) {
      console.log('getAnnotationByFId=' + fId)
      var annotation = undefined
      this.annotationList.forEach((item) => {
        if (item.presentation.fId == fId) {
          annotation = item
        }
      })
      console.log(annotation)
      return annotation
    },

    getAnnotationById(id) {
      console.log('getAnnotationById=' + id)
      var annotation = undefined
      this.annotationList.forEach((item) => {
        console.log(item)
        if (item.id == id) {
          annotation = item
        }
      })
      console.log(annotation)
      return annotation
    },
    onmouseoverannotation(fId) {
      this.setAnnotationActive(fId, true)
      $emit(this, 'setResourceMarkListAnnotationActive', fId, true)

      var canvas = document.getElementById('viewerCanvas')
      canvas.width = this.imgWidth
      canvas.height = this.imgHeight
      canvas.style.left = '0px'
      canvas.style.top = '0px'

      var ctx = canvas.getContext('2d')
      ctx.strokeStyle = 'rgba(102,168,255,1)'
      ctx.lineWidth = 2 

      var startP = this.getAnnotationHeaderPositon(fId)
      console.log('startP')

      var relations = []
      var relationColorMap = {}
      this.relationMarkList.forEach((relationMark) => {
        relationColorMap[relationMark.definRelationId] = relationMark.color
      })
      console.log('获取关系')
      this.annotationRelationList.forEach((item) => {
        console.log(item)
        if (!item.deleted) {
          var relationFId = -1
          if (item.fromFId == fId) {
            relationFId = item.toFId
          }
          if (item.toFId == fId) {
            relationFId = item.fromFId
          }
          if (relationFId != -1) {
            relations.push({ fId: relationFId, relationId: item.relationId })
          }
        }
      })
      relations.forEach((item) => {
        var p = this.getAnnotationHeaderPositon(item['fId'])
        if (p) {
          console.log('p====')
          console.log(p)
          ctx.beginPath()
          ctx.moveTo(startP.x, startP.y + 10)
          ctx.lineTo(p.x + 20, p.y + 10)
          ctx.setLineDash([5, 5])
          ctx.strokeStyle = relationColorMap[item['relationId']]
          ctx.stroke()
        }
      })
    },
    getAnnotationHeaderPositon(fId) {
      console.log(fId)
      var el = document.getElementById('title' + fId)
      if (!el) {
        console.log('getAnnotationHeaderPositon = null')
        return
      }
      var x = 0
      var y = 0
      var annotation = this.getAnnotationByFId(fId)
      while (el.id != 'mask-container') {
        x += el.offsetLeft
        y += el.offsetTop
        console.log('el.id=' + el.id)
        console.log('el.offsetLeft=' + el.offsetLeft)
        el = el.parentElement
        console.log('el.parentElement.id' + el.parentElement.id)
      }
      return { x: x, y: y }
    },

    onmouseleaveannotation(fId) {
      var canvas = document.getElementById('viewerCanvas')
      canvas.width = this.imgWidth
      canvas.height = this.imgHeight
      var ctx = canvas.getContext('2d')
      ctx.strokeStyle = 'rgba(102,168,255,1)'
      ctx.lineWidth = 4
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      this.setAnnotationActive(fId, false)
      $emit(this, 'setResourceMarkListAnnotationActive', fId, false)
    },

    changeScale(value) {
      this.scale += value
    },

    setAnnotationActive(fId, isActive) {
      var ele = document.getElementById('head' + fId)
      if (isActive) {
        ele.style.borderWidth = '2px 2px 2px 5px'
        ele.style.background = '#999'
      } else {
        ele.style.borderWidth = '1px 1px 1px 5px'
        ele.style.background = 'white'
      }
    },
    robotRevealShow(bar) {
      if (this.isEdit) {
        return true
      }
      return false
    }
  },
  emits: [
    'getdelbq',
    'editorAnnotation',
    'getok',
    'getbz',
    'getgx',
    'setResourceMarkListAnnotationActive',
    'finishedLoad',
    'getzc'
  ]
}
</script>

<style lang="scss">
.image-zone-top {
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
  .title {
    font-weight: bold;
    max-width: 600px;
    margin: auto;
    word-break: break-all;
  }
  .right-scale {
    display: flex;
    align-items: center;
    img {
      cursor: pointer;
      width: 44px;
      height: 44px;
    }
    .scale-value {
      width: 90px;
      text-align: center;
      font-size: 18px;
    }
  }
}
.image-zone-main {
  position: relative;
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
    .tool-bar-view {
      border-bottom: 5px solid #e5e5e5;
      padding: 0px 0;
    }
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
  .image-viewer {
    position: relative;
    height: 100%;
    flex: 1;
    overflow: scroll;
    display: flex;
    align-items: center;
    justify-items: center;
    img {
      display: block;
      margin: auto;
    }
    .moshu {
      position: absolute;
      text-align: initial;
      inset: 0;
      overflow: hidden;
      opacity: 1;
      line-height: 1;
      -webkit-text-size-adjust: none;
      -moz-text-size-adjust: none;
      text-size-adjust: none;
      forced-color-adjust: none;
      transform-origin: 0 0;
      z-index: 1;
      background: rgb(0, 0, 0, 0);
    }
    .viewer-canvas {
      position: absolute;
      top: 0;
      left: 0;
    }

    .biaozhuhead {
      i {
        padding-right: 4px;
      }
      i:hover {
        cursor: pointer;
      }
    }
  }

  .mark-list-pop,
  .relation-list-pop {
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
