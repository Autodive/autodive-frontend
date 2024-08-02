import request from 'axios'


export function getindex(params) {
  return request({
    url: '/project/index/'+params.id,
    method: 'get',
    params,
  })
}
export function getAllLabel(params) {
  return request({
    url: '/project/getAllLabel',
    method: 'get',
    params,
  })
}
export function getSingleLabel(params) {
  return request({
    url: '/project/getSingleLabel',
    method: 'get',
    params,
  })
}
export function getsearch(params) {
  return request({
    url: '/project/search',
    method: 'get',
    params,
  })
}
