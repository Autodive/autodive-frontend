import request from 'axios'

export function extrTxt(data) {
  return request({
    url: '/extr/txt',
    method: 'post',
    data
  })
}
export function extrPdf(data) {
  return request({
    url: '/extr/pdf',
    method: 'post',
    data,
  })
}

export function extrSynergies(data) {
  return request({
    url: '/extr/synergies',
    method: 'post',
    data,
  })
}
