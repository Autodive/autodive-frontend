<template>
  <div style="display: flex; height: 100%; flex-direction: column">
    <div class="image-zone-top">
      <div class="title">
        <div v-if="title != ''" style="line-height: 20px">
          ( {{ $t(statusMap[resource.status]) }} ){{ title }}
        </div>
      </div>
      <div class="right-scale">
        <img class="scale-image" @click="changeScale(0.1)" src="@/assets/task/plus.png" />
        <div class="scale-value">
          {{ formattedZoom ? formattedZoom : 100 }} %
        </div>
        <img class="scale-image" @click="changeScale(-0.1)" src="@/assets/task/minus.png" />
        <img @click="cancleBar" v-if="selectedUtilBar.title != '初'" src="@/assets/task/gripper.png" />
        <img @click="cancleBar" v-if="selectedUtilBar.title == '初'" src="@/assets/task/gripper-selected.png" />
      </div>
    </div>
    <div class="txt-zone-main">
      <div class="bz-util" id="leftgjl">
        <div v-for="(items, index) in toolBars" :key="index" class="tool-bar-view">
          <template v-for="bar in items" :key="bar.type">
            <template v-if="bar.type === 'checkbox'">
              <el-checkbox v-if="!isEdit" v-model="isDefinChecked" :title="$t(bar.title)" />
            </template>
            <img @click="clickBZUtilBar(bar)" :src="bar.url" v-else-if="robotRevealShow(bar)" :title="$t(bar.title)" :style="{width:index==2?'30px':'40px',height:index==2?'30px':'40px'}" />
          </template>
        </div>
        <template v-if="isEdit">
          <img :title="$t('暂存')" @click="zcbtn" src="@/assets/task/staging-selected.png" class="zc" />
          <img :title="$t('完成')" @click="okbtn" src="@/assets/task/save-selected.png" class="duihao" />
          <img :title="$t('下载')" @click="clickExportAnnotation" src="@/assets/task/download-selected.png" class="download" />
        </template>
      </div>
      <div class="txt-viewer" id="txtViewer" :style="`--scale-factor:${scale}`">
        <pre class="resource-txt" :style="`font-size:${scale * 14}px;line-height:${scale * 35}px`">{{ content }}</pre>
        <canvas id="viewerCanvas" class="viewer-canvas"></canvas>
        <pre id="resourceTxt" :style="`font-size:${scale * 14}px;line-height:${scale * 35}px`" class="resource-txt-select">{{ content }}</pre>
        <div class="mark-list-pop" id="bentiMarkListPop">
          <div style="padding: 6px; font-weight: bold">
            {{ $t('选择标签') }}
          </div>
          <ul>
            <li @click="didSelectedMark(item)" v-for="(item, index) in bentiMarkList" :key="index">
              <span :style="{ borderColor: item.color, color: item.color }">{{
                $t('推荐')
              }}</span>{{ item.definName }}
            </li>
            <li style="background: #999" v-if="bentiMarkList.length == 0">
              {{$t('暂无数据')}}
            </li>
          </ul>
        </div>
        <div class="relation-list-pop" id="relationListPop">
          <div style="padding: 6px; font-weight: bold">
            {{ $t('选择关系') }}
          </div>
          <ul>
            <li @click="addGuanxi(item)" v-for="(item, index) in filterRelations" :key="index">
              <span :style="{ borderColor: item.color, color: item.color }">
                {{ $t('推荐') }}
              </span>{{ item.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <chartBar ref="chartBar"></chartBar>
    <chartGraph ref="chartGraph"></chartGraph>
  </div>
</template>

<script>
import { getUserOptToken } from '@/api/user'
import { exportAnnotation } from '@/api/export'
import { getResourceStats } from '@/api/zhiyuan'
import axios from 'axios'
import txtImg from '@/assets/task/txt.png'
import txtActiveImg from '@/assets/task/txt-selected.png'
import gripperImg from '@/assets/task/gripper.png'
import gripperActiveImg from '@/assets/task/gripper-selected.png'
import m7hov from '@/assets/m7hov.png'
import m8hov from '@/assets/m8hov.png'
import chartBar from './chartBar.vue'
import chartGraph from './chartGraph.vue'

import { ElMessage } from 'element-plus'
import { config } from '@/config'

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
        console.log(newVal)
        console.log(this.bentiMarkList)
      }
    },
    relationMarkList(newVal, oldVal) {
      console.log('relationMarkList change')
      console.log(this.relationMarkList)
      console.log(oldVal)
      console.log(newVal)
    }
  },
  components: { chartBar, chartGraph },
  data() {
    return {
      scale: 1,
      currentResource: this.resource,
      title: '',
      content: '',
      txtWidth: 300,
      statusMap: { 1: '未完成', 2: '进行中', 3: '已完成' },
      annotationList: [],
      idToAnnoMap: {},
      addRelationAnnotations: [],
      relationList: [],
      filterRelations: [], 
      annotationRelationList: [],
      biaoqianType: 'paper',
      selectedUtilBar: '',
      toolBars: [
        [
          {
            title: '留存本体',
            type: 'checkbox',
            disabled: false
          }
        ],
        [
          {
            title: '文本标注',
            type: 'txt',
            annotationType: 'textBlock',
            iconName: 'txt',
            disabled: false,
            url: txtImg,
            orgUrl: txtImg,
            activeUrl: txtActiveImg
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

      ismouseover: false,
      enableAllEelation: false,
      isDefinChecked: true
    }
  },
  computed: {
    userId() {
      const userId = this.$route.query.userId
      if (userId) {
        return userId
      } else {
        return JSON.parse(localStorage.getItem('user')).id
      }
    },
    formattedZoom() {
      return Number.parseInt(this.scale * 100)
    },
    projectId() {
      return this.$route.query.id
    },
    projectName() {
      return this.$route.query.name
    },
    isReveal() {
      return this.$route.query.isReveal === 'true'
    }
  },
  async mounted() {
    this.enableAllEelation = config.enableAllEelation || false

    this.initZone()

    var that = this
    document.getElementById('txtViewer').addEventListener(
      'mouseup',
      async function (e) {
        console.log('mouseup')
        var currentAnnotationType =
          that.annotationOperation.annotation.annotationType
        if (that.addRelationAnnotations.length >= 2) {
          setTimeout(() => {
            that.updateRelationMarkPopDisplay('none')
          }, 500)
        }
        if (currentAnnotationType == 'textBlock') {
          console.log('finishTextAnnotationOperation')
          that.finishTextAnnotationOperation()
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
        } while (el.id != 'txtViewer')

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
      that.$emit('getdelbq', fId)
    }

    window.editorAnnotation = function (fId) {
      that.$emit('editorAnnotation', fId)
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

      var otpTokenResult = await getUserOptToken()
      var url = this.currentResource.url + '?otpToken=' + otpTokenResult.data
      const resp = await axios({ method: 'GET', url: url })
      this.content = resp.data
      if (!this.isReveal) {
        this.setAnnotationList(this.resource.annotationList)
      }

      console.log(this.isEdit, 'is Edit')
      if (this.isEdit) {
        this.clickBZUtilBar(this.toolBars[1][0])
      }
    },

    async setAnnotationList(data) {
      if (data == null || !Array.isArray(data)) return
      if (this.pdfPages <= 0) return
      this.annotationList = data
      this.annotationList.forEach((annotation) => {
        this.showAnnotation(annotation)
      })
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
      console.log(annotation)
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
        iconName: 'gripper',
        disabled: false,
        url: gripperImg,
        orgUrl: gripperImg,
        activeUrl: gripperActiveImg
      })
    },
    clickBZUtilBar(e) {
      if (e.disabled) {
        return
      }

      if (e.type === 'chartBar') {
        this.showCharBarDialog()
        return
      }

      if (e.type === 'chartGraphOverlap') {
        this.showCharGraph()
        return
      }

      e.url = e.activeUrl

      if (this.selectedUtilBar != '') {
        this.selectedUtilBar.url = this.selectedUtilBar.orgUrl
      }
      this.selectedUtilBar = e

      this.setAnnotationOperation(this.selectedUtilBar)
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
      this.$emit('getok', 'saveok')
    },
    zcbtn() {
      this.$emit('getzc')
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

    finishTextAnnotationOperation() {
      const selection = window.getSelection()
      const container = document.getElementById('txtViewer')
      const range = selection.getRangeAt(0)
      const rects = range.getClientRects()
      const firstRect = rects[0]

      if (selection.toString() != '') {
        var startId = 'p1t0' 
        var endId = 'p1t0'

        var startOffset = selection.anchorOffset
        var endOffset = selection.extentOffset
          ? selection.extentOffset
          : selection.focusOffset
        if (startId > endId) {
          var id = startId
          startId = endId
          endId = id
          var offset = startOffset
          startOffset = endOffset
          endOffset = offset
        }
        if (startId == endId && startOffset > endOffset) {
          var offset = startOffset
          startOffset = endOffset
          endOffset = offset
        }

        var selectStr = selection.toString()
        this.annotationOperation.annotation = this.initTextBlockAnnotation(
          selectStr,
          startId,
          startOffset,
          endId,
          endOffset
        )

        var markListPopEl = document.getElementById('bentiMarkListPop')
        markListPopEl.style.display = 'block'
        markListPopEl.style.top =
          firstRect.top +
          container.scrollTop -
          container.getBoundingClientRect().top +
          28 +
          'px'
        markListPopEl.style.left =
          firstRect.x - container.getBoundingClientRect().left + 'px'
      } else {
        var markListPopEl = document.getElementById('bentiMarkListPop')
        markListPopEl.style.display = 'none'
      }
    },

    initTextBlockAnnotation(
      content,
      startTerm,
      startOffset,
      endTerm,
      endOffset
    ) {
      var name = content.length > 10 ? content.substring(0, 10) : content

      var reg = /\d+/g
      var startRe = startTerm.match(reg)
      var startPage = startRe[0]
      var startIndex = startRe[1]
      var endtRe = endTerm.match(reg)
      var endPage = endtRe[0]
      var endIndex = endtRe[1]
      console.log('startTerm,endTerm')

      console.log(startTerm, endTerm)

      return {
        annotationType: 'textBlock',
        name: name,
        content: content,
        presentation: {
          fId: startTerm + 's' + startOffset + '-' + endTerm + 's' + endOffset,
          startPage: startPage,
          startIndex: startIndex,
          startOffset: startOffset,
          endPage: endPage,
          endIndex: endIndex,
          endOffset: endOffset
        },
        metadata: []
      }
    },

    async didSelectedMark(item) {
      this.updateMarkListPopDisplay('none')
      var annotation = JSON.parse(
        JSON.stringify(this.annotationOperation.annotation)
      )
      this.annotationOperation.annotation
      annotation.definitionId = item.id
      annotation.presentation.color = item.color
      annotation.presentation.fId += item.id

      this.$emit('getbz', annotation)
      this.showAnnotation(annotation)
      console.log('this.annotationList')
      console.log(this.annotationList)

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
      if (annotation.annotationType == 'textBlock') {
        var txtViewer = document.getElementById('txtViewer')
        var annSpan = document.createElement('pre')
        var content = this.content + ''
        var innerText = ''
        var startOffset = annotation.presentation.startOffset
        var endOffset = annotation.presentation.endOffset
        if (startOffset > 0) {
          innerText += `${content.substring(0, startOffset)}`
        }

        var biaozhuText = content.substring(startOffset, endOffset)
        var headText = biaozhuText
        if (headText.length > 10) {
          headText = headText.substring(0, 10)
        }
        var fId = annotation.presentation.fId
        var headId = 'head' + fId
        var titleId = 'title' + fId
        var deleteAnnotation = 'deleteAnnotation(' + '"' + fId + '")'

        var addGX = 'addGX("' + fId + '","' + titleId + '")'
        var onmouseoverannotation = 'onmouseoverannotation(' + '"' + fId + '")'
        var onmouseleaveannotation =
          'onmouseleaveannotation(' + '"' + fId + '")'

        var editorAnnotation = 'editorAnnotation(' + '"' + fId + '")'
        var color = annotation.presentation.color
        const chatLineRoundSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="m174.72 855.68 135.296-45.12 23.68 11.84C388.096 849.536 448.576 864 512 864c211.84 0 384-166.784 384-352S723.84 160 512 160 128 326.784 128 512c0 69.12 24.96 139.264 70.848 199.232l22.08 28.8-46.272 115.584zm-45.248 82.56A32 32 0 0 1 89.6 896l58.368-145.92C94.72 680.32 64 596.864 64 512 64 299.904 256 96 512 96s448 203.904 448 416-192 416-448 416a461.056 461.056 0 0 1-206.912-48.384l-175.616 58.56z"></path><path fill="currentColor" d="M352 576h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32m32-192h256q32 0 32 32t-32 32H384q-32 0-32-32t32-32"></path></svg>'

        const editSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"></path><path fill="currentColor" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path></svg>`

        if (this.isEdit) {
          innerText += `<span class="biaozhu"><span onmouseleave=${onmouseleaveannotation} onmouseover=${onmouseoverannotation} id=${headId} class="biaozhuhead" style="border-color:${color}"><i class="el-icon" style="color: #333">${chatLineRoundSvg}</i><span onclick=${addGX} id=${titleId}>${headText}</span><i class="el-icon" onclick=${editorAnnotation}>${editSvg}</i><i class="el-icon" onclick=${deleteAnnotation}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path></svg></i></span><span style="background:${color};opacity:0.5;position:relative">${biaozhuText}</span></span>`
        } else {
          innerText += `<span class="biaozhu"><span onmouseleave=${onmouseleaveannotation} onmouseover=${onmouseoverannotation} id=${headId} class="biaozhuhead" style="border-color:${color}"><i class="el-icon" style="color: #333">${chatLineRoundSvg}</i><span onclick=${addGX} id=${titleId}>${headText}</span></span><span style="background:${color};opacity:0.5;position:relative">${biaozhuText}</span></span>`
        }

        annSpan.innerHTML = innerText
        annSpan.className = 'bztxt ' + annotation.presentation.fId
        txtViewer.appendChild(annSpan)
      }
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
        if (this.enableAllEelation === true) {
          filterRelationIds.push(item.relationId)
        } else {
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
        if (this.enableAllEelation === true) {
          filterRelations.push(element)
        } else if (filterRelationIds.indexOf(element.definRelationId) >= 0) {
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
      this.$emit('getgx', value)
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
      this.$emit('setResourceMarkListAnnotationActive', fId, true)
      var txtViewer = document.getElementById('txtViewer')
      var canvas = document.getElementById('viewerCanvas')
      canvas.width = txtViewer.clientWidth - 20
      canvas.height = txtViewer.clientHeight - 20
      canvas.style.left = '0px'
      canvas.style.top = '0px'

      var ctx = canvas.getContext('2d')
      ctx.strokeStyle = 'rgba(102,168,255,1)'
      ctx.lineWidth = 2
      var startP = this.getAnnotationHeaderPositon(fId)
      var relations = []
      var relationColorMap = {}
      this.relationMarkList.forEach((relationMark) => {
        relationColorMap[relationMark.definRelationId] = relationMark.color
      })
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
      while (el.id != 'txtViewer') {
        x += el.offsetLeft
        y += el.offsetTop
        console.log('el.id=' + el.id)
        console.log('el.offsetLeft=' + el.offsetLeft)
        el = el.parentElement
        console.log('el.parentElement.id' + el.id)
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
      this.$emit('setResourceMarkListAnnotationActive', fId, false)
    },

    changeScale(value) {
      this.scale += value
      this.scale = this.scale > 2 ? 2 : this.scale
      this.scale = this.scale < 0.25 ? 0.25 : this.scale
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
    }
  }
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
    .scale-image {
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
.txt-zone-main {
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
    .bz-util-button {
      border: 1px solid;
      border-radius: 30px;
      height: 30px;
      width: 30px;
      padding: 0px;
      display: block;
      margin: auto;
    }
    .bz-util-button + .bz-util-button {
      margin-top: 10px;
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
  .txt-viewer {
    position: relative;
    height: calc(100% - 60px);
    padding: 30px;
    flex: 1;
    overflow: scroll;
    .bztxt {
      position: absolute;
      top: 30px;
      left: 30px;
      width: calc(100% - 60px);
      white-space: pre-wrap;
      word-wrap: break-wor;
      color: transparent;
      line-height: calc(var(--scale-factor) * 35px);
      font-size: calc(var(--scale-factor) * 14px);
      .biaozhu {
        background: rgb(155, 232, 243, 0.5);
        position: relative;
        opacity: 1;

        .biaozhuhead {
          border: 1px solid rgb(155, 232, 243);
          border-width: 1px 1px 1px 5px;
          padding: 5px;
          line-height: calc(var(--scale-factor) * 15px);
          height: calc(var(--scale-factor) * 15px);
          position: absolute;
          top: -20px;
          left: 0px;
          background: white;
          z-index: 999;
          white-space: nowrap;
          border-radius: 6px;
          color: #333;
          i {
            padding-right: 4px;
          }
          i:hover {
            cursor: pointer;
          }
          span {
            position: relative;
            color: #333;
            font-size: calc(var(--scale-factor) * 14px);
            line-height: 100%;
            overflow: hidden;
            padding-right: 5px;
          }
          .biaozhuheadx {
            color: #333;
            right: 0px;
            width: 20px;
            font-weight: bold;
            font-size: 14px;
            height: calc(100% - 10px);
            text-align: center;
            background: white;
          }
        }
      }
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
    .resource-txt {
      position: absolute;
      top: 30px;
      left: 30px;
      width: calc(100% - 60px);
      z-index: 4;
      line-height: 35px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .resource-txt-select {
      position: absolute;
      top: 30px;
      left: 30px;
      width: calc(100% - 60px);
      z-index: 6;
      line-height: 35px;
      color: transparent;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .viewer-canvas {
      position: absolute;
      top: 0px;
      left: 0px;
      z-index: 5;
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
