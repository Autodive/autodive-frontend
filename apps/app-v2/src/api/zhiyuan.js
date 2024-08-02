import request from 'axios'

export function addzhiyuan(data) {
  return request({
    url: '/resource',
    method: 'post',
    data,
  })
}
export function editzhiyuan(data) {
  return request({
    url: '/resource',
    method: 'put',
    data,
  })
}
export function getzhiyuan(params) {
  return request({
    url: '/resource',
    method: 'get',
    params,
  })
}
export function getzhiyuansearch(params) {
  return request({
    url: '/resource/search',
    method: 'get',
    params,
  })
}
export function delzhiyuan(id) {
  return request({
    url: '/resource/'+id,
    method: 'delete',
  })
}
export function multipleInsertResource(data) {
  return request({
    url: '/resource/multiple',
    method: 'post',
    data,
    noqs:true
  })
}
export function batchInsertResource(data) {
  const list = ['synergies', 'behavioralIntent']
  let type = data.type || ''
  if (list.indexOf(type) > -1 ) {
    delete data.doi
  }
  return request({
    url: '/resource/batch',
    method: 'post',
    data,
    noqs:true
  })
}

export function insertResource(data) {
  const list = ['synergies', 'behavioralIntent']
  let type = data.type || ''
  if (list.indexOf(type) > -1 ) {
    delete data.doi
  }
  return request({
    url: '/resource',
    method: 'post',
    data,
    noqs:true
  })
}

export function insertBatch(data) {
  return request({
    url: '/resource/insertBatch',
    method: 'post',
    data,
    noqs:true
  })
}

export function resourcesAssign(data) {
  return request({
    url: '/resource/resourcesAssign',
    method: 'post',
    data,
  })
}
export function findListByUserName(params) {
  return request({
    url: '/oauth/findListByUserName',
    method: 'get',
    params,
  })
}
export function gettype(params) {
  return request({
    url: '/resource/type',
    method: 'get',
    params,
  })
}

export function searchResourcesByDoi(data) {
  return request({
    url: '/resource/searchResourcesByDoi',
    method: 'post',
    data,
    noqs:true
  })
}
export function searchResources(data) {
  return request({
    url: '/resource/searchResources',
    method: 'post',
    data,
  })
}

export function getResourceDetail(resourceId) {
  return request({
    url: '/resource/'+resourceId,
    method: 'get',
  })
}

export function updateTool(data) {
  return request({
    url: '/resource/updateTool',
    method: 'put',
    data
  })
}


export function getResourceStats(resourceId, layerId) {
  return request({
    url: `/resource/${resourceId}/layer/${layerId}/stats`,
    method: 'get',
  })
}

export function ziyuanSetClassify(params) {
  return request({
    url: '/resource/resourcesAssess',
    method: 'get',
    params,
  })
}