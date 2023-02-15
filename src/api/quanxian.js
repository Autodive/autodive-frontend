import request from '@/utils/request'

export function addqx(data) {
  return request({
    url: '/permission',
    method: 'post',
    data,
  })
}
export function editqx(data) {
  return request({
    url: '/permission/'+data.id,
    method: 'put',
    data,
  })
}
export function getqxinfor(params) {
  return request({
    url: '/permission/'+params.id,
    method: 'get',
    params,
  })
}
export function getqx(params) {
  return request({
    url: '/permission/list/'+params.projectId,
    method: 'get',
    params
  })
}

export function getxmqx(params) {
  return request({
    url: '/permission/current/'+params.projectId,
    method: 'get',
    params
  })
}

export function invite(data) {
  return request({
    url: '/invite',
    method: 'post',
    data,
  })
}
export function invitelist(params) {
  return request({
    url: '/invite/'+params.projectId,
    method: 'get',
    params
  })
}
export function qxinvite(id) {
  return request({
    url: '/invite/refuse/'+id,
    method: 'get'
  })
}
