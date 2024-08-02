<template>
  <div
    id="pdfViewer"
    class="pdf-viewer"
    :style="`--scale-factor: ${baseScale * pdfScale};`"
  >
    <div class="page" v-for="page in pdfPages" :key="page" :id="'page' + page">
      <div class="canvasWrapper">
        <canvas :id="'pdfCanvas' + page" />
      </div>
      <div class="textLayer" :id="'textLayer' + page"></div>
      <moshuViewer
        class="moshu"
        :id="'moshu' + page"
        :ref="'moshu' + page"
        :page="page"
        :currentScale="pdfScale"
        @cancleCurrentMoshuAnnotation="cancleCurrentMoshuAnnotation"
        @finishMoshuAnnotationOperation="finishMoshuAnnotationOperation"
      />
    </div>

    <canvas id="pdfViewerCanvas" class="pdf-viewer-canvas"></canvas>

    <div
      ref="maskContainer"
      id="mask-container"
      :style="`width: calc(var(--scale-factor) * 612px); left:calc(50% - var(--scale-factor)*612*0.5px); height: 0; top: 0; position: absolute; z-index:99`"
    ></div>

    <div class="mark-list-pop" id="pdfBentiMarkListPop">
      <div style="padding: 6px; font-weight: bold">{{ $t('选择标签') }}</div>
      <ul>
        <li
          @click="didSelectedMark(item)"
          v-for="(item, index) in filterBentiMarkList"
          :key="index"
        >
          <span :style="{ borderColor: item.color, color: item.color }">{{
            $t('推荐')
          }}</span
          >{{ item.definName }}
        </li>
        <li style="background: #999" v-if="filterBentiMarkList.length == 0">
          {{$t('暂无数据')}}
        </li>
      </ul>
    </div>

    <div class="relation-list-pop" id="pdfRelationListPop">
      <div style="padding: 6px; font-weight: bold">{{ $t('选择关系') }}</div>
      <ul>
        <li
          @click="addGuanxi(item)"
          v-for="(item, index) in filterRelations"
          :key="index"
        >
          <span :style="{ borderColor: item.color, color: item.color }">{{
            $t('推荐')
          }}</span
          >{{ item.name }}
        </li>
        <li style="background: #999" v-if="filterRelations.length == 0">
          {{$t('暂无数据')}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf'
import pdfWorkerSrc from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url'

const DEFAULT_FONT_SIZE = 30
const DEFAULT_FONT_ASCENT = 0.8
const ascentCache = new Map()
PDFJS.GlobalWorkerOptions.workerSrc = pdfWorkerSrc
import moshuViewer from './moshuViewer.vue'
import { getMattingBlob, uploadMattingBlob } from './matting.js'
import { getxmqx } from '@/api/quanxian'
import { getResourceDetail } from '@/api/zhiyuan'
import request from 'axios'
import {colorToRgb} from "../utils/16transRgba.js"

export default {
  name: 'PDFViewer',
  components: {
    moshuViewer,
  },
  props: {
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
  data() {
    return {
      resource: {},
      pdfPages: 0,
      currentPage: 1, 
      finishedNum: 0,
      pdfWidth: 612,
      pdfHeight: 792,
      pdfDoc: '',
      baseScale: 4 / 3,
      pdfScale: 1.3,
      pdfPageWidth: 0,
      pdfPageHeight: 0,
      spanList: [],
      textList: [],
      minFontSupportedByBrowser: 0,
      colorMap: {},

      isSearching: false,
      definition: {},
      checkobj: {},
      searchResult: [],
      words: [],
      regStr: '',
      startValue: 0,
      endValue: 0,
      matchNumber: 0,
      ismouseover: false,
      annotationOperation: {
        annotation: {},
        type: '',
      },
      annotationList: [],
      idToAnnoMap: {},
      pageToTextAnnoMap: {},
      pagetToMSAnnoMap: {}, 
      filterBentiMarkList: [],
      addRelationAnnotations: [], 
      relationList: [],
      filterRelations: [], 
      annotationRelationList: [],
      pdfContent: [],
    }
  },
  mounted() {
    colorToRgb
    let that = this

    document.getElementById('pdfViewer').addEventListener(
      'mouseup',
      async function (e) {
        var currentAnnotationType =
          that.annotationOperation.annotation.annotationType
        if (that.addRelationAnnotations.length >= 2) {
          setTimeout(() => {
            that.updateRelationMarkPopDisplay('none')
          }, 500)
        }
        if (
          currentAnnotationType == 'textBlock' ||
          that.annotationOperation.type == 'relationTxt'
        ) {
          that.finishTextAnnotationOperation()
        }
      },
      true
    )

    window.addGX = function (fId, titleId) {
      if (that.addRelationAnnotations.length == 0) {
        that.addRelationAnnotations.push(fId)
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
        } while (el.id != 'pdfvuer')

        y += 20
        var relationPop = document.getElementById('pdfRelationListPop')
        relationPop.style.display = 'block'
        relationPop.style.top = y + 10 + 'px'
        relationPop.style.left = x + 'px'
        that.filteRelationMarkPopListData()
      } else {
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

    window.addTxtRelationAnnotation = function (fId) {
      that.updateMarkListPopDisplay('none')
      that.updateRelationMarkPopDisplay('none')
      that.cancleAnnotateMoshu()
      that.cancleAnnotateTextBlock()
      var annatation = that.idToAnnoMap[fId]
      that.annotationOperation = {
        type: 'relationTxt',
        annotation: annatation,
        previous: that.annotationOperation,
      }
    }
    window.addRelationAnnotation = function (fId) {
      that.updateMarkListPopDisplay('none')
      that.updateRelationMarkPopDisplay('none')
      var annatation = that.idToAnnoMap[fId]
      var newAnnotationOperation = {
        type: 'relation',
        annotation: annatation,
        previous: that.annotationOperation,
      }
      var nowAnnType = that.annotationOperation.annotation.annotationType
      if (nowAnnType && nowAnnType == 'textBlock') {
        that.cancleAnnotateTextBlock()
      }

      that.startAnnotateMoShu('rectangle')
      that.annotationOperation = newAnnotationOperation
    }

    window.deleteAnnotation = function (fId) {
      that.deleteAnnotation(fId)
      that.$emit('diddelbq', fId)
    }

    window.editorAnnotation = function (fId) {
      that.$emit('editorAnnotation', fId)
    }
  },
  methods: {
    async setPdf(pdf, resource) {
      this.initData(pdf)
      this.getPdfText(pdf)
      this.resource = resource
      this.$nextTick(() => {
        this.finishedNum = 0
        this.renderPage(pdf, 1)
      })
    },

    async setAnnotationList(data) {
      if (data == null || !Array.isArray(data)) return
      if (this.pdfPages <= 0) return
      this.annotationList = data
      this.annotationList.forEach((annotation) => {
        this.showAnnotation(annotation)
      })
      this.$emit( 'finishedLoad')
    },

    initData(pdf) {
      this.pdfDoc = pdf
      this.pdfPages = pdf.numPages
      this.colorMap = {}
      this.definition = {}
      this.checkobj = {}
      this.words = {}
      this.allRangeMap = {}
      this.addRelationAnnotations = []
    },

    setCurrentPage(page) {
      this.currentPage = page
    },

    setAnnotationDisplay(annotation) {
      if (
        annotation.annotationType == 'image' ||
        annotation.annotationType == 'table'
      ) {
        var page = annotation.presentation.index
        var moshu = this.$refs['moshu' + page]
        moshu[0].updateAnnotationDisplay(annotation)
        if (
          annotation.relatedCaptionPresentation &&
          annotation.relatedCaptionPresentation.index > 0
        ) {
          var relaitionPage = annotation.relatedCaptionPresentation.index
          if (relaitionPage != page) {
            var reMoshu = this.$refs['moshu' + relaitionPage]
            reMoshu[0].updateAnnotationDisplay(annotation)
          }
        }
        var el = document.getElementById(annotation.presentation.fId)
        var display = annotation.isClose ? 'none' : 'block'
        el.style.display = display
      } else if (annotation.annotationType == 'textBlock') {
        var arr = document.getElementsByClassName(annotation.presentation.fId)
        for (var i = 0; i < arr.length; i++) {
          var item = arr[i]
          item.style.display = annotation.isClose ? 'none' : 'block'
        }
      }
    },

    setAnnotationOperation(operation) {
      console.log('setAnnotationOperation ')
      console.log(operation)
      this.updateRelationMarkPopDisplay('none')
      this.updateMarkListPopDisplay('none')
      var newAnnotationOperation = {
        type: operation.type,
        annotation: {
          annotationType: operation.annotationType, 
          metadata: [],
          name: '',
          content: '',
          presentation: {},
        },
        operation: operation,
      }
      var nowAnnOperType = this.annotationOperation.type 
      if (nowAnnOperType != '' && nowAnnOperType.type != operation.type) {
        var nowAnnType = this.annotationOperation.annotation.annotationType 
        if (['image', 'table'].indexOf(nowAnnType) >= 0) {
          this.cancleAnnotateMoshu()
        } else if (nowAnnType == 'textBlock') {
          this.cancleAnnotateTextBlock()
        }
      }

      if (['rectangle', 'polygon'].indexOf(operation.type) >= 0) {
        this.startAnnotateMoShu(newAnnotationOperation.type)
      }
      this.annotationOperation = newAnnotationOperation
      this.filterBentiMarks()
    },
    filterBentiMarks() {
      var filterBentiMarkList = []
      this.bentiMarkList.forEach((item) => {
        if (
          item.annotatedType?.image &&
          this.annotationOperation.annotation.annotationType == 'image'
        ) {
          filterBentiMarkList.push(item)
        }
        if (
          item.annotatedType?.txt &&
          this.annotationOperation.annotation.annotationType == 'textBlock'
        ) {
          filterBentiMarkList.push(item)
        }
        if (this.annotationOperation.annotation.annotationType == 'table') {
          filterBentiMarkList.push(item)
        }
      })
      this.filterBentiMarkList = filterBentiMarkList
    },

    startAnnotateMoShu(type) {
      for (var i = 1; i <= this.pdfPages; i++) {
        var moshuEl = document.getElementById('moshu' + i)
        moshuEl.style.zIndex = 3
        var moshu = this.$refs['moshu' + i]
        moshu[0].startDraw(type)
      }
    },
    cancleAnnotateMoshu() {
      for (var i = 1; i <= this.pdfPages; i++) {
        var moshuEl = document.getElementById('moshu' + i)
        moshuEl.style.zIndex = 1
        var moshu = this.$refs['moshu' + i]
        moshu[0].cancleDraw()
      }
      this.updateMarkListPopDisplay('none')
    },
    cancleAnnotateTextBlock() {
      if (document.selection) {
        document.selection.empty()
      } else if (window.getSelection) {
        window.getSelection().removeAllRanges()
      }
      this.updateMarkListPopDisplay('none')
    },
    finishMoshuAnnotationOperation(value) {
      var points = value.points
      var page = value.page

      var fId = 'p' + page
      for (var i = 0; i < points.length; i++) {
        var point = points[i]
        fId += 'x' + point.x + 'y' + point.y
      }

      var annotation = this.annotationOperation.annotation
      if (this.annotationOperation.type == 'relation') {
        this.clearRelation(annotation)

        annotation.relatedCaptionPresentation = {
          fId: fId,
          index: page,
          points: points,
          scale: this.pdfScale,
        }
        var moshu = this.$refs['moshu' + page]
        moshu[0].clearAction(false)
        moshu[0].setRelatedCaptionAnnotation(annotation)

        var previous = this.annotationOperation.previous
        this.cancleAnnotateMoshu()
        this.setAnnotationOperation(previous.operation)

        var ele = document.getElementById('pdfCanvas' + page)
        getMattingBlob(points, ele, async (blob) => {
          var fileName = annotation.presentation.fId + '.png'
          var re = await uploadMattingBlob(
            blob,
            fileName,
            '/upload/' +
              this.$route.query.id +
              '/' +
              this.$route.query.resourceId
          )
          annotation.relatedCaptionPresentation.url = re.data
          this.$emit( 'addRelationCaptionOfAnnotation', annotation)
        })
        return
      } else {
        annotation.presentation.fId = fId
        annotation.presentation.index = value.page
        annotation.presentation.points = points
        annotation.presentation.scale = this.pdfScale
      }

      var markListPopEl = document.getElementById('pdfBentiMarkListPop')
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
      var moshu = document.getElementById('moshu' + page)
      left += moshu.parentNode.offsetLeft
      top += moshu.parentNode.offsetTop
      markListPopEl.style.top = top + 'px'
      markListPopEl.style.left = left + 'px'
    },
    finishTextAnnotationOperation() {
      const selection = window.getSelection()
      const container = document.getElementById('pdfvuer')
      const range = selection.getRangeAt(0)
      const rects = range.getClientRects()
      const firstRect = rects[0]

      if (selection.toString() != '') {
        const splitContentList = [selection.anchorNode.data]
        const curNode = selection.baseNode.parentNode

        let preBrother = curNode.previousElementSibling
        while (preBrother) {
          let val = preBrother.innerText
          let lastEnIndex = val.lastIndexOf('.')
          let lastChIndex = val.lastIndexOf('。')

          if (lastEnIndex > -1) {
            splitContentList.unshift(val.substring(lastEnIndex + 1))
            preBrother = null
          } else if (lastChIndex > -1) {
            splitContentList.unshift(val.substring(lastEnIndex + 1))
            preBrother = null
          } else {
            splitContentList.unshift(val)
            preBrother = preBrother.previousElementSibling
          }
        }

        let nextBrother = curNode.nextElementSibling
        while (nextBrother) {
          let val = nextBrother.innerText
          let lastEnIndex = val.indexOf('.')
          let chIndex = val.indexOf('。')

          if (lastEnIndex > -1) {
            splitContentList.push(val.substring(lastEnIndex))
            nextBrother = null
          } else if (chIndex > -1) {
            splitContentList.push(val.substring(0, chIndex + 1))
            nextBrother = null
          } else {
            splitContentList.push(val)
            nextBrother = nextBrother.previousElementSibling
          }
        }

        var anchorNode = selection.anchorNode
        var extentNode = selection.extentNode
          ? selection.extentNode
          : selection.focusNode

        var startId = anchorNode.parentNode.id 
        var endId = extentNode.parentNode.id

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

        var annotation = this.initTextBlockAnnotation(
          selectStr,
          startId,
          startOffset,
          endId,
          endOffset,
          splitContentList.join('')
        )
        if (!annotation.presentation) {
          selection.removeAllRanges()
          return
        }

        if (this.annotationOperation.type == 'relationTxt') {
          this.clearRelation(this.annotationOperation.annotation)
          this.annotationOperation.annotation.relatedCaptionPresentation =
            annotation.presentation
          this.annotationOperation.annotation.relatedCaptionPresentation.content =
            annotation.content
          this.annotationOperation.annotation.relatedCaptionPresentation.type =
            'txt'
          this.showRelationText(this.annotationOperation.annotation)

          var previous = this.annotationOperation.previous
          this.setAnnotationOperation(previous.operation)
          return
        }

        this.annotationOperation.annotation = annotation
        var markListPopEl = document.getElementById('pdfBentiMarkListPop')
        markListPopEl.style.display = 'block'
        markListPopEl.style.top =
          firstRect.y - container.getBoundingClientRect().top + 28 + 'px'
        markListPopEl.style.left =
          firstRect.x - container.getBoundingClientRect().left + 'px'
      } else {
        var markListPopEl = document.getElementById('pdfBentiMarkListPop')
        markListPopEl.style.display = 'none'
      }
    },
    initTextBlockAnnotation(
      content,
      startTerm,
      startOffset,
      endTerm,
      endOffset,
      sen
    ) {
      var name = this.getTextAnnotationName(content)

      var reg = /\d+/g
      var startRe = startTerm.match(reg)
      if (!Array.isArray(startRe) || startRe.length < 2) {
        console.log('initTextBlockAnnotation error')
        console.log(content)
        console.log(startTerm)
        console.log(startOffset)
        console.log(endTerm)
        console.log(endOffset)

        return {}
      }
      var startPage = startRe[0]
      var startIndex = startRe[1]
      var endtRe = endTerm.match(reg)
      var endPage = endtRe[0]
      var endIndex = endtRe[1]
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
          endOffset: endOffset,
          sen,
        },
        metadata: [],
      }
    },
    getTextAnnotationName(content) {
      return content.length > 10 ? content.substring(0, 10) : content
    },

    getSelectionSentence() {
      const selection = window.getSelection()
      const anchorNode = selection.anchorNode
      const selectedText = anchorNode.parentElement.innerText
      window.selectedText = anchorNode

      var prefont = ''
      var nextfont = ''
      for (
        let node = anchorNode.parentElement.previousSibling;
        node && node.innerText.indexOf('.') == -1;
        node = node.previousSibling
      ) {
        prefont = node.innerHTML + ' ' + prefont
      }
      for (
        let node = anchorNode.parentElement.nextSibling;
        node && node.innerText.indexOf('.') == -1;
        node = node.nextSibling
      ) {
        if (node.nextSibling.innerText.indexOf('.') != -1) {
          nextfont =
            nextfont + node.innerHTML + node.nextSibling.innerHTML.split('.')[0]
        } else {
          nextfont = nextfont + node.innerHTML
        }
      }
      return prefont + selectedText + nextfont
    },
    cancleCurrentMoshuAnnotation() {
      this.updateMarkListPopDisplay('none')
      var annotation = this.annotationOperation.annotation
      annotation.presentation = {}
    },
    updateMarkListPopDisplay(value) {
      console.log('updateMarkListPopDisplay = ' + value)
      var markListPopEl = document.getElementById('pdfBentiMarkListPop')
      markListPopEl.style.display = value
    },

    async didSelectedMark(item) {
      this.updateMarkListPopDisplay('none')

      var annotation = JSON.parse(
        JSON.stringify(this.annotationOperation.annotation)
      )
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
        var moshu = this.$refs['moshu' + page]
        moshu[0].clearAction(false)

        var ele = document.getElementById('pdfCanvas' + page)
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
          annotation.url = re.data
          annotation.source = 'manual'
          this.$emit( 'getbz', annotation)
          this.showAnnotation(annotation)
        })
      } else {
        annotation.source = 'manual'
        this.$emit( 'getbz', annotation)
        this.showAnnotation(annotation)
      }
      this.annotationOperation.annotation = {
        annotationType: this.annotationOperation.annotation.annotationType,
        metadata: [],
        name: '',
        content: '',
        presentation: {},
      }
    },

    async getPdfText(pdf) {
      var contents = []
      for (let i = 0; i < pdf.numPages; i++) {
        var page = await pdf.getPage(i + 1)
        var ob = await page.getTextContent()
        contents.push(ob.items)
      }
      this.pdfContent = contents
    },

    setDefinRelation(data) {
      this.definRelationData = data
    },
    setAnnotationRelationList(list) {
      this.annotationRelationList = list
    },
    addGuanxi(item) {
      var value = {
        relationId: item.definRelationId,
        fromFId: this.addRelationAnnotations[0],
        toFId: this.addRelationAnnotations[1],
        deleted: false,
      }
      this.$emit( 'getgx', value)
      this.updateRelationMarkPopDisplay('none')
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
            var ann = getAnnotationById(item.fromId)
            if (ann && ann.presentation) {
              item.fromFId = ann.presentation
            }
          }

          if (item.toId && !item.toFId) {
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

    getAnnotationByFId(fId) {
      var annotation = undefined
      this.annotationList.forEach((item) => {
        if (item.presentation.fId == fId) {
          annotation = item
        }
      })
      return annotation
    },

    getAnnotationById(id) {
      var annotation = undefined
      this.annotationList.forEach((item) => {
        if (item.id == id) {
          annotation = item
        }
      })
      return annotation
    },
    onmouseoverannotation(fId) {
      this.setAnnotationActive(fId, true)
      this.$emit('setResourceMarkListAnnotationActive', fId, true)

      var el = document.getElementById('pdfViewer')
      var elW = el.clientWidth
      var elH = el.clientHeight

      var pageEl = document.getElementById('textLayer1')
      var pageW = pageEl.clientWidth
      var canvas = document.getElementById('pdfViewerCanvas')
      canvas.width = pageW
      canvas.height = elH
      var left = (elW - pageW) * 0.5
      left = left > 0 ? left : 0
      canvas.style.left = left + 'px'

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

      var annotation = this.getAnnotationByFId(fId)
      var relatedCaptionPresentation = annotation.relatedCaptionPresentation

      if (relatedCaptionPresentation && relatedCaptionPresentation.index > 0) {
        var points = annotation.relatedCaptionPresentation.points
        var scale = annotation.relatedCaptionPresentation.scale
        var scale = annotation.presentation.scale
        var value = this.pdfScale / scale
        var pageTextEl = document.getElementById(
          'textLayer' + relatedCaptionPresentation.index
        )
        var offsetY = pageTextEl.parentElement.offsetTop
        var relatedp = points[0]
        ctx.beginPath()
        ctx.setLineDash([])
        ctx.moveTo(startP.x, startP.y + 10)
        ctx.lineTo(relatedp.x * value, offsetY + relatedp.y * value + 10)
        ctx.strokeStyle = annotation.presentation.color
        ctx.stroke()
      }

      if (
        relatedCaptionPresentation &&
        relatedCaptionPresentation.type == 'txt'
      ) {
        var relatedp = this.getAnnotationRelationHeaderPositon(fId)
        ctx.beginPath()
        ctx.setLineDash([])
        ctx.moveTo(startP.x, startP.y + 10)
        ctx.lineTo(relatedp.x, relatedp.y + 10)
        ctx.strokeStyle = annotation.presentation.color
        ctx.stroke()
      }
    },

    getAnnotationRelationHeaderPositon(fId) {
      var el = document.getElementById('titleRelation' + fId)
      if (!el) {
        console.log('getAnnotationHeaderPositon = null')
        return
      }
      var x = 0
      var y = 0
      while (el.id != 'pdfViewer') {
        if (el.parentElement.id != 'pdfViewer') {
          x += el.offsetLeft
        }
        y += el.offsetTop
        el = el.parentElement
      }
      return { x: x, y: y }
    },
    getAnnotationHeaderPositon(fId) {
      var el = document.getElementById('title' + fId)
      if (!el) {
        console.log('getAnnotationHeaderPositon = null')
        return
      }
      var x = 0
      var y = 0
      var annotation = this.getAnnotationByFId(fId)
      if (annotation && annotation.annotationType == 'textBlock') {
        while (el.id != 'pdfViewer') {
          if (el.parentElement.id != 'pdfViewer') {
            x += el.offsetLeft
          }
          y += el.offsetTop
          el = el.parentElement
        }
      } else {
        while (el.parentElement.id != 'pdfViewer') {
          x += el.offsetLeft
          y += el.offsetTop
          el = el.parentElement
        }
      }

      return { x: x, y: y }
    },

    onmouseleaveannotation(fId) {
      var el = document.getElementById('pdfViewer')
      var pageEl = document.getElementById('textLayer1')
      var pageW = pageEl.clientWidth
      var canvas = document.getElementById('pdfViewerCanvas')
      canvas.width = pageW
      canvas.height = el.clientHeight
      var ctx = canvas.getContext('2d')
      ctx.strokeStyle = 'rgba(102,168,255,1)'
      ctx.lineWidth = 4
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.setAnnotationActive(fId, false)
      this.$emit('setResourceMarkListAnnotationActive', fId, false)
    },

    updateRelationMarkPopDisplay(display) {
      var relationPop = document.getElementById('pdfRelationListPop')
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

    setScale(scale, pdf) {
      this.pdfScale = scale

      for (var page = 1; page <= this.pdfPages; page++) {
        var moshu = this.$refs['moshu' + page]
        moshu[0].setAnnotationList([])
      }
      this.$refs.maskContainer.innerHTML = ''

      this.$nextTick(() => {
        this.finishedNum = 0
        this.renderPage(pdf, 1)
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
        var moshu = this.$refs['moshu' + page]
        moshu[0].deleteAnnotation(fId)
        if (
          annotation.relatedCaptionPresentation &&
          annotation.relatedCaptionPresentation.index > 0
        ) {
          var rePage = annotation.relatedCaptionPresentation.index
          if (rePage != page) {
            var reMoshu = this.$refs['moshu' + rePage]
            reMoshu[0].deleteAnnotation(fId)
          }
        }
      }

      if (this.idToAnnoMap[fId]) {
        delete this.idToAnnoMap[fId]
      }
    },

    async renderPage(pdf, num) {
      pdf.getPage(num).then((page) => {
        this.renderPageCanvas(page, num)
        this.renderPageTextLayer(page, num)

        var pdfWidth = page.view[2]
        var pdfHeight = page.view[3]
        var pageView = document.getElementById('page' + num)
        pageView.style =
          'margin:20px auto; width:calc(var(--scale-factor) * ' +
          pdfWidth +
          'px); height:calc(var(--scale-factor) * ' +
          pdfHeight +
          'px);'
        var textLayer = document.getElementById('textLayer' + num)
        textLayer.style =
          'margin:0 auto; width:calc(var(--scale-factor) * ' +
          pdfWidth +
          'px); height:calc(var(--scale-factor) * ' +
          pdfHeight +
          'px);'
        var moshu = document.getElementById('moshu' + num)
        moshu.style =
          'margin:0 auto; width:calc(var(--scale-factor) * ' +
          pdfWidth +
          'px); height:calc(var(--scale-factor) * ' +
          pdfHeight +
          'px);'

        if (this.pdfPages > num) {
          this.renderPage(pdf, num + 1)
        }
      })
    },

    renderPageCanvas(page, num) {
      const that = this
      let canvas = document.getElementById('pdfCanvas' + num)
      canvas.id = 'pdfCanvas' + num
      let ctx = canvas.getContext('2d')
      let dpr = window.devicePixelRatio || 1
      let bsr =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1
      let ratio = dpr / bsr
      let viewport = page.getViewport({ scale: this.baseScale * this.pdfScale })
      canvas.width = viewport.width * ratio
      canvas.height = viewport.height * ratio

      canvas.style.width = viewport.width + 'px'
      canvas.style.height = viewport.height + 'px'

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      let renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      }
      page.render(renderContext)
    },

    renderPageTextLayer(page, num) {
      this.minFontSupportedByBrowser = this.getMinFontSupportedByBrowser()
      var pageView = document.createElement('div')
      var view = page.view
      var pageWidth = view[2]
      var pageHeight = view[3]
      pageView.style.width = 'calc(var(--scale-factor) * ' + pageWidth + 'px)'
      pageView.style.height = 'calc(var(--scale-factor) * ' + pageHeight + 'px)'
      page.getTextContent().then((ob) => {
        var items = ob.items
        var styles = ob.styles
        for (var j = 0; j < items.length; j++) {
          var geom = items[j]
          var spanEle = this.getTextSpan(geom, styles, pageWidth, pageHeight)
          spanEle.id = 'p' + num + 't' + j
          this.textList.push(geom.str)
          this.spanList.push(spanEle)
          pageView.append(spanEle)
        }

        var textLayer = document.getElementById('textLayer' + num)
        textLayer.innerHTML = pageView.innerHTML

        this.finishedNum += 1

        if (this.pdfPages == this.finishedNum) {
          if (
            !this.resource.annotationList ||
            !Array.isArray(this.resource.annotationList)
          ) {
            this.resource.annotationList = []
          }
          this.setAnnotationList(this.resource.annotationList)
        }
      })
    },

    getTextSpan(geom, styles, pageWidth, pageHeight) {
      const textDiv = document.createElement('span')
      const textDivProperties = {
        angle: 0,
        canvasWidth: 0,
        hasText: geom.str !== '',
        hasEOL: geom.hasEOL,
        fontSize: 0,
      }

      var pageX = 0
      var pageY = 0
      var transform = [1, 0, 0, -1, -pageX, pageY + pageHeight]

      const tx = PDFJS.Util.transform(transform, geom.transform)
      let angle = Math.atan2(tx[1], tx[0])
      const style = styles[geom.fontName]
      if (style.vertical) {
        angle += Math.PI / 2
      }
      const fontHeight = Math.hypot(tx[2], tx[3])
      const fontAscent = fontHeight * this.getAscent(style.fontFamily, true)

      let left, top
      if (angle === 0) {
        left = tx[4]
        top = tx[5] - fontAscent
      } else {
        left = tx[4] + fontAscent * Math.sin(angle)
        top = tx[5] - fontAscent * Math.cos(angle)
      }
      const scaleFactorStr = 'calc(var(--scale-factor)*'
      const divStyle = textDiv.style
      divStyle.left = `${((100 * left) / pageWidth).toFixed(2)}%`
      divStyle.top = `${((100 * top) / pageHeight).toFixed(2)}%`
      divStyle.fontSize = `${scaleFactorStr}${fontHeight.toFixed(2)}px)`
      divStyle.fontFamily = style.fontFamily
      textDivProperties.fontSize = fontHeight

      textDiv.setAttribute('role', 'presentation')
      textDiv.textContent = geom.str
      textDiv.dir = geom.dir

      if (angle !== 0) {
        textDivProperties.angle = angle * (180 / Math.PI)
      }
      let shouldScaleText = false
      if (geom.str.length > 1) {
        shouldScaleText = true
      } else if (geom.str !== ' ' && geom.transform[0] !== geom.transform[3]) {
        const absScaleX = Math.abs(geom.transform[0]),
          absScaleY = Math.abs(geom.transform[3])
        if (
          absScaleX !== absScaleY &&
          Math.max(absScaleX, absScaleY) / Math.min(absScaleX, absScaleY) > 1.5
        ) {
          shouldScaleText = true
        }
      }
      if (shouldScaleText) {
        textDivProperties.canvasWidth = style.vertical
          ? geom.height
          : geom.width
      }

      var params = {
        prevFontSize: null,
        prevFontFamily: null,
        div: textDiv,

        scale: this.baseScale * this.pdfScale * (window.devicePixelRatio || 1),
        properties: textDivProperties,
        ctx: this.getCtx(0, true),
      }
      this.layout(params)

      return textDiv
    },

    layout(params) {
      const { div, scale, properties, ctx, prevFontSize, prevFontFamily } =
        params
      const { style } = div
      let transform = ''
      if (properties.canvasWidth !== 0 && properties.hasText) {
        const { fontFamily } = style
        const { canvasWidth, fontSize } = properties
        if (prevFontSize !== fontSize || prevFontFamily !== fontFamily) {
          ctx.font = `${fontSize * scale}px ${fontFamily}`
          params.prevFontSize = fontSize
          params.prevFontFamily = fontFamily
        }
        const { width } = ctx.measureText(div.textContent)
        if (
          div.textContent ==
          'Dynamic languages such as JavaScript are more difficult to com-'
        ) {
        }
        if (width > 0) {
          transform = `scaleX(${(canvasWidth * scale) / width})`
          
          var reg = /\d+.\d+/g
          var baseFontSize = style.fontSize.match(reg)
          baseFontSize = parseFloat(baseFontSize ? baseFontSize : 0)
          var fontSizeValue = this.baseScale * this.pdfScale * baseFontSize
          if (fontSizeValue < this.minFontSupportedByBrowser) {
            var fontScale = fontSizeValue / this.minFontSupportedByBrowser
            transform = `scaleX(${
              ((canvasWidth * scale) / width) * fontScale
            }) scaleY(${fontScale})`
          }
        }
      }
      if (properties.angle !== 0) {
        transform = `rotate(${properties.angle}deg) ${transform}`
      }
      if (transform.length > 0) {
        style.transform = transform
      }
    },
    getMinFontSupportedByBrowser() {
      var span = document.createElement('span')
      span.style.fontSize = '1px'
      document.body.append(span)
      var size = parseInt(getComputedStyle(span).fontSize)
        ? parseInt(getComputedStyle(span).fontSize)
        : 0
      document.body.removeChild(span)
      return size
    },
    getCtx(size, isOffscreenCanvasSupported) {
      let ctx
      if (isOffscreenCanvasSupported) {
        ctx = new OffscreenCanvas(size, size).getContext('2d', {
          alpha: false,
        })
      } else {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = size
        ctx = canvas.getContext('2d', {
          alpha: false,
        })
      }
      return ctx
    },
    getAscent(fontFamily, isOffscreenCanvasSupported) {
      const cachedAscent = ascentCache.get(fontFamily)
      if (cachedAscent) {
        return cachedAscent
      }
      const ctx = this.getCtx(DEFAULT_FONT_SIZE, isOffscreenCanvasSupported)
      ctx.font = `${DEFAULT_FONT_SIZE}px ${fontFamily}`
      const metrics = ctx.measureText('')
      let ascent = metrics.fontBoundingBoxAscent
      let descent = Math.abs(metrics.fontBoundingBoxDescent)
      if (ascent) {
        const ratio = ascent / (ascent + descent)
        ascentCache.set(fontFamily, ratio)
        ctx.canvas.width = ctx.canvas.height = 0
        return ratio
      }
      ctx.strokeStyle = 'red'
      ctx.clearRect(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE)
      ctx.strokeText('g', 0, 0)
      let pixels = ctx.getImageData(
        0,
        0,
        DEFAULT_FONT_SIZE,
        DEFAULT_FONT_SIZE
      ).data
      descent = 0
      for (let i = pixels.length - 1 - 3; i >= 0; i -= 4) {
        if (pixels[i] > 0) {
          descent = Math.ceil(i / 4 / DEFAULT_FONT_SIZE)
          break
        }
      }
      ctx.clearRect(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE)
      ctx.strokeText('A', 0, DEFAULT_FONT_SIZE)
      pixels = ctx.getImageData(0, 0, DEFAULT_FONT_SIZE, DEFAULT_FONT_SIZE).data
      ascent = 0
      for (let i = 0, ii = pixels.length; i < ii; i += 4) {
        if (pixels[i] > 0) {
          ascent = DEFAULT_FONT_SIZE - Math.floor(i / 4 / DEFAULT_FONT_SIZE)
          break
        }
      }
      ctx.canvas.width = ctx.canvas.height = 0
      if (ascent) {
        const ratio = ascent / (ascent + descent)
        ascentCache.set(fontFamily, ratio)
        return ratio
      }
      ascentCache.set(fontFamily, DEFAULT_FONT_ASCENT)
      return DEFAULT_FONT_ASCENT
    },

    setWords(words, definition, checkobj) {
      if (!this.pdfDoc) {
        console.log('pdf content is null')
      }
      if (this.isSearching) {
        this.$message({
          message: '正在匹配中',
          type: 'error',
        })
        return
      }
      this.regStr = ''
      this.words = words
      this.definition = definition
      this.checkobj = checkobj
      this.isSearching = true
      this.searchResult = []
      this.colorMap[definition.definitionId] = definition.color
      this.startValue = new Date().getTime()
      this.finishedNum = 0
      this.matchNumber = 0
      this.$nextTick(() => {
        this.searchPdfText(this.pdfDoc, 1)
      })
    },
    setReg(reg, definition, checkobj) {
      if (!this.pdfDoc) {
        console.log('pdf content is null')
      }
      if (this.isSearching) {
        this.$message({
          message: '正在匹配中',
          type: 'error',
        })
        return
      }
      this.regStr = reg
      this.words = ''
      this.definition = definition
      this.checkobj = checkobj
      this.isSearching = true
      this.searchResult = []
      this.colorMap[definition.definitionId] = definition.color
      this.startValue = new Date().getTime()
      this.finishedNum = 0
      this.matchNumber = 0
      this.$nextTick(() => {
        this.searchPdfText(this.pdfDoc, 1)
      })
    },

    async searchPdfText(pdf, num) {
      for (var i = 0; i < this.pdfPages; i++) {
        var page = await pdf.getPage(i + 1)
        await this.searchPageText(page, i + 1)
      }
      this.finishSearch()
    },

    async searchPageText(page, num) {
      var ob = await page.getTextContent()
      var items = ob.items
      for (var j = 0; j < items.length; j++) {
        var geom = items[j]
        await this.searchRowText(geom.str, num, j, this.definition)
        if (this.currentPage == num) {
          if (j % 6 == 0) {
            await new Promise((r) =>
              setTimeout(() => {
                r()
              }, 300)
            )
          }
        } else {
          if (j % 20 == 0) {
            await new Promise((r) =>
              setTimeout(() => {
                r()
              }, 500)
            )
          }
        }
      }
    },
    async searchRowText(content, page, spanIndex, definition) {
      var words = this.words
      var position = 'p' + page + 't' + spanIndex
      var ranges = []

      for (var n = 0; n < words.length; n++) {
        var key = words[n]
        if (key.length == 0) {
          break
        }
        
        var regStr = '\\b' + key + '\\b'
        var reg = new RegExp(regStr, 'g')
        this.startSearch(content, reg, position, definition)
      }

      if (this.regStr != '') {
        var reg = eval(this.regStr)
        this.startSearch(content, reg, position, definition)
      }
      return ranges
    },
    startSearch(content, reg, position, definition) {
      var re = content.matchAll(reg)
      var list = [...re]
      list.forEach((item) => {
        var title = item[0]
        var startOffset = item['index']
        var startOffset = item['index']
        var endOffset = startOffset + title.length
        var annotation = this.initTextBlockAnnotation(
          title,
          position,
          startOffset,
          position,
          endOffset
        )
        this.didSearchAnnotation(annotation, definition)
      })
    },
    didSearchAnnotation(annotation, definition) {
      annotation.definitionId = definition.id
      annotation.presentation.color = definition.color
      annotation.presentation.fId += definition.id
      var ann = this.getAnnotationByFId(annotation.presentation.fId)
      if (ann) {
        console.log('warning - 批量搜索--标注已存在')
        console.log(annotation)
      } else {
        annotation.source = 'manual'
        this.$emit('getbz', annotation)
        this.showAnnotation(annotation)
      }
    },
    indexOfTerm(position, terms, searchText, definitionId) {
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
      while (start >= 0) {
        const startRange = termIndexRanges.find(
          (r) => r[0] <= start && start <= r[1]
        )
        const endRange = termIndexRanges.find((r) => r[0] <= end && end <= r[1])
        var startOffset = start - startRange[0]
        var endOffset = end - endRange[0]
        var annotation = this.initTextBlockAnnotation(
          searchText,
          position,
          startOffset,
          position,
          endOffset
        )
        annotation.definitionId = definitionId
        resultIndexes.push(annotation)
        start = fullTerm.indexOf(searchText, end)
        end = Math.min(start + searchText.length, fullTerm.length - 1)
      }
      return resultIndexes
    },

    finishSearch() {
      this.isSearching = false
      this.words = []
      this.definition = {}
      this.endValue = new Date().getTime()
      var value = this.endValue - this.startValue
      this.$emit('finishedSearch')
    },
    didGetBZ(ranges, page, spanIndex, context) {
      var checkobj = this.checkobj
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i]
        var position = 'p' + page + 't' + spanIndex
        this.$emit('getbz', {
          fId: range.fId,
          word: range.keyWord,
          startTerm: position,
          startOffset: range.startOffset,
          endTerm: position,
          endOffset: range.endOffset,
          name: range.keyWord,
          context: context,
          doi: '',
          shortcutKey: checkobj.shortcutKey,
          x: 0,
          y: 0,
          selected: false,
          rects: '',
          container: '',
          source: 'manual',
          definitionId: this.definition.definitionId,
        })
      }
    },

    showAnnotation(annotation) {
      if (!annotation.presentation?.fId) {
        console.log('annotation is bad')
        return
      }
      this.idToAnnoMap[annotation.presentation.fId] = annotation
      if (annotation.annotationType == 'textBlock') {
        var startPage = annotation.presentation.startPage
        var startIndex = annotation.presentation.startIndex
        var endPage = annotation.presentation.startPage
        var endIndex = annotation.presentation.endIndex
        var content = annotation.content
        var opacity = annotation.presentation.percentage

        for (var m = startPage; m <= endPage; m++) {
          for (var n = startIndex; n <= endIndex; n++) {
            var index = 'p' + m + 't' + n
            var span = document.getElementById(index)
            var content = span.innerText
            var startOffset = 0
            var endOffset = content.length
            var isShowHeader = false
            if (m == startPage && n == startIndex) {
              startOffset = annotation.presentation.startOffset
              isShowHeader = true
            }
            if (m == endPage && n == endIndex) {
              endOffset = annotation.presentation.endOffset
            }
            var ann = this.initTextBlockAnnotation(
              content,
              index,
              startOffset,
              index,
              endOffset
            )
            ann.presentation.isShowHeader = isShowHeader
            ann.presentation.fId = annotation.presentation.fId

            var annSpan = document.createElement('span')
            annSpan.style.fontFamily = span.style.fontFamily
            annSpan.style.top = span.style.top
            annSpan.style.left = span.style.left
            annSpan.style.userSelect = 'none'
            annSpan.style.pointerEvents = 'none'
            annSpan.style.fontSize = span.style.fontSize
            annSpan.style.transform = span.style.transform

            var content = span.innerText
            var innerText = ''
            if (startOffset > 0) {
              innerText += `${content.substring(0, startOffset)}`
            }

            var biaozhuText = content.substring(startOffset, endOffset)
            var headText = biaozhuText
            if (headText.length > 10) {
              headText = headText.substring(0, 10)
            }
            var fId = annotation.presentation.fId
            var titleId = 'title' + fId
            var headId = 'head' + fId
            var deleteAnnotation = 'deleteAnnotation(' + '"' + fId + '")'

            var addGX = 'addGX("' + fId + '","' + titleId + '")'
            var onmouseoverannotation =
              'onmouseoverannotation(' + '"' + fId + '")'
            var onmouseleaveannotation =
              'onmouseleaveannotation(' + '"' + fId + '")'

            var editorAnnotation = 'editorAnnotation(' + '"' + fId + '")'
            var color = this.bentiMarkList?.find(
              (d) => d.id === annotation.definitionId
            )?.color
            var typeIconClass = 'el-icon-chat-line-round'

            var biaozhuheadClass = 'biaozhuhead'
           
            if (isShowHeader) {
              innerText += `<span class="biaozhu"><span id=${headId} onmouseleave=${onmouseleaveannotation} onmouseover=${onmouseoverannotation} class="${biaozhuheadClass}" style="border-color:${colorToRgb(color,0,opacity)}"><i class="el-icon" style="color: #333"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="m174.72 855.68 135.296-45.12 23.68 11.84C388.096 849.536 448.576 864 512 864c211.84 0 384-166.784 384-352S723.84 160 512 160 128 326.784 128 512c0 69.12 24.96 139.264 70.848 199.232l22.08 28.8-46.272 115.584zm-45.248 82.56A32 32 0 0 1 89.6 896l58.368-145.92C94.72 680.32 64 596.864 64 512 64 299.904 256 96 512 96s448 203.904 448 416-192 416-448 416a461.056 461.056 0 0 1-206.912-48.384l-175.616 58.56z"></path><path fill="currentColor" d="M352 576h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32m32-192h256q32 0 32 32t-32 32H384q-32 0-32-32t32-32"></path></svg></i><span onclick=${addGX} id=${titleId}>${headText}${opacity?' ('+(opacity*100)+'%)':''}</span><i class="el-icon" onclick=${editorAnnotation}
              }"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"></path><path fill="currentColor" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path></svg></i><i class="el-icon" onclick=${deleteAnnotation}
              }"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path></svg></i></span><span style="background:${colorToRgb(color,0,opacity)};opacity:0.5;position:relative">${biaozhuText}</span></span>`
            } else {
              innerText += `<span onclick=${addGX} class="biaozhu"><span style="background:${ colorToRgb(color,0,opacity)};opacity:0.5;position:relative">${biaozhuText}</span></span>`
            }
            if (endOffset != -1 && endOffset < content.length) {
              innerText += content.substring(endOffset, content.length)
            }
            annSpan.innerHTML = innerText
            annSpan.className = annotation.presentation.fId + ' annotation'

            annSpan.onselectstart = function () {
              console.log('标注字段 禁止选中文字')
              return false
            }
            annSpan.onmousedown = function () {
              console.log('标注字段 禁止选中文字')
              return false
            }
            span.parentElement.appendChild(annSpan)
          }
        }
      } else {
        var headerEl = this.createMoShuAnnotationHeader(annotation)
        this.$refs.maskContainer.append(headerEl)

        var page = annotation.presentation.index
        var moshu = this.$refs['moshu' + page]
        moshu[0].getNewAnnotation(annotation)

        var relationOb = annotation.relatedCaptionPresentation
        if (relationOb && relationOb.type == 'txt') {
          this.showRelationText(annotation)
        }
        if (relationOb && relationOb.index != page && relationOb.index >= 0) {
          var moshu1 = this.$refs['moshu' + relationOb.index]
          moshu1[0].setRelatedCaptionAnnotation(annotation)
        }
        var pagetToMSAnnoMap = this.pagetToMSAnnoMap
        var pageToMSList = pagetToMSAnnoMap[page + '']
          ? pagetToMSAnnoMap[page + '']
          : []
        pageToMSList.push(annotation)
        pagetToMSAnnoMap[page + ''] = pageToMSList
      }
    },
    createMoShuAnnotationHeader(annotation) {
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
      var moshu = document.getElementById(
        'moshu' + annotation.presentation.index
      )

      var scale = annotation.presentation.scale
      var value = this.pdfScale / scale
      left = left * value
      top = top * value
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
        borderLeft: '5px solid ' + hintBorderColor,
      })
      var fId = annotation.presentation.fId
      var titleId = 'title' + fId
      var addGX = 'addGX("' + fId + '","' + titleId + '")'

      var onmouseoverannotation = 'onmouseoverannotation(' + '"' + fId + '")'
      var onmouseleaveannotation = 'onmouseleaveannotation(' + '"' + fId + '")'
      let typeIconSvg =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M160 160v704h704V160zm-32-64h768a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H128a32 32 0 0 1-32-32V128a32 32 0 0 1 32-32"></path><path fill="currentColor" d="M384 288q64 0 64 64t-64 64q-64 0-64-64t64-64M185.408 876.992l-50.816-38.912L350.72 556.032a96 96 0 0 1 134.592-17.856l1.856 1.472 122.88 99.136a32 32 0 0 0 44.992-4.864l216-269.888 49.92 39.936-215.808 269.824-.256.32a96 96 0 0 1-135.04 14.464l-122.88-99.072-.64-.512a32 32 0 0 0-44.8 5.952z"></path></svg>'
      if (annotation.annotationType == 'textBlock') {
        typeIconSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="m174.72 855.68 135.296-45.12 23.68 11.84C388.096 849.536 448.576 864 512 864c211.84 0 384-166.784 384-352S723.84 160 512 160 128 326.784 128 512c0 69.12 24.96 139.264 70.848 199.232l22.08 28.8-46.272 115.584zm-45.248 82.56A32 32 0 0 1 89.6 896l58.368-145.92C94.72 680.32 64 596.864 64 512 64 299.904 256 96 512 96s448 203.904 448 416-192 416-448 416a461.056 461.056 0 0 1-206.912-48.384l-175.616 58.56z"></path><path fill="currentColor" d="M352 576h320q32 0 32 32t-32 32H352q-32 0-32-32t32-32m32-192h256q32 0 32 32t-32 32H384q-32 0-32-32t32-32"></path></svg>'
      } else if (annotation.annotationType == 'table') {
        typeIconSvg =
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M640 384v256H384V384zm64 0h192v256H704zm-64 512H384V704h256zm64 0V704h192v192zm-64-768v192H384V128zm64 0h192v192H704zM320 384v256H128V384zm0 512H128V704h192zm0-768v192H128V128z"></path></svg>'
      }

      hintEl.innerHTML =
        `<i style="padding-right:4px" class="el-icon">${typeIconSvg}</i>` +
        '<span onmouseleave=' +
        onmouseleaveannotation +
        ' onmousemove=' +
        onmouseoverannotation +
        ' id="' +
        titleId +
        '" onclick=' +
        addGX +
        '>' +
        annotation.name +
        '</span>' +
        '<i onclick=addTxtRelationAnnotation("' +
        fId +
        '") class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M256 768h672a32 32 0 1 1 0 64H224a32 32 0 0 1-32-32V96a32 32 0 0 1 64 0z"></path><path fill="currentColor" d="M832 224v704a32 32 0 1 1-64 0V256H96a32 32 0 0 1 0-64h704a32 32 0 0 1 32 32"></path></svg></i>' +
        '<i onclick=addRelationAnnotation("' +
        fId +
        '") class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M256 768h672a32 32 0 1 1 0 64H224a32 32 0 0 1-32-32V96a32 32 0 0 1 64 0z"></path><path fill="currentColor" d="M832 224v704a32 32 0 1 1-64 0V256H96a32 32 0 0 1 0-64h704a32 32 0 0 1 32 32"></path></svg></i>' +
        '<i onclick=editorAnnotation("' +
        fId +
        '") class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"></path><path fill="currentColor" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path></svg></i>' +
        '<i onclick=deleteAnnotation("' +
        fId +
        '") class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path></svg></i>'
      hintEl.id = 'head' + fId
      hintEl.className = fId + ' biaozhuhead'

      return hintEl
    },
    clearRelation(annotation) {
      if (!annotation) {
        console.log('clearRelation annotation is null')
        return
      }
      var relationOb = annotation.relatedCaptionPresentation
        ? annotation.relatedCaptionPresentation
        : {}
      var fId = annotation.presentation.fId
      if (relationOb && relationOb.type && relationOb.type == 'txt') {
        var list = document.getElementsByClassName('relation' + fId)
        do {
          if (list && list.length > 0) {
            var el = list[0]
            el.remove()
          }
        } while (list.length > 0)
      }
      if (relationOb && relationOb.index && relationOb.index >= 0) {
        var page = relationOb.index
        var moshu = this.$refs['moshu' + page]
        annotation.relatedCaptionPresentation = {}
        moshu[0].setRelatedCaptionAnnotation(annotation)
      }
      annotation.relatedCaptionPresentation = {}
    },

    showRelationText(annotation) {
      var relationPresentation = annotation.relatedCaptionPresentation

      var { startPage, startIndex, endPage, endIndex, content } =
        relationPresentation

      for (var m = startPage; m <= endPage; m++) {
        for (var n = startIndex; n <= endIndex; n++) {
          var index = 'p' + m + 't' + n
          var span = document.getElementById(index)
          var content = span.innerText
          var startOffset = 0
          var endOffset = content.length
          if (m == startPage && n == startIndex) {
            startOffset = relationPresentation.startOffset
          }
          if (m == endPage && n == endIndex) {
            endOffset = relationPresentation.endOffset
          }
          var annSpan = document.createElement('span')
          annSpan.style.fontFamily = span.style.fontFamily
          annSpan.style.top = span.style.top
          annSpan.style.left = span.style.left
          annSpan.style.fontSize = span.style.fontSize
          annSpan.style.transform = span.style.transform

          var content = span.innerText
          var innerText = ''
          if (startOffset > 0) {
            innerText += `${content.substring(0, startOffset)}`
          }

          var biaozhuText = content.substring(startOffset, endOffset)
          var headText = biaozhuText
          if (headText.length > 10) {
            headText = headText.substring(0, 10)
          }
          var fId = annotation.presentation.fId
          var color = annotation.presentation.color

          var titleId = ''
          if (m == startPage && n == startIndex) {
            titleId = 'titleRelation' + fId
          }
          innerText += `<span id=${titleId} class="biaozhu"><span style="background:${color};opacity:0.5;position:relative">${biaozhuText}</span></span>`

          if (endOffset != -1 && endOffset < content.length) {
            innerText += content.substring(endOffset, content.length)
          }
          annSpan.innerHTML = innerText
          annSpan.className =
            'relation' + annotation.presentation.fId + ' annotation'
          span.parentElement.appendChild(annSpan)
        }
      }
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
    refineSen() {
      let annotationList = this.resource.annotationList

      annotationList.forEach((item, index) => {
        console.log(item)
        if (item.annotationType === 'textBlock') {
          const presentation = item.presentation
          const divId = presentation.fId.split('s')?.[0]
          const splitContentList = [presentation.content]
          const curNode = document.getElementById(divId)
          if (curNode != null) {
            let preBrother = curNode.previousElementSibling
            while (preBrother) {
              let val = preBrother.innerText
              let lastEnIndex = val.lastIndexOf('.')
              let lastChIndex = val.lastIndexOf('。')

              if (lastEnIndex > -1) {
                splitContentList.unshift(val.substring(lastEnIndex + 1))
                preBrother = null
              } else if (lastChIndex > -1) {
                splitContentList.unshift(val.substring(lastEnIndex + 1))
                preBrother = null
              } else {
                splitContentList.unshift(val)
                preBrother = preBrother.previousElementSibling
              }
            }

            let nextBrother = curNode.nextElementSibling
            while (nextBrother) {
              let val = nextBrother.innerText
              let lastEnIndex = val.indexOf('.')
              let chIndex = val.indexOf('。')

              if (lastEnIndex > -1) {
                splitContentList.push(val.substring(lastEnIndex))
                nextBrother = null
              } else if (chIndex > -1) {
                splitContentList.push(val.substring(0, chIndex + 1))
                nextBrother = null
              } else {
                splitContentList.push(val)
                nextBrother = nextBrother.previousElementSibling
              }
            }

            this.resource.annotationList[index].presentation.sen =
              splitContentList.join('')
          }
        }
      })
      return annotationList
    },
  }
}
</script>

