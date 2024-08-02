import request from 'axios'

export function createGAPLog(data) {
  return request({
    url: `/gap-log`,
    method: 'post',
    data,
  })
}
export function getGAPLogList(params) {
  return request({
    url: `/gap-log`,
    method: 'get',
    params,
  })
}
export function delGAPLog(id) {
  return request({
    url: `/gap-log/${id}`,
    method: 'delete',
  })
}
export function editGAPLog(data, id) {
  return request({
    url: `/gap-log/${id}`,
    method: 'put',
    data
  })
}
