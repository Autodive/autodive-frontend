import request from 'axios'

export async function uploadTxtStr(txt, url) {
  var blob = new Blob([txt], {
    type: "text/plain"
  })
  const params = new FormData()
  var file = new File([blob], "文本.txt", { type: "text/plain", lastModified: Date.now() })
  params.append('file', file)
console.log(request, 'reques-----')
  return request.post(url, params, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': '*/*',
      'Authorization': ''
    }
  });
}


