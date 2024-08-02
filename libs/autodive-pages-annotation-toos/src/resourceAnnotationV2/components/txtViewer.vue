<template>
  <span
    id="preview-txt"
    class="preview-txt"
    :style="`margin:0 auto;width:${txtWidth};`"
  >
    content
  </span>
</template>

<script>
const PDFJS = require('pdfjs-dist/legacy/build/pdf')
const DEFAULT_FONT_SIZE = 30
const DEFAULT_FONT_ASCENT = 0.8
const ascentCache = new Map()
PDFJS.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.js'
export default {
  name: 'PDFViewer',
  props: {
    didMatchRange: {
      type: Function,
      default: null,
    },
    isEdit: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      txtWidth: '300px',
      content: '',

      colorMap: {},
      rangesMap: {},

      isSearching: false,
      definition: {},
      searchResult: [],
      words: [],
      startValue: 0,
      endValue: 0,
      matchNumber: 0,
    }
  },
  mounted() {
    window.delBZ = function (e) {
      this.delBiaoZhu(e)
    }
  },
  methods: {
    setContent(content) {
      this.content = content
    },

    openText(val) {
      let xhr = new XMLHttpRequest()
      xhr.open('GET', 'text.txt', false)
      xhr.overrideMimeType('text/html;charset=utf-8')
      xhr.send(null)
      console.log(xhr.responseText)
      this.content = xhr.responseText
    },

    setWords(words, definition) {
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
      this.words = words
      this.definition = definition
      this.isSearching = true
      this.searchResult = []
      this.colorMap[definition.definitionId] = definition.color
      this.startValue = new Date().getTime()
      this.finishedNum = 0
      this.matchNumber = 0
      var containDiv = document.createElement('div')
      this.$nextTick(() => {
        this.updateTextLayer(this.pdfDoc, 1, containDiv)
      })
    },
    delBiaoZhu(e) {
      var biaozhuEl = document.getElementById(e)
      biaozhuEl.replaceWith(biaozhuEl.lastChild)
    },
    finishSearch() {
      console.log('finishSearch')
      this.isSearching = false
      this.words = []
      this.definition = {}
      this.endValue = new Date().getTime()
      var value = this.endValue - this.startValue
      alert('' + value + '-' + this.matchNumber)
    },

    updateTextLayer(pdf, num, containDiv) {
      pdf.getPage(num).then((page) => {
        this.renderPageTextLayer(page, num, containDiv)
        if (this.pdfPages > num) {
          this.updateTextLayer(pdf, num + 1, containDiv)
        }
      })
    },

    renderPage(pdf, num, containDiv) {
      pdf.getPage(num).then((page) => {
        this.renderPageCanvas(page, num)
        this.renderPageTextLayer(page, num, containDiv)
        if (this.pdfPages > num) {
          this.renderPage(pdf, num + 1, containDiv)
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

      that.pdfWidth = viewport.width + 'px'

      canvas.style.height = viewport.height + 'px'

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      let renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      }
      page.render(renderContext)
    },

    renderPageTextLayer(page, num, containDiv) {
      var pageView = document.createElement('div')
      pageView.id = 'pdfPageLayer' + num
      pageView.className = 'pdftextLayer'
      containDiv.append(pageView)

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
          this.addBiaoZhuForSpan(spanEle, geom.str, num, j)
          this.textList.push(geom.str)
          this.spanList.push(spanEle)
          pageView.append(spanEle)
        }
        this.finishedNum += 1
        console.log('page=' + num)
        console.log(containDiv.childNodes)

        if (this.pdfPages == this.finishedNum) {
          var pdfView = document.getElementById('pdfTextViewer')
          pdfView.innerHTML = containDiv.innerHTML

          if (this.isSearching) {
            this.finishSearch()
          }
        }
      })
    },

    addBiaoZhuForSpan(span, content, page, spanIndex) {
      var ranges = this.rangesMap[page + '-' + spanIndex]
      ranges = ranges ? ranges : []

      if (this.words && this.words.length > 0) {
        var sortRanges = this.getSortRangesForSpanWithWords(
          this.words,
          content,
          this.definition.definitionId
        )
        ranges = this.insertToSortRange(ranges, sortRanges)
        this.rangesMap[page + '-' + spanIndex] = ranges
      }

      var innerText = ''
      for (var m = 0; m < ranges.length; m++) {
        var r = ranges[m]
        if (m == 0 && r.startOffset > 0) {
          innerText += `${content.substring(0, r.startOffset)}`
        }

        var biaozhuText = content.substring(r.startOffset, r.endOffset)
        var delBZ =
          'delBZ(' +
          '"' +
          page +
          '.' +
          spanIndex +
          '.' +
          r.startOffset +
          '-' +
          r.endOffset +
          '")'
        var biaozhuId =
          +page + '.' + spanIndex + '.' + r.startOffset + '-' + r.endOffset
        var color = this.colorMap[r.definitionId]

        innerText += `<span id=${biaozhuId} class="biaozhu"><span class="biaozhuhead"><span>${biaozhuText}</span><span class="biaozhuheadx" onclick=${delBZ}>x</span></span>${biaozhuText}</span>`
        if (m == ranges.length - 1 && r.endOffset < content.length) {
          innerText += content.substring(r.endOffset, content.length)
        }
      }

      if (innerText.length == 0) {
        span.innerHTML = content
      } else {
        span.innerHTML = innerText
      }
    },
    getSortRangesForSpanWithWords(words, spanText, definitionId) {
      var ranges = []
      for (var n = 0; n < words.length; n++) {
        var key = words[n]
        var resultRanges = this.indexOfTerm([spanText], key, definitionId)
        this.matchNumber += resultRanges.length
        ranges = this.insertToSortRange(ranges, resultRanges)
      }
      return ranges
    },
    insertToSortRange(sortRanges, ranges) {
      for (var i = 0; i < ranges.length; i++) {
        var range = ranges[i]
        var index = -1
        var isRepeat = false
        for (var j = 0; j < sortRanges.length; j++) {
          var item = sortRanges[j]
          if (item.startOffset > range.startOffset && index < 0) {
            index = j
          }
          if (item.id == range.id) {
            isRepeat = true
            break
          }
        }
        if (isRepeat) {
          break
        }
        if (index >= 0) {
          sortRanges.splice(j, 0, range)
        } else {
          sortRanges.push(range)
        }
      }
      return sortRanges
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
        if (width > 0) {
          transform = `scaleX(${(canvasWidth * scale) / width})`
        }
      }
      if (properties.angle !== 0) {
        transform = `rotate(${properties.angle}deg) ${transform}`
      }
      if (transform.length > 0) {
        style.transform = transform
      }
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

    indexOfTerm(terms, searchText, definitionId) {
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
        resultIndexes.push({
          startTerm: startRange[2],
          startOffset: startOffset,
          endTerm: endRange[2],
          endOffset: endOffset,
          keyWord: searchText,
          definitionId: definitionId,
          id:
            searchText +
            '/' +
            startRange[2] +
            '.' +
            startOffset +
            '-' +
            endRange[2] +
            '.' +
            endOffset,
        })
        start = fullTerm.indexOf(searchText, end)
        end = Math.min(start + searchText.length, fullTerm.length - 1)
      }
      return resultIndexes
    },
  },
}
</script>

