import request from 'axios'
export async function uploadMattingBlob(blob, fileName, url) {
  const params = new FormData() 
  var file = new File([blob], fileName, {
    type: 'image/png',
    lastModified: Date.now(),
  })
  params.append('file', file)
  return request.post(url, params, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: '*/*',
      Authorization: '',
    },
  })
}

export function getMattingBlob(points, element, complete) {
  var minX = 0,
    maxX = 0,
    minY = 0,
    maxY = 0

  points.forEach((item, index) => {
    if (index == 0) {
      minX = item.x
      maxX = item.x
      minY = item.y
      maxY = item.y
    } else {
      minX = item.x > minX ? minX : item.x
      maxX = item.x > maxX ? item.x : maxX
      minY = item.y > minY ? minY : item.y
      maxY = item.y > maxY ? item.y : maxY
    }
  })

  var width = maxX - minX
  var height = maxY - minY

  var newCanvas = document.createElement('canvas')
  newCanvas.width = width
  newCanvas.height = height
  var ctx = newCanvas.getContext('2d')
  ctx.beginPath()
  console.log('el.size=' + element.clientWidth + 'px' + element.clientHeight)

  console.log('matting points=')
  console.log(points)
  points.forEach((item, index) => {
    if (index == 0) {
      ctx.moveTo(item.x - minX, item.y - minY)
    } else {
      ctx.lineTo(item.x - minX, item.y - minY)
    }
    console.log(item.x - minX, item.y - minY)
  })
  ctx.clip()
  var devicePixelRatio = window.devicePixelRatio
  console.log(element)
  if (element.nodeName == 'IMG') {
    devicePixelRatio = 1
  }
  ctx.drawImage(
    element,
    minX * devicePixelRatio,
    minY * devicePixelRatio,
    width * devicePixelRatio,
    height * devicePixelRatio,
    0,
    0,
    width,
    height
  )
  console.log('drawImage=')
  console.log(minX, minY, width, height, 0, 0, width, height)
  newCanvas.toBlob(
    (blob) => {
      console.log('toBlob')
      console.log(blob)
      complete(blob)
    },
    'image/png',
    1
  )
}
