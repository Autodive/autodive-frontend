import request from '@/utils/request'

export function getshiti(params) {
  return request({
    url: '/ontology/defin',
    method: 'get',
    params,
  })
}
export function addshiti(data) {
  return request({
    url: '/ontology/defin',
    method: 'post',
    data,
  })
}
export function editshiti(data) {
  return request({
    url: '/ontology/defin',
    method: 'put',
    data,
  })
}

export function delshiti(id) {
  return request({
    url: '/ontology/defin/'+id,
    method: 'delete',
  })
}


export function getguanxi(params) {
  return request({
    url: '/ontology/relation',
    method: 'get',
    params,
  })
}
export function addguanxi(data) {
  return request({
    url: '/ontology/relation',
    method: 'post',
    data,
  })
}
export function editguanxi(data) {
  return request({
    url: '/ontology/relation',
    method: 'put',
    data,
  })
}

export function delguanxi(id) {
  return request({
    url: '/ontology/relation/'+id,
    method: 'delete',
  })
}

//关联
export function getgl(params) {
  return request({
    url: '/ontology/definRelation',
    method: 'get',
    params,
  })
}
export function addgl(data) {
  return request({
    url: '/ontology/definRelation',
    method: 'post',
    data,
  })
}
export function editgl(data) {
  return request({
    url: '/ontology/definRelation',
    method: 'put',
    data,
  })
}

export function delgl(id) {
  return request({
    url: '/ontology/definRelation/'+id,
    method: 'delete',
  })
}

//加入收藏
export function addstsc(data) {
  return request({
    url: '/ontology/defin/collect',
    method: 'post',
    data,
  })
}
export function delstsc(data) {
  return request({
    url: '/ontology/defin/cancelCollect',
    method: 'post',
    data,
  })
}
export function addgxsc(data) {
  return request({
    url: '/ontology/relation/collect',
    method: 'post',
    data,
  })
}
export function delgxsc(data) {
  return request({
    url: '/ontology/relation/cancelCollect',
    method: 'post',
    data,
  })
}
