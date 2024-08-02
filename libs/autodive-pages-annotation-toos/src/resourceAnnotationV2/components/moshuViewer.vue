<template>
  <div style="width:100%,height:100%">
    <div class="ms-bz">
      <canvas class="ms-bz-canvas" :id="'msbzcanvas' + page"></canvas>
    </div>
    <canvas class="ms-util-canvas copy" :id="'utilcanvas' + page"></canvas>
  </div>
</template>

<script>
export default {
  name: 'moshuViewer',
  props: {
    page: {
      type: Number,
      default: 1
    },
    currentScale: {
      typeof: Number,
      default: 1
    }
  },
  data() {
    return {
      ctx: '',
      oIndex: -1,
      pointArr: [],
      isStart: false,
      drawType: '', 

      bzctx: '',
      annotationList: []
    }
  },
  mounted() {
    var that = this
    var canvas = document.getElementById('utilcanvas' + this.page)

    canvas.addEventListener(
      'contextmenu',
      function (e) {
        that.clearAction(false)
        this.$emit('cancleCurrentMoshuAnnotation')
        e.preventDefault()
      },
      false
    )

    canvas.addEventListener(
      'mousedown',
      async function (e) {
        console.log('onmousedown')
        if (e.offsetX || e.layerX) {
          var pointX = e.offsetX == undefined ? e.layerX : e.offsetX
          var pointY = e.offsetY == undefined ? e.layerY : e.offsetY
          if (that.drawType == 'polygon') {
            if (that.pointArr.length == 0) {
              that.clickPolygonCanvas(pointX, pointY)
            }
          } else {
            that.clickRectangleCanvas(pointX, pointY)
          }
        }
      },
      true
    )
    canvas.addEventListener(
      'mouseup',
      async function (e) {
        console.log('onmouseup')
        console.log(that.isStart)
        if (!that.isStart) return
        if (e.offsetX || e.layerX) {
          var pointX = e.offsetX == undefined ? e.layerX : e.offsetX
          var pointY = e.offsetY == undefined ? e.layerY : e.offsetY
          if (that.drawType == 'polygon') {
            if (that.pointArr.length >= 1) {
              that.clickPolygonCanvas(pointX, pointY)
            }
          } else {
            that.clickRectangleCanvas(pointX, pointY)
          }
        }
      },
      true
    )

    canvas.addEventListener(
      'mousemove',
      async function (e) {
        if (!that.isStart) return
        if (e.offsetX || e.layerX) {
          var pointX = e.offsetX == undefined ? e.layerX : e.offsetX
          var pointY = e.offsetY == undefined ? e.layerY : e.offsetY
          if (that.drawType == 'polygon') {
            that.polygonMousemove(pointX, pointY)
          } else {
            that.rectangleMousemove(pointX, pointY)
          }
        }
      },
      true
    )
  },
  methods: {
    startDraw(type) {
      console.log('startDraw')
      this.updateCtx()
      this.oIndex = -1
      this.pointArr = []
      this.drawType = type
    },

    cancleDraw() {
      this.clearAction(false)
    },
    updateCtx() {
      var canvas = document.getElementById('utilcanvas' + this.page)
      canvas.width = canvas.parentNode.clientWidth
      canvas.height = canvas.parentNode.clientHeight
      console.log('canvas.width ')
      console.log(canvas.width)
      console.log('canvas.height ')
      console.log(canvas.height)
      var ctx = canvas.getContext('2d')
      ctx.strokeStyle = 'rgba(102,168,255,1)'
      ctx.lineWidth = 4 
      this.ctx = ctx
    },

    clickCanvas(e) {
      if (!this.isStart && this.pointArr.length > 0) {
        this.clearAction(true)
        this.$emit('cancleCurrentMoshuAnnotation')
        return
      }

      if (e.offsetX || e.layerX) {
        var pointX = e.offsetX == undefined ? e.layerX : e.offsetX
        var pointY = e.offsetY == undefined ? e.layerY : e.offsetY
        if (this.drawType == 'polygon') {
          if (this.pointArr.length >= 2) {
            console.log('this.pointArr.length>=2')
            console.log(this.pointArr)
            this.clickPolygonCanvas(pointX, pointY)
          }
        }
      }
    },

    clickPolygonCanvas(pointX, pointY) {
      var piX, piY
      var pointArr = this.pointArr

      if (pointArr.length == 1) {
        if (
          (pointX - pointArr[0].x < -15 || pointX - pointArr[0].x > 15) &&
          (pointY - pointArr[0].y > 15 || pointY - pointArr[0].y < -15)
        ) {
          var canvas = document.getElementById('utilcanvas' + this.page)
          canvas.className = 'ms-util-canvas normal'
        } else {
          this.clearAction(false)
          return
        }
      }

      if (this.oIndex > 0 && pointArr.length > 0) {
        piX = pointArr[0].x
        piY = pointArr[0].y
        this.makearc(
          this.ctx,
          piX,
          piY,
          this.GetRandomNum(2, 2),
          0,
          180,
          'rgba(102,168,255,1)'
        )
        pointArr.push({ x: piX, y: piY })
        this.finishDraw()
      } else {
        piX = pointX
        piY = pointY
        this.isStart = true
        this.makearc(
          this.ctx,
          piX,
          piY,
          this.GetRandomNum(2, 2),
          0,
          180,
          'rgba(102,168,255,1)'
        )
        pointArr.push({ x: piX, y: piY })
      }
    },

    clickRectangleCanvas(pointX, pointY) {
      if (!this.isStart && this.pointArr.length > 0) {
        this.clearAction(false)
        this.$emit('cancleCurrentMoshuAnnotation')
        return
      }
      this.isStart = true

      console.log('clickRectangleCanvas')

      var pointArr = this.pointArr
      if (pointArr.length == 1) {
        if (
          (pointX - pointArr[0].x < -15 || pointX - pointArr[0].x > 15) &&
          (pointY - pointArr[0].y > 15 || pointY - pointArr[0].y < -15)
        ) {
        } else {
          this.clearAction(false)
          return
        }
      }

      this.makearc(
        this.ctx,
        pointX,
        pointY,
        this.GetRandomNum(2, 2),
        0,
        180,
        'rgba(102,168,255,1)'
      )
      var pointArr = this.pointArr
      pointArr.push({ x: pointX, y: pointY })
      if (pointArr.length == 2) {
        var point1 = pointArr[0]
        var point2 = pointArr[1]
        this.pointArr = [
          { x: point1.x, y: point1.y },
          { x: point2.x, y: point1.y },
          { x: point2.x, y: point2.y },
          { x: point1.x, y: point2.y },
          { x: point1.x, y: point1.y }
        ]
        this.finishDraw()
      }
    },

    polygonMousemove(pointX, pointY) {
      var piX, piY
      var ctx = this.ctx
      var pointArr = this.pointArr
      var canvas = document.getElementById('utilcanvas' + this.page)

      if (pointArr.length > 0) {
        if (
          pointX > pointArr[0].x - 15 &&
          pointX < pointArr[0].x + 15 &&
          pointY > pointArr[0].y - 15 &&
          pointY < pointArr[0].y + 15
        ) {
          if (pointArr.length > 1) {
            piX = pointArr[0].x
            piY = pointArr[0].y
            this.oIndex = 1
          }
        } else {
          piX = pointX
          piY = pointY
          this.oIndex = -1
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        this.makearc(
          ctx,
          pointX,
          pointY,
          this.GetRandomNum(4, 4),
          0,
          180,
          'rgba(102,168,255,1)'
        )
        ctx.beginPath()
        ctx.moveTo(pointArr[0].x, pointArr[0].y)
        if (pointArr.length > 1) {
          for (var i = 1; i < pointArr.length; i++) {
            ctx.lineTo(pointArr[i].x, pointArr[i].y)
          }
        }
        ctx.lineTo(piX, piY)
        ctx.fillStyle = 'rgba(161,195,255,0.5)' 
        ctx.fill()
        ctx.stroke()
      }
    },
    rectangleMousemove(pointX, pointY) {
      console.log('rectangleMousemove')
      if (this.oIndex == 1) {
        return
      }
      var ctx = this.ctx
      var pointArr = this.pointArr
      var canvas = document.getElementById('utilcanvas' + this.page)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (pointArr[0]) {
        ctx.beginPath()
        this.drawRectangle(pointArr[0], { x: pointX, y: pointY })
      } else {
        this.makearc(
          ctx,
          pointX,
          pointY,
          this.GetRandomNum(2, 2),
          0,
          180,
          'rgba(102,168,255,1)'
        )
      }
    },
    drawRectangle(point1, point2) {
      var canvas = document.getElementById('utilcanvas' + this.page)
      var ctx = this.ctx
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.moveTo(point1.x, point1.y)
      ctx.lineTo(point1.x, point2.y)
      ctx.lineTo(point2.x, point2.y)
      ctx.lineTo(point2.x, point1.y)
      ctx.lineTo(point1.x, point1.y)
      ctx.fillStyle = 'rgba(161,195,255,0.5)'
      ctx.fill()
      ctx.stroke()
    },

    finishDraw() {
      this.isStart = false
      var value = {
        points: this.pointArr,
        page: this.page
      }
      this.oIndex = -1
      var canvas = document.getElementById('utilcanvas' + this.page)
      canvas.className = 'ms-util-canvas copy'
      this.$emit('finishMoshuAnnotationOperation', value)
    },
    clearAction(isStart) {
      this.pointArr = []
      this.oIndex = -1
      this.isStart = isStart
      var canvas = document.getElementById('utilcanvas' + this.page)
      canvas.className = 'ms-util-canvas copy'
      this.ctx && this.ctx.clearRect(0, 0, canvas.width, canvas.height)
    },

    setAnnotationList(data) {
      if (data == null || !Array.isArray(data)) return
      this.annotationList = data
      this.darwAnnotations()
    },

    updateAnnotationDisplay(annotation) {
      var ind = this.annotationList.findIndex(
        (item) => item.presentation.fId == annotation.presentation.fId
      )
      if (!annotation.isClose && ind < 0) {
        this.annotationList.push(annotation)
      }
      if (annotation.isClose && ind >= 0) {
        this.annotationList.splice(ind, 1)
      }
      this.darwAnnotations()
    },

    setRelatedCaptionAnnotation(annotation) {
      var ind = this.annotationList.findIndex(
        (item) => item.presentation.fId == annotation.presentation.fId
      )
      if (ind >= 0) {
        this.annotationList[ind] = annotation
      } else {
        this.annotationList.push(annotation)
      }
      this.darwAnnotations()
    },

    getNewAnnotation(annotation) {
      this.annotationList.push(annotation)
      this.darwAnnotations()
    },
    deleteAnnotation(fId) {
      console.log('moshuviewer deleteAnnotation')
      let ind = this.annotationList.findIndex(
        (item) => item.presentation.fId == fId
      )

      if (ind != -1) {
        this.annotationList.splice(ind, 1)
      }
      console.log(this.annotationList)
      this.darwAnnotations()
    },

    darwAnnotations() {
      var msbzcanvas = document.getElementById('msbzcanvas' + this.page)
      msbzcanvas.width = msbzcanvas.parentNode.clientWidth
      msbzcanvas.height = msbzcanvas.parentNode.clientHeight
      var bzctx = msbzcanvas.getContext('2d')
      bzctx.strokeStyle = 'rgba(102,168,255,1)' 
      bzctx.lineWidth = 4
      bzctx.clearRect(0, 0, msbzcanvas.width, msbzcanvas.height)

      for (var i = 0; i < this.annotationList.length; i++) {
        var annotation = this.annotationList[i]
        console.log('drawAnnotation' + i)
        console.log(annotation)
        this.drawAnnotation(annotation, bzctx)
      }
    },

    drawAnnotation(annotation, bzctx) {
      bzctx.beginPath()
      if (
        annotation.presentation &&
        annotation.presentation.index == this.page
      ) {
        var points = annotation.presentation.points
        var scale = annotation.presentation.scale
        var value = this.currentScale / scale
        if (points == null || !Array.isArray(points)) return
        for (var i = 0; i < points.length; i++) {
          var point = points[i]
          if (i == 0) {
            bzctx.moveTo(point.x * value, point.y * value)
          } else {
            bzctx.lineTo(point.x * value, point.y * value)
          }
        }
      }

      if (
        annotation.relatedCaptionPresentation &&
        annotation.relatedCaptionPresentation.index == this.page
      ) {
        var points = annotation.relatedCaptionPresentation.points
        var scale = annotation.relatedCaptionPresentation.scale
        var value = this.currentScale / scale
        if (points == null || !Array.isArray(points)) return
        for (var i = 0; i < points.length; i++) {
          var point = points[i]
          if (i == 0) {
            bzctx.moveTo(point.x * value, point.y * value)
          } else {
            bzctx.lineTo(point.x * value, point.y * value)
          }
        }
      }

      bzctx.strokeStyle = annotation.presentation.color
      bzctx.fillStyle = annotation.presentation.color
      bzctx.globalAlpha = 0.4
      bzctx.fill()
      bzctx.stroke()
    },

    isCanvasBlank(canvas) {
      var blank = document.createElement('canvas') 
      blank.width = canvas.width
      blank.height = canvas.height
      return canvas.toDataURL() == blank.toDataURL() 
    },

    GetRandomNum(Min, Max) {
      var Range = Max - Min
      var Rand = Math.random()
      return Min + Math.round(Rand * Range)
    },
    makearc(ctx, x, y, r, s, e, color) {
      ctx.beginPath()
      ctx.fillStyle = color
      ctx.arc(x, y, r, s, e)
      ctx.fill()
    },

    addBiaozhuHeader(bz) {}
  }
}
</script>

<style lang="scss">
.ms-bz {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 1;
  .ms-bz-canvas {
    width: 100%;
    height: 100%;
  }
}
.copy {
  cursor: copy;
}
.nomarl {
  cursor: pointer;
}
.ms-util-canvas {
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 2;
}
</style>
