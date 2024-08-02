import request from 'axios'

export function addproject(data) {
  return request({
    url: '/project',
    method: 'post',
    data,
  })
}
export function editproject(data) {
  return request({
    url: '/project',
    method: 'put',
    data,
  })
}
export function getproject(params) {
  return request({
    url: '/project',
    method: 'get',
    params,
  })
}
export function delproject(id) {
  return request({
    url: '/project/'+id,
    method: 'delete',
  })
}
export function getprojectInfo(id) {
  return request({
    url: '/project/'+id,
    method: 'get',
  })
}