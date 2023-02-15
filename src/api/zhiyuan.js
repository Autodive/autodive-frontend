import request from '@/utils/request'

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

//确认导入
export function insertBatch(data) {
  return request({
    url: '/resource/insertBatch',
    method: 'post',
    data,
    noqs:true
  })
}

//指派
export function resourcesAssign(data) {
  return request({
    url: '/resource/resourcesAssign',
    method: 'post',
    data,
  })
}
//指派人员
export function findListByUserName(params) {
  return request({
    url: '/oauth/findListByUserName',
    method: 'get',
    params,
  })
}
//资源类型
export function gettype(params) {
  return request({
    url: '/resource/type',
    method: 'get',
    params,
  })
}


//doi
export function searchResourcesByDoi(data) {
  return request({
    url: '/resource/searchResourcesByDoi',
    method: 'post',
    data,
    noqs:true
  })
}
//文本框检索
export function searchResources(data) {
  return request({
    url: '/resource/searchResources',
    method: 'post',
    data,
  })
}
