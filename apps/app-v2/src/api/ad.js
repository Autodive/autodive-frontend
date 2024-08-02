import request from 'axios'

export function getList(data) {
  return request({
    url: '/ad/getList',
    method: 'get',
    data,
  })
}