<style lang="scss">
.pdf-viewer {
  background: #e5e5e5;
  h1 {
    margin: 30px auto;
    text-align: center;
    font-family: '宋体';
    letter-spacing: 2px;
  }
  .pdf-viewer-canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
  .page {
    direction: ltr;
    width: 816px;
    height: 1056px;
    margin: var(--page-margin);
    margin: auto;
    position: relative;
    overflow: visible;
    border: 1px solid #e5e5e5;
    background-clip: content-box;
    background-color: rgba(255, 255, 255, 1);
    margin: 20px auto;
  }
  .textLayer {
    position: absolute;
    text-align: initial;
    inset: 0;
    margin: auto;
    overflow: hidden;
    opacity: 1;
    line-height: 1;
    -webkit-text-size-adjust: none;
    -moz-text-size-adjust: none;
    text-size-adjust: none;
    forced-color-adjust: none;
    transform-origin: 0 0;
    z-index: 2;
    background: rgb(0, 0, 0, 0);
    ::selection {
      background: lightblue;
      color: #000;
    }
    ::-moz-selection {
      background: lightblue;
      color: #000;
    }
    span {
      color: transparent;
      position: absolute;
      white-space: pre;
      cursor: text;
      transform-origin: 0% 0%;
    }
    .annotation {
      pointer-events: none;
    }
    .biaozhu {
      background: rgb(155, 232, 243, 0.5);
      position: relative;
      opacity: 1;

      .biaozhuhead {
        pointer-events: all;
        border: 1px solid rgb(155, 232, 243);
        border-width: 1px 1px 1px 5px;
        padding: 5px;
        position: absolute;
        top: -20px;
        left: 0px;
        height: 15px;
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
          font-size: 14px;
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
  .biaozhuhead {
    font-size: 14px;
    i {
      padding-right: 4px;
    }
    i:hover {
      cursor: pointer;
    }
  }

  .moshu {
    position: absolute;
    text-align: initial;
    inset: 0;
    margin: auto;
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
  .canvasWrapper {
    overflow: hidden;
    width: 100%;
    height: 100%;
    z-index: 1;
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
::selection {
  background: lightblue;
  color: #000;
}
::-moz-selection {
  background: lightblue;
  color: #000;
}
</style>