<style lang="scss">
.preview-pdf {
  h1 {
    margin: 30px auto;
    text-align: center;
    font-family: '宋体';
    letter-spacing: 2px;
  }
  .page {
    direction: ltr;
    width: 816px;
    height: 1056px;
    margin: auto;
    position: relative;
    overflow: visible;
    border: var(--page-border);
    background-clip: content-box;
    background-color: rgba(255, 255, 255, 1);
  }
  .pdftextLayer {
    position: relative;
    text-align: initial;
    inset: 0;
    margin: auto;
    overflow: hidden;
    line-height: 1;
    -webkit-text-size-adjust: none;
    -moz-text-size-adjust: none;
    text-size-adjust: none;
    forced-color-adjust: none;
    transform-origin: 0 0;
    margin-bottom: 5px;
    background: rgb(0, 0, 0, 0);
    span {
      color: transparent;
      position: absolute;
      white-space: pre;
      cursor: text;
      transform-origin: 0% 0%;
    }
    .biaozhu {
      background: rgb(155, 232, 243, 0.5);
      position: relative;
      opacity: 1;

      .biaozhuhead {
        border: 1px solid rgb(155, 232, 243);
        border-width: 1px 1px 1px 5px;
        padding: 5px 10px;
        position: absolute;
        top: -20px;
        left: 0px;
        height: 15px;
        width: calc(100% + 20px);
        max-width: 100px;
        background: white;
        z-index: 999;
        white-space: nowrap;
        border-radius: 6px;

        span {
          position: absolute;
          color: #333;
          width: calc(100% - 20px);
          height: calc(100% - 10px);
          max-width: 40px;
          height: 100%;
          font-size: 14px;
          line-height: 100%;
          overflow: hidden;
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
}
.popView {
  background: white;
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 5px;
  border: 1px solid #e5e5e5;
  z-index: 999;
}
</style>
