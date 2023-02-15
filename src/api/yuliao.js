import request from '@/utils/request'

export function addresources(data) {
  return request({
    url: '/layer/resourcesDefinition',
    method: 'post',
    data,
    noqs:true
  })
}
export function getresources(params) {
  return request({
    url: '/layer/resourcesDefinition',
    method: 'get',
    params,
  })
}

export function addresourcesDefinRelation(data) {
  return request({
    url: '/layer/resourcesDefinRelation',
    method: 'post',
    data,
    noqs:true
  })
}
export function getresourcesDefinRelation(params) {
  return request({
    url: '/layer/resourcesDefinRelation',
    method: 'get',
    params,
  })
}

export function complete(params) {
  return request({
    url: '/layer/resourcesDefinition/complete',
    method: 'get',
    params
  })
}
